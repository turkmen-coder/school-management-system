import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+90\d{10}$/, {
    message: 'Phone number must be in format: +905XXXXXXXXX',
  })
  phone: string;
}