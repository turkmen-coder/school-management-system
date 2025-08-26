import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('TR')
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class OtpLoginDto {
  @IsPhoneNumber('TR')
  phone: string;

  @IsString()
  @MinLength(4)
  otp: string;
}

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}