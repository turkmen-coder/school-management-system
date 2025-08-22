import { IsUUID, IsEnum } from 'class-validator';

export enum RelationshipType {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  GUARDIAN = 'GUARDIAN',
  GRANDMOTHER = 'GRANDMOTHER',
  GRANDFATHER = 'GRANDFATHER',
  AUNT = 'AUNT',
  UNCLE = 'UNCLE',
  OTHER = 'OTHER',
}

export class AssignStudentDto {
  @IsUUID()
  studentId: string;

  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;
}