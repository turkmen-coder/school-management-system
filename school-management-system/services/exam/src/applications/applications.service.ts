import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';

export interface CreateApplicationDto {
  examId: string;
  prospectId?: string;
  studentId?: string;
  tenantId: string;
}

export interface UpdateApplicationDto {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  score?: number;
  notes?: string;
}

export interface ApplicationFiltersDto {
  examId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const { tenantId, examId, prospectId, studentId } = createApplicationDto;

    // Validate that either prospect or student is provided
    if (!prospectId && !studentId) {
      throw new ConflictException('Başvuru için öğrenci veya aday bilgisi gereklidir');
    }

    // Check if exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Sınav bulunamadı');
    }

    // Check for existing application
    const existingApplication = await this.prisma.examApplication.findFirst({
      where: {
        examId,
        ...(prospectId ? { prospectId } : { studentId }),
      },
    });

    if (existingApplication) {
      throw new ConflictException('Bu sınav için zaten bir başvuru mevcut');
    }

    return this.prisma.examApplication.create({
      data: {
        examId,
        prospectId,
        studentId,
        status: 'PENDING',
        applicationDate: new Date(),
        createdAt: new Date(),
      },
      include: {
        exam: {
          select: { name: true, date: true },
        },
        prospect: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
        student: {
          select: { firstName: true, lastName: true, tcKimlikNo: true },
        },
      },
    });
  }

  async findAll(tenantId: string, filters?: ApplicationFiltersDto) {
    const where: any = { exam: { tenantId } };

    if (filters?.examId) {
      where.examId = filters.examId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.examApplication.findMany({
      where,
      include: {
        exam: {
          select: { name: true, date: true },
        },
        prospect: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
        student: {
          select: { firstName: true, lastName: true, tcKimlikNo: true },
        },
        admissionTicket: {
          include: {
            session: {
              select: { room: true, startTime: true },
            },
          },
        },
      },
      orderBy: { applicationDate: 'desc' },
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
      take: filters?.limit || 10,
    });
  }

  async findOne(id: string, tenantId: string) {
    const application = await this.prisma.examApplication.findFirst({
      where: { id, exam: { tenantId } },
      include: {
        exam: {
          include: {
            campus: true,
            sessions: true,
          },
        },
        prospect: true,
        student: true,
        admissionTicket: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Başvuru bulunamadı');
    }

    return application;
  }

  async update(id: string, tenantId: string, updateApplicationDto: UpdateApplicationDto) {
    const application = await this.findOne(id, tenantId);

    return this.prisma.examApplication.update({
      where: { id },
      data: {
        ...updateApplicationDto,
        updatedAt: new Date(),
      },
      include: {
        exam: {
          select: { name: true, date: true },
        },
        prospect: {
          select: { firstName: true, lastName: true, phone: true, email: true },
        },
        student: {
          select: { firstName: true, lastName: true, tcKimlikNo: true },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const application = await this.findOne(id, tenantId);

    // Check if application has admission ticket
    if (application.admissionTicket) {
      throw new ConflictException('Sıra numarası atanmış başvuru silinemez');
    }

    return this.prisma.examApplication.delete({
      where: { id },
    });
  }

  async approve(id: string, tenantId: string) {
    return this.update(id, tenantId, { status: 'APPROVED' });
  }

  async reject(id: string, tenantId: string, reason?: string) {
    return this.update(id, tenantId, { 
      status: 'REJECTED',
      notes: reason 
    });
  }

  async bulkApprove(applicationIds: string[], tenantId: string) {
    // Validate all applications belong to this tenant
    const applications = await this.prisma.examApplication.findMany({
      where: {
        id: { in: applicationIds },
        exam: { tenantId },
      },
    });

    if (applications.length !== applicationIds.length) {
      throw new NotFoundException('Bazı başvurular bulunamadı');
    }

    return this.prisma.examApplication.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status: 'APPROVED',
        updatedAt: new Date(),
      },
    });
  }

  async getApplicationStats(tenantId: string, examId?: string) {
    const where: any = { exam: { tenantId } };
    if (examId) {
      where.examId = examId;
    }

    const [totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
      this.prisma.examApplication.count({ where }),
      this.prisma.examApplication.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.examApplication.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.examApplication.count({ where: { ...where, status: 'REJECTED' } }),
    ]);

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvalRate: totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0,
    };
  }
}