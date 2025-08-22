import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@school/persistence';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';

describe('ExamsService', () => {
  let service: ExamsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockExam = {
    id: 'exam-1',
    name: '2024 Bahar Dönemi Giriş Sınavı',
    campusId: 'campus-1',
    date: new Date('2024-03-15T09:00:00Z'),
    duration: 120,
    status: 'PLANNED',
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    exam: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    examApplication: {
      updateMany: jest.fn(),
    },
    admissionTicket: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createExamDto: CreateExamDto = {
      name: '2024 Bahar Dönemi Giriş Sınavı',
      campusId: 'campus-1',
      date: '2024-03-15T09:00:00Z',
      duration: 120,
    };

    it('should create an exam successfully', async () => {
      const tenantId = 'tenant-1';
      prisma.exam.create.mockResolvedValue(mockExam);

      const result = await service.create(tenantId, createExamDto);

      expect(prisma.exam.create).toHaveBeenCalledWith({
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

      expect(result).toEqual(mockExam);
    });
  });

  describe('findAll', () => {
    it('should return filtered exams', async () => {
      const tenantId = 'tenant-1';
      const filters = {
        campusId: 'campus-1',
        status: 'PLANNED',
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31',
        page: 1,
        limit: 10,
      };

      const mockExams = [mockExam];
      prisma.exam.findMany.mockResolvedValue(mockExams);

      const result = await service.findAll(tenantId, filters);

      expect(prisma.exam.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          campusId: 'campus-1',
          status: 'PLANNED',
          date: {
            gte: new Date('2024-03-01'),
            lte: new Date('2024-03-31'),
          },
        },
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
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(mockExams);
    });

    it('should handle filters without pagination', async () => {
      prisma.exam.findMany.mockResolvedValue([mockExam]);

      const result = await service.findAll('tenant-1');

      expect(prisma.exam.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: expect.any(Object),
        orderBy: { date: 'asc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return exam with full details', async () => {
      const examId = 'exam-1';
      const tenantId = 'tenant-1';
      
      const mockDetailedExam = {
        ...mockExam,
        campus: { name: 'Merkez Kampüs' },
        sessions: [],
        applications: [],
      };

      prisma.exam.findUnique.mockResolvedValue(mockDetailedExam);

      const result = await service.findOne(tenantId, examId);

      expect(prisma.exam.findUnique).toHaveBeenCalledWith({
        where: { id: examId, tenantId },
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

      expect(result).toEqual(mockDetailedExam);
    });
  });

  describe('update', () => {
    it('should update exam successfully', async () => {
      const updateDto = { name: 'Updated Exam Name', duration: 150 };
      const updatedExam = { ...mockExam, ...updateDto };
      
      prisma.exam.update.mockResolvedValue(updatedExam);

      const result = await service.update('tenant-1', 'exam-1', updateDto);

      expect(prisma.exam.update).toHaveBeenCalledWith({
        where: { id: 'exam-1', tenantId: 'tenant-1' },
        data: updateDto,
        include: {
          campus: true,
          sessions: true,
          applications: true,
        },
      });

      expect(result).toEqual(updatedExam);
    });
  });

  describe('startExam', () => {
    it('should start exam by updating status', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockExam as any);

      const result = await service.startExam('tenant-1', 'exam-1');

      expect(service.update).toHaveBeenCalledWith('tenant-1', 'exam-1', { status: 'IN_PROGRESS' });
      expect(result).toEqual(mockExam);
    });
  });

  describe('finishExam', () => {
    it('should finish exam by updating status', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockExam as any);

      const result = await service.finishExam('tenant-1', 'exam-1');

      expect(service.update).toHaveBeenCalledWith('tenant-1', 'exam-1', { status: 'COMPLETED' });
      expect(result).toEqual(mockExam);
    });
  });

  describe('cancelExam', () => {
    it('should cancel exam and all applications', async () => {
      const cancelledExam = { ...mockExam, status: 'CANCELLED' };
      
      jest.spyOn(service, 'update').mockResolvedValue(cancelledExam as any);
      prisma.examApplication.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.cancelExam('tenant-1', 'exam-1', 'Emergency cancellation');

      expect(service.update).toHaveBeenCalledWith('tenant-1', 'exam-1', { status: 'CANCELLED' });
      expect(prisma.examApplication.updateMany).toHaveBeenCalledWith({
        where: { examId: 'exam-1' },
        data: { status: 'CANCELLED' },
      });

      expect(result).toEqual(cancelledExam);
    });
  });

  describe('getExamStatistics', () => {
    it('should return exam statistics', async () => {
      const mockExamWithApplications = {
        ...mockExam,
        applications: [
          { score: 85 },
          { score: 92 },
          { score: 78 },
          { score: null }, // Not completed
        ],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExamWithApplications as any);

      const result = await service.getExamStatistics('tenant-1', 'exam-1');

      expect(result).toEqual({
        examId: 'exam-1',
        examName: mockExam.name,
        totalApplications: 4,
        completedApplications: 3,
        completionRate: 75,
        averageScore: 85,
        scoreDistribution: {
          excellent: 2, // >= 85
          good: 0,      // 70-84
          average: 1,   // 50-69
          poor: 0,      // < 50
        },
      });
    });

    it('should throw error for non-existent exam', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.getExamStatistics('tenant-1', 'nonexistent')).rejects.toThrow('Exam not found');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalExams: 10,
        upcomingExams: 3,
        activeExams: 1,
        completedExams: 6,
      };

      prisma.exam.count
        .mockResolvedValueOnce(mockStats.totalExams)
        .mockResolvedValueOnce(mockStats.upcomingExams)
        .mockResolvedValueOnce(mockStats.activeExams)
        .mockResolvedValueOnce(mockStats.completedExams);

      const result = await service.getDashboardStats('tenant-1');

      expect(result).toEqual(mockStats);

      // Verify the calls
      expect(prisma.exam.count).toHaveBeenCalledTimes(4);
      expect(prisma.exam.count).toHaveBeenNthCalledWith(1, { where: { tenantId: 'tenant-1' } });
      expect(prisma.exam.count).toHaveBeenNthCalledWith(2, {
        where: {
          tenantId: 'tenant-1',
          status: 'PLANNED',
          date: { gte: expect.any(Date) },
        },
      });
      expect(prisma.exam.count).toHaveBeenNthCalledWith(3, { 
        where: { tenantId: 'tenant-1', status: 'IN_PROGRESS' } 
      });
      expect(prisma.exam.count).toHaveBeenNthCalledWith(4, { 
        where: { tenantId: 'tenant-1', status: 'COMPLETED' } 
      });
    });
  });

  describe('assignSeats', () => {
    it('should assign seats to approved applications', async () => {
      const mockExamWithSessionsAndApps = {
        ...mockExam,
        sessions: [
          { id: 'session-1', capacity: 30 },
          { id: 'session-2', capacity: 25 },
        ],
        applications: [
          { id: 'app-1', status: 'APPROVED', admissionTicket: null },
          { id: 'app-2', status: 'APPROVED', admissionTicket: null },
          { id: 'app-3', status: 'PENDING', admissionTicket: null },
        ],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExamWithSessionsAndApps as any);
      prisma.admissionTicket.create.mockResolvedValue({} as any);

      const result = await service.assignSeats('tenant-1', 'exam-1');

      expect(prisma.admissionTicket.create).toHaveBeenCalledTimes(2); // Only approved applications
      expect(prisma.admissionTicket.create).toHaveBeenNthCalledWith(1, {
        data: {
          applicationId: 'app-1',
          sessionId: 'session-1',
          seatNumber: '001',
        },
      });
      expect(prisma.admissionTicket.create).toHaveBeenNthCalledWith(2, {
        data: {
          applicationId: 'app-2',
          sessionId: 'session-1',
          seatNumber: '002',
        },
      });

      expect(result).toEqual({ assigned: 2 });
    });

    it('should throw error when not enough capacity', async () => {
      const mockExamWithLimitedCapacity = {
        ...mockExam,
        sessions: [
          { id: 'session-1', capacity: 1 },
        ],
        applications: [
          { id: 'app-1', status: 'APPROVED', admissionTicket: null },
          { id: 'app-2', status: 'APPROVED', admissionTicket: null },
        ],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExamWithLimitedCapacity as any);

      await expect(service.assignSeats('tenant-1', 'exam-1')).rejects.toThrow('Not enough capacity in exam sessions');
    });

    it('should throw error for non-existent exam', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.assignSeats('tenant-1', 'nonexistent')).rejects.toThrow('Exam not found');
    });
  });
});