import { randomBytes } from 'crypto';

export class TokenUtil {
  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  static generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  static isOTPValid(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }
}