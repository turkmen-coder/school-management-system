import { Injectable } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamFiltersDto } from './dto/exam-filters.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createExamDto: CreateExamDto) {
    const exam = await this.prisma.exam.create({
      data: {
        ...createExamDto,
        tenantId,
        status: 'PLANNED',
      },
      include: {
        campus: true,
        sessions: true,
        applications: {
          include: {
            prospect: true,
            student: true,
          },
        },
      },
    });

    return exam;
  }

  async findAll(tenantId: string, filters?: ExamFiltersDto) {
    const where: any = { tenantId };

    if (filters?.campusId) {
      where.campusId = filters.campusId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dateFrom) {
      where.date = { ...where.date, gte: new Date(filters.dateFrom) };
    }
    if (filters?.dateTo) {
      where.date = { ...where.date, lte: new Date(filters.dateTo) };
    }

    return this.prisma.exam.findMany({
      where,
      include: {
        campus: {
          select: { name: true },
        },
        sessions: {
          select: { id: true, room: true, capacity: true },
        },
        _count: {
          select: {
            sessions: true,
            applications: true,
          },
        },
      },
      orderBy: { date: 'asc' },
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
      take: filters?.limit || 10,
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.exam.findUnique({
      where: { id, tenantId },
      include: {
        campus: true,
        sessions: {
          include: {
            admissionTickets: {
              include: {
                application: {
                  include: {
                    prospect: true,
                    student: true,
                  },
                },
              },
            },
          },
        },
        applications: {
          include: {
            prospect: true,
            student: true,
            admissionTicket: {
              include: {
                session: true,
              },
            },
          },
        },
      },
    });
  }

  async update(tenantId: string, id: string, updateExamDto: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id, tenantId },
      data: updateExamDto,
      include: {
        campus: true,
        sessions: true,
        applications: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.exam.delete({
      where: { id, tenantId },
    });
  }

  // Exam lifecycle methods
  async startExam(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'IN_PROGRESS' });
  }

  async finishExam(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'COMPLETED' });
  }

  async cancelExam(tenantId: string, id: string, reason?: string) {
    const exam = await this.update(tenantId, id, { status: 'CANCELLED' });
    
    // Cancel all applications
    await this.prisma.examApplication.updateMany({
      where: { examId: id },
      data: { status: 'CANCELLED' },
    });

    return exam;
  }

  // Analytics methods
  async getExamStatistics(tenantId: string, examId: string) {
    const exam = await this.findOne(tenantId, examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    const totalApplications = exam.applications.length;
    const completedApplications = exam.applications.filter((app: any) => app.score !== null).length;
    const averageScore = exam.applications
      .filter((app: any) => app.score !== null)
      .reduce((sum: any, app: any) => sum + (app.score || 0), 0) / completedApplications || 0;

    const scoreDistribution = {
      excellent: exam.applications.filter((app: any) => (app.score || 0) >= 85).length,
      good: exam.applications.filter((app: any) => (app.score || 0) >= 70 && (app.score || 0) < 85).length,
      average: exam.applications.filter((app: any) => (app.score || 0) >= 50 && (app.score || 0) < 70).length,
      poor: exam.applications.filter((app: any) => (app.score || 0) < 50).length,
    };

    return {
      examId,
      examName: exam.name,
      totalApplications,
      completedApplications,
      completionRate: totalApplications > 0 ? Math.round((completedApplications / totalApplications) * 100) : 0,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreDistribution,
    };
  }

  async getDashboardStats(tenantId: string) {
    const [totalExams, upcomingExams, activeExams, completedExams] = await Promise.all([
      this.prisma.exam.count({ where: { tenantId } }),
      this.prisma.exam.count({ 
        where: { 
          tenantId, 
          status: 'PLANNED',
          date: { gte: new Date() }
        } 
      }),
      this.prisma.exam.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.exam.count({ where: { tenantId, status: 'COMPLETED' } }),
    ]);

    return {
      totalExams,
      upcomingExams,
      activeExams,
      completedExams,
    };
  }

  // Seat assignment algorithm
  async assignSeats(tenantId: string, examId: string) {
    const exam = await this.findOne(tenantId, examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    const sessions = (exam.sessions as any[]).sort((a: any, b: any) => a.capacity - b.capacity);
    const applications = (exam.applications as any[]).filter((app: any) => 
      app.status === 'APPROVED' && !app.admissionTicket
    );

    let currentSessionIndex = 0;
    let currentSeatNumber = 1;

    for (const application of applications as any[]) {
      if (currentSessionIndex >= sessions.length) {
        throw new Error('Not enough exam sessions for all applications');
      }

      const currentSession = sessions[currentSessionIndex];
      
      // Check if current session is full
      if (currentSeatNumber > currentSession.capacity) {
        currentSessionIndex++;
        currentSeatNumber = 1;
        
        if (currentSessionIndex >= sessions.length) {
          throw new Error('Not enough capacity in exam sessions');
        }
      }

      // Create admission ticket
      await this.prisma.admissionTicket.create({
        data: {
          applicationId: application.id,
          sessionId: sessions[currentSessionIndex].id,
          seatNumber: currentSeatNumber.toString().padStart(3, '0'),
        },
      });

      currentSeatNumber++;
    }

    return { assigned: applications.length };
  }
}