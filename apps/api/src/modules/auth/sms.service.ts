import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(phone: string, otp: string): Promise<void> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY');

    // In development without SMS credentials, log the OTP
    if (!authKey) {
      this.logger.warn(`[DEV MODE] OTP for ${phone}: ${otp}`);
      return;
    }

    const templateId = this.configService.getOrThrow<string>('MSG91_TEMPLATE_ID');

    try {
      await axios.post(
        'https://api.msg91.com/api/v5/otp',
        {
          template_id: templateId,
          mobile: phone.replace('+', ''),  // MSG91 expects without +
          authkey: authKey,
          otp,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phone}`, error);
      // Don't expose SMS errors to the client — fail silently and log
      // The user will not receive an OTP; they can request again
      throw new Error('Failed to send OTP. Please try again.');
    }
  }
}