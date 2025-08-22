import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  tenantId: string;
  status: string;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEnrollmentDto {
  studentId: string;
  classId: string;
  tenantId: string;
  enrollmentDate?: Date;
}

export interface UpdateEnrollmentDto {
  status?: string;
  enrollmentDate?: Date;
}

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { tenantId, studentId, classId, enrollmentDate } = createEnrollmentDto;

    // Check if student exists
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });

    if (!student) {
      throw new NotFoundException('Öğrenci bulunamadı');
    }

    // Check if class exists
    const classRoom = await this.prisma.class.findFirst({
      where: { id: classId, tenantId },
    });

    if (!classRoom) {
      throw new NotFoundException('Sınıf bulunamadı');
    }

    // Check if enrollment already exists
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        classId,
        tenantId,
        status: 'ACTIVE',
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Öğrenci bu sınıfa zaten kayıtlı');
    }

    return this.prisma.enrollment.create({
      data: {
        studentId,
        classId,
        tenantId,
        enrollmentDate: enrollmentDate || new Date(),
        status: 'ACTIVE',
        createdAt: new Date(),
      },
      include: {
        student: true,
        class: true,
        academicYear: true,
      },
    });
  }

  async findAll(tenantId: string, page = 1, limit = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = { tenantId };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
        { student: { tcKimlikNo: { contains: search } } },
        { class: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrollmentDate: 'desc' },
        include: {
          student: true,
          class: true,
          academicYear: true,
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, tenantId },
      include: {
        student: {
          include: {
            parents: {
              include: {
                parent: true,
              },
            },
          },
        },
        class: {
          include: {
            teacher: true,
          },
        },
        academicYear: true,
        grades: true,
        attendances: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Kayıt bulunamadı');
    }

    return enrollment;
  }

  async update(id: string, tenantId: string, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.findOne(id, tenantId);

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        ...updateEnrollmentDto,
        updatedAt: new Date(),
      },
      include: {
        student: true,
        class: true,
        academicYear: true,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const enrollment = await this.findOne(id, tenantId);

    // Soft delete - set status to INACTIVE
    return this.prisma.enrollment.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
    });
  }

  async getByStudent(studentId: string, tenantId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId, tenantId },
      include: {
        class: true,
        academicYear: true,
        grades: true,
        attendances: true,
      },
      orderBy: { enrollmentDate: 'desc' },
    });
  }

  async getByClass(classId: string, tenantId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId, tenantId, status: 'ACTIVE' },
      include: {
        student: {
          include: {
            parents: {
              include: {
                parent: true,
              },
            },
          },
        },
        grades: true,
        attendances: true,
      },
      orderBy: { student: { lastName: 'asc' } },
    });
  }
}