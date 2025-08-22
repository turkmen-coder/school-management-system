import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as twilio from 'twilio';

interface OtpStore {
  code: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private otpStore: Map<string, OtpStore> = new Map();
  private readonly maxAttempts = 3;
  private readonly otpExpiry = 180000; // 3 minutes in milliseconds
  // private twilioClient: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    // Initialize Twilio client when ready
    // this.twilioClient = twilio(
    //   this.configService.get('TWILIO_ACCOUNT_SID'),
    //   this.configService.get('TWILIO_AUTH_TOKEN'),
    // );
  }

  async generateAndSendOtp(phone: string): Promise<boolean> {
    const code = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.otpExpiry);

    // Store OTP
    this.otpStore.set(phone, {
      code,
      expiresAt,
      attempts: 0,
    });

    await this.sendSms(phone, code);
    return true;
  }

  private async sendSms(phone: string, code: string): Promise<void> {
    if (this.configService.get('NODE_ENV') === 'production') {
      // In production, use SMS service
      const smsProvider = this.configService.get('SMS_PROVIDER', 'development');
      
      if (smsProvider === 'iletimerkezi') {
        // Implementation for İletimerkezi
        console.log(`[SMS] Sending OTP ${code} to ${phone} via İletimerkezi`);
      } else if (smsProvider === 'netgsm') {
        // Implementation for NetGSM
        console.log(`[SMS] Sending OTP ${code} to ${phone} via NetGSM`);
      }
    } else {
      // In development, log the OTP
      console.log(`[DEV] OTP for ${phone}: ${code}`);
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const storedOtp = this.otpStore.get(phone);

    if (!storedOtp) {
      return false;
    }

    // Check if OTP is expired
    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(phone);
      return false;
    }

    // Check attempts
    if (storedOtp.attempts >= this.maxAttempts) {
      this.otpStore.delete(phone);
      return false;
    }

    // Increment attempts
    storedOtp.attempts++;

    // Verify code
    if (storedOtp.code === code) {
      this.otpStore.delete(phone);
      return true;
    }

    return false;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Clean up expired OTPs periodically
  async cleanupExpiredOtps(): Promise<void> {
    const now = new Date();
    for (const [phone, otp] of this.otpStore.entries()) {
      if (now > otp.expiresAt) {
        this.otpStore.delete(phone);
      }
    }
  }
}