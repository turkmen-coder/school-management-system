import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@school/persistence';

export interface CreateSessionDto {
  examId: string;
  campusId: string;
  room: string;
  capacity: number;
  startTime: string;
  endTime: string;
  tenantId: string;
}

export interface UpdateSessionDto {
  room?: string;
  capacity?: number;
  startTime?: string;
  endTime?: string;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto) {
    const { tenantId, examId, campusId, ...sessionData } = createSessionDto;

    // Check if exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, tenantId },
    });

    if (!exam) {
      throw new NotFoundException('Sınav bulunamadı');
    }

    // Check for room conflicts
    const conflictingSession = await this.prisma.examSession.findFirst({
      where: {
        room: sessionData.room,
        exam: { tenantId },
        AND: [
          { startTime: { lte: new Date(sessionData.endTime) } },
          { startTime: { gte: new Date(sessionData.startTime) } },
        ],
      },
    });

    if (conflictingSession) {
      throw new ConflictException('Bu saatlerde oda zaten kullanımda');
    }

    return this.prisma.examSession.create({
      data: {
        ...sessionData,
        examId,
        campusId,
        startTime: new Date(sessionData.startTime),
        createdAt: new Date(),
      },
      include: {
        exam: {
          select: { name: true, date: true },
        },
        _count: {
          select: {
            admissionTickets: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, examId?: string) {
    const where: any = { exam: { tenantId } };
    if (examId) {
      where.examId = examId;
    }

    return this.prisma.examSession.findMany({
      where,
      include: {
        exam: {
          select: { name: true, date: true },
        },
        _count: {
          select: {
            admissionTickets: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const session = await this.prisma.examSession.findFirst({
      where: { id, exam: { tenantId } },
      include: {
        exam: {
          include: {
            campus: true,
          },
        },
        admissionTickets: {
          include: {
            application: {
              include: {
                prospect: {
                  select: { firstName: true, lastName: true, phone: true },
                },
                student: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Sınav oturumu bulunamadı');
    }

    return session;
  }

  async update(id: string, tenantId: string, updateSessionDto: UpdateSessionDto) {
    const session = await this.findOne(id, tenantId);

    // Check for room conflicts if room or time is being updated
    if (updateSessionDto.room || updateSessionDto.startTime || updateSessionDto.endTime) {
      const room = updateSessionDto.room || session.room;
      const startTime = updateSessionDto.startTime ? new Date(updateSessionDto.startTime) : session.startTime;
      const endTime = updateSessionDto.endTime ? new Date(updateSessionDto.endTime) : new Date(session.startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours default

      const conflictingSession = await this.prisma.examSession.findFirst({
        where: {
          id: { not: id },
          room,
          exam: { tenantId },
          AND: [
            { startTime: { lte: endTime } },
            { startTime: { gte: startTime } },
          ],
        },
      });

      if (conflictingSession) {
        throw new ConflictException('Bu saatlerde oda zaten kullanımda');
      }
    }

    const updateData: any = {
      ...updateSessionDto,
      updatedAt: new Date(),
    };

    if (updateSessionDto.startTime) {
      updateData.startTime = new Date(updateSessionDto.startTime);
    }
    if (updateSessionDto.endTime) {
      updateData.endTime = new Date(updateSessionDto.endTime);
    }

    return this.prisma.examSession.update({
      where: { id },
      data: updateData,
      include: {
        exam: {
          select: { name: true, date: true },
        },
        _count: {
          select: {
            admissionTickets: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const session = await this.findOne(id, tenantId);

    // Check if session has admission tickets
    const ticketCount = await this.prisma.admissionTicket.count({
      where: { sessionId: id },
    });

    if (ticketCount > 0) {
      throw new ConflictException('Giriş bileti oluşturulmuş oturum silinemez');
    }

    return this.prisma.examSession.delete({
      where: { id },
    });
  }

  async getSessionCapacityInfo(id: string, tenantId: string) {
    const session = await this.findOne(id, tenantId);

    const occupiedSeats = await this.prisma.admissionTicket.count({
      where: { sessionId: id },
    });

    return {
      sessionId: id,
      room: session.room,
      totalCapacity: session.capacity,
      occupiedSeats,
      availableSeats: session.capacity - occupiedSeats,
      occupancyRate: Math.round((occupiedSeats / session.capacity) * 100),
    };
  }

  async getRoomSchedule(tenantId: string, room: string, date?: string) {
    const where: any = {
      room,
      exam: { tenantId },
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.examSession.findMany({
      where,
      include: {
        exam: {
          select: { name: true, date: true },
        },
        _count: {
          select: {
            admissionTickets: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}