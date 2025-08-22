import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+90\d{10}$/, {
    message: 'Phone number must be in format: +905XXXXXXXXX',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, {
    message: 'OTP code must be 6 digits',
  })
  code: string;
}