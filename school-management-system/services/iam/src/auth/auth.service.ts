import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async requestOtp(phone: string) {
    // Normalize phone number
    const normalizedPhone = this.normalizePhone(phone);
    
    // Generate and send OTP
    await this.otpService.generateAndSendOtp(normalizedPhone);
    
    return { message: 'OTP sent successfully', phone: normalizedPhone };
  }

  async verifyOtp(phone: string, otp: string) {
    const normalizedPhone = this.normalizePhone(phone);
    
    // Verify OTP
    const isValid = await this.otpService.verifyOtp(normalizedPhone, otp);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.usersService.findByPhone(normalizedPhone);
    
    if (!user) {
      // Auto-register new user
      user = await this.usersService.create({
        phone: normalizedPhone,
        role: 'PARENT', // Default role
      });
    }

    const tokens = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    
    return tokens;
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle Turkish phone numbers
    if (digits.startsWith('90')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+9${digits}`;
    } else if (digits.length === 10) {
      return `+90${digits}`;
    }
    
    throw new BadRequestException('Invalid phone number format');
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
      
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      campusIds: user.campusIds || [],
    };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        tenantId: user.tenantId,
        campusIds: user.campusIds,
      },
    };
  }
}