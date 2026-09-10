import {
  Controller, Post, Body, Req, Res,
  HttpCode, HttpStatus, UseGuards, Get,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { HttpRequest, HttpReply } from '../../common/types/http';
import { sendOtpSchema, verifyOtpSchema } from '@maheall/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { JwtPayload } from '@maheall/shared';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('send-otp')
  @Throttle({ short: { limit: 3, ttl: 1000 }, medium: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async sendOtp(
    @Body(new ZodValidationPipe(sendOtpSchema)) body: { phone: string },
  ) {
    return this.authService.sendOtp(body);
  }

  @Post('verify-otp')
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema)) body: { phone: string; otp: string },
    @Req() req: HttpRequest,
    @Res({ passthrough: true }) res: HttpReply,
  ) {
    const rawForwarded = req.headers['x-forwarded-for'];
    const ipAddress = (Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded) ?? req.ip ?? 'unknown';
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = (Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader) ?? 'unknown';

    const result = await this.authService.verifyOtp(body, ipAddress, userAgent);

    // Set refresh token as httpOnly cookie — never exposed to JavaScript
    res.setCookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,  // 7 days in seconds
      path: '/api/v1/auth/refresh',
    });

    return {
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        requiresConsent: result.requiresConsent,
      },
    };
  }

  @Post('consent')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async recordConsent(
    @Req() req: HttpRequest & { user: JwtPayload },
  ) {
    const rawForwarded = req.headers['x-forwarded-for'];
    const ipAddress = (Array.isArray(rawForwarded) ? rawForwarded[0] : rawForwarded) ?? req.ip ?? 'unknown';
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = (Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader) ?? 'unknown';

    await this.authService.recordConsent(
      req.user.sub,
      req.user.mahal_id,
      ipAddress,
      userAgent,
    );

    return { success: true, message: 'Consent recorded.' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: HttpRequest,
    @Res({ passthrough: true }) res: HttpReply,
  ) {
    const cookies = req.cookies as Record<string, string>;
    const refreshToken = cookies?.['refresh_token'];
    if (!refreshToken) {
      return res.status(401).send({ success: false, error: 'No refresh token.' });
    }

    const authHeader = Array.isArray(req.headers.authorization)
      ? req.headers.authorization[0]
      : req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).send({ success: false, error: 'No authorization header.' });
    }

    const expiredToken = authHeader.slice(7);
    const decoded = JSON.parse(
      Buffer.from(expiredToken.split('.')[1]!, 'base64url').toString()
    ) as JwtPayload;

    const tokens = await this.tokenService.rotateRefreshToken(decoded.sub, refreshToken);

    res.setCookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/v1/auth/refresh',
    });

    return { success: true, data: { accessToken: tokens.accessToken } };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: HttpRequest & { user: JwtPayload },
    @Res({ passthrough: true }) res: HttpReply,
  ) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return { success: true, message: 'Logged out successfully.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: HttpRequest & { user: JwtPayload }) {
    return {
      success: true,
      data: {
        id: req.user.sub,
        phone: req.user.phone,
        mahal_id: req.user.mahal_id,
        roles: req.user.roles,
      },
    };
  }
}