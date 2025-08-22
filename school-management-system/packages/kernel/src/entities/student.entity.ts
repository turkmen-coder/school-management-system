import { BaseEntity } from './base.entity';
import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  campusId: z.string().uuid(),
  schoolYear: z.string().regex(/^\d{4}-\d{4}$/),
  tcNo: z.string().length(11),
  studentNo: z.string().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthDate: z.date(),
  gender: z.enum(['M', 'F']),
  classLevel: z.number().min(1).max(12),
  status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).default('ACTIVE'),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type StudentData = z.infer<typeof StudentSchema>;

export class Student extends BaseEntity {
  public tenantId: string;
  public campusId: string;
  public schoolYear: string;
  public tcNo: string;
  public studentNo?: string;
  public firstName: string;
  public lastName: string;
  public birthDate: Date;
  public gender: 'M' | 'F';
  public classLevel: number;
  public status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';

  constructor(data: Partial<StudentData>) {
    super(data.id);
    this.tenantId = data.tenantId || '';
    this.campusId = data.campusId || '';
    this.schoolYear = data.schoolYear || '';
    this.tcNo = data.tcNo || '';
    this.studentNo = data.studentNo;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.birthDate = data.birthDate || new Date();
    this.gender = data.gender || 'M';
    this.classLevel = data.classLevel || 1;
    this.status = data.status || 'ACTIVE';
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  public activate(): void {
    this.status = 'ACTIVE';
    this.updateTimestamp();
  }

  public deactivate(): void {
    this.status = 'INACTIVE';
    this.updateTimestamp();
  }

  public graduate(): void {
    this.status = 'GRADUATED';
    this.updateTimestamp();
  }

  public transfer(): void {
    this.status = 'TRANSFERRED';
    this.updateTimestamp();
  }

  public toJSON(): StudentData {
    return {
      id: this.id,
      tenantId: this.tenantId,
      campusId: this.campusId,
      schoolYear: this.schoolYear,
      tcNo: this.tcNo,
      studentNo: this.studentNo,
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      gender: this.gender,
      classLevel: this.classLevel,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}