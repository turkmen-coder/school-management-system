import { PartialType } from '@nestjs/mapped-types';
import { CreateParentDto } from './create-parent.dto';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateParentDto extends PartialType(CreateParentDto) {
  @IsOptional()
  @IsString()
  @Length(11, 11)
  tcKimlikNo?: string;
}