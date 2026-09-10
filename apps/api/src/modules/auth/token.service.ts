import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN, DatabaseType } from '../../database/database.module';
import { refresh_tokens, users, user_mahal_roles } from '../../database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { JwtPayload } from '@maheall/shared';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(DATABASE_TOKEN) private readonly db: DatabaseType,
  ) {}

  /**
   * Create access + refresh token pair for a user.
   * mahal_id is the primary Mahal context for this session.
   */
  async createTokenPair(
    userId: string,
    phone: string,
    mahalId: string,
    roles: string[],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: userId,
      phone,
      mahal_id: mahalId,
      roles,
    };

    const accessToken = this.jwtService.sign(payload);

    // Refresh token is a random string, stored hashed
    const refreshTokenRaw = this.generateSecureToken();
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.insert(refresh_tokens).values({
      user_id: userId,
      token_hash: refreshTokenHash,
      expires_at: expiresAt,
    });

    return { accessToken, refreshToken: refreshTokenRaw };
  }

  async rotateRefreshToken(
    userId: string,
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const now = new Date();

    const tokens = await this.db
      .select()
      .from(refresh_tokens)
      .where(
        and(
          eq(refresh_tokens.user_id, userId),
          gt(refresh_tokens.expires_at, now),
          isNull(refresh_tokens.revoked_at),
        )
      );

    let validToken = null;
    for (const token of tokens) {
      if (await bcrypt.compare(rawRefreshToken, token.token_hash)) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Revoke old token
    await this.db
      .update(refresh_tokens)
      .set({ revoked_at: now })
      .where(eq(refresh_tokens.id, validToken.id));

    // Get user and roles
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0] || !user[0].is_active) {
      throw new UnauthorizedException('User account is inactive.');
    }

    const roles = await this.db
      .select()
      .from(user_mahal_roles)
      .where(
        and(
          eq(user_mahal_roles.user_id, userId),
          eq(user_mahal_roles.is_active, true),
        )
      );

    if (roles.length === 0) {
      throw new UnauthorizedException('No active roles found.');
    }

    const primaryRole = roles[0]!;

    return this.createTokenPair(
      userId,
      user[0].phone,
      primaryRole.mahal_id,
      roles.map(r => r.role),
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.db
      .update(refresh_tokens)
      .set({ revoked_at: new Date() })
      .where(
        and(
          eq(refresh_tokens.user_id, userId),
          isNull(refresh_tokens.revoked_at),
        )
      );
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.webcrypto.getRandomValues(array);
    return Buffer.from(array).toString('base64url');
  }
}