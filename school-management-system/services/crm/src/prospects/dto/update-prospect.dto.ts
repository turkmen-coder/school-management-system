import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateProspectDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('TR')
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'QUALIFIED', 'INTERESTED', 'NEGOTIATING', 'CONVERTED', 'LOST', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsIn(['INITIAL_CONTACT', 'QUALIFIED', 'INTERESTED', 'CONSIDERING', 'NEGOTIATING', 'ENROLLED'])
  stage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}