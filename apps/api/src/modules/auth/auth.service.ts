import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import {
  users,
  user_mahal_roles,
  privacy_consents,
} from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { TokenService } from './token.service';
import type { SendOtpDto, VerifyOtpDto } from '@maheall/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly tokenService: TokenService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const otp = await this.otpService.generateOtp(dto.phone);
    await this.smsService.sendOtp(dto.phone, otp);
    return { message: 'OTP sent successfully.' };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; phone: string; name: string | null };
    requiresConsent: boolean;
  }> {
    await this.otpService.verifyOtp(dto.phone, dto.otp);

    // Find or create user
    let user = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, dto.phone))
      .limit(1)
      .then(r => r[0]);

    let isNewUser = false;
    if (!user) {
      const inserted = await this.db
        .insert(users)
        .values({ phone: dto.phone, is_verified: true })
        .returning();
      user = inserted[0]!;
      isNewUser = true;
    } else {
      await this.db
        .update(users)
        .set({ is_verified: true, last_login_at: new Date() })
        .where(eq(users.id, user.id));
    }

    // Get active roles
    const roles = await this.db
      .select()
      .from(user_mahal_roles)
      .where(
        and(
          eq(user_mahal_roles.user_id, user.id),
          eq(user_mahal_roles.is_active, true),
        )
      );

    if (roles.length === 0 && !isNewUser) {
      // User exists but has no roles — this is valid (app user not yet registered)
    }

    const primaryRole = roles[0];
    const mahalId = primaryRole?.mahal_id ?? '';
    const roleNames = roles.map(r => r.role);

    const { accessToken, refreshToken } = await this.tokenService.createTokenPair(
      user.id,
      user.phone,
      mahalId,
      roleNames,
    );

    // Check if privacy consent has been given
    const hasConsent = mahalId ? await this.db
      .select()
      .from(privacy_consents)
      .where(
        and(
          eq(privacy_consents.user_id, user.id),
          eq(privacy_consents.mahal_id, mahalId),
        )
      )
      .limit(1)
      .then(r => r.length > 0) : true;

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, phone: user.phone, name: user.name },
      requiresConsent: !hasConsent,
    };
  }

  async recordConsent(
    userId: string,
    mahalId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    // Upsert consent record (DPDPA compliance)
    await this.db
      .insert(privacy_consents)
      .values({
        user_id: userId,
        mahal_id: mahalId,
        consent_version: '1.0',
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .onConflictDoNothing();
  }

  async logout(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }
}