import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsIn } from 'class-validator';

export class CreateProspectDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber('TR')
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'WALK_IN', 'PHONE_CALL', 'EMAIL', 'EVENT', 'PARTNER', 'OTHER'])
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}