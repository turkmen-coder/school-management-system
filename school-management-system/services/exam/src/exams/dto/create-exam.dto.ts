import { IsString, IsDateString, IsInt, IsUUID } from 'class-validator';

export class CreateExamDto {
  @IsString()
  name: string;

  @IsUUID()
  campusId: string;

  @IsDateString()
  date: string;

  @IsInt()
  duration: number;
}