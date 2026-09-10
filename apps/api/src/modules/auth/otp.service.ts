import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { otp_sessions } from '../../database/schema';
import { eq, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS, OTP_COOLDOWN_MINUTES } from '@maheall/shared';

@Injectable()
export class OtpService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  /**
   * Generate a 6-digit OTP, enforce rate limiting, and store a hashed version.
   * Rate limit: max 5 OTPs per phone per 15-minute window.
   */
  async generateOtp(phone: string): Promise<string> {
    await this.enforceRateLimit(phone);

    const otp = this.generateSixDigitOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate previous OTPs for this phone
    await this.db
      .delete(otp_sessions)
      .where(
        and(
          eq(otp_sessions.phone, phone),
          gt(otp_sessions.expires_at, new Date()),
        )
      );

    await this.db.insert(otp_sessions).values({
      phone,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
    });

    return otp;
  }

  /**
   * Verify an OTP. Increments attempt counter. Max 5 attempts.
   * Returns the session record or throws.
   */
  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const now = new Date();

    const sessions = await this.db
      .select()
      .from(otp_sessions)
      .where(
        and(
          eq(otp_sessions.phone, phone),
          gt(otp_sessions.expires_at, now),
        )
      )
      .orderBy(otp_sessions.created_at)
      .limit(1);

    if (sessions.length === 0) {
      throw new BadRequestException('OTP expired or not found. Please request a new one.');
    }

    const session = sessions[0]!;

    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      await this.db.delete(otp_sessions).where(eq(otp_sessions.id, session.id));
      throw new HttpException('Too many incorrect OTP attempts. Please request a new one.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Increment attempt before checking — prevents timing attacks
    await this.db
      .update(otp_sessions)
      .set({ attempts: session.attempts + 1 })
      .where(eq(otp_sessions.id, session.id));

    const isValid = await bcrypt.compare(otp, session.otp_hash);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP.');
    }

    // OTP verified — delete the session
    await this.db.delete(otp_sessions).where(eq(otp_sessions.id, session.id));

    return true;
  }

  private async enforceRateLimit(phone: string): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - OTP_COOLDOWN_MINUTES * 60 * 1000);

    // Count recent OTPs for this phone
    const recentOtps = await this.db
      .select()
      .from(otp_sessions)
      .where(
        and(
          eq(otp_sessions.phone, phone),
          gt(otp_sessions.created_at, windowStart),
        )
      );

    if (recentOtps.length >= OTP_MAX_ATTEMPTS) {
      throw new HttpException(
        `Too many OTP requests. Please wait ${OTP_COOLDOWN_MINUTES} minutes before trying again.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }

  private generateSixDigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}