import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ProspectFiltersDto {
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'QUALIFIED', 'INTERESTED', 'NEGOTIATING', 'CONVERTED', 'LOST', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsIn(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'WALK_IN', 'PHONE_CALL', 'EMAIL', 'EVENT', 'PARTNER', 'OTHER'])
  source?: string;

  @IsOptional()
  @IsIn(['INITIAL_CONTACT', 'QUALIFIED', 'INTERESTED', 'CONSIDERING', 'NEGOTIATING', 'ENROLLED'])
  stage?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScore?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}