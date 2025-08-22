import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@school/persistence';
import { LeadScoringService } from './lead-scoring.service';
import { ProspectsService } from './prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';

describe('ProspectsService', () => {
  let service: ProspectsService;
  let prisma: jest.Mocked<PrismaService>;
  let leadScoringService: jest.Mocked<LeadScoringService>;

  const mockProspect = {
    id: 'prospect-1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phone: '+905551234567',
    email: 'ahmet@example.com',
    source: 'WEBSITE',
    stage: 'INITIAL_CONTACT',
    status: 'NEW',
    score: 70,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    prospect: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    interaction: {
      create: jest.fn(),
    },
    conversion: {
      create: jest.fn(),
    },
  };

  const mockLeadScoringService = {
    calculateInitialScore: jest.fn(),
    recalculateScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProspectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LeadScoringService,
          useValue: mockLeadScoringService,
        },
      ],
    }).compile();

    service = module.get<ProspectsService>(ProspectsService);
    prisma = module.get(PrismaService);
    leadScoringService = module.get(LeadScoringService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProspectDto: CreateProspectDto = {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      phone: '+905551234567',
      email: 'ahmet@example.com',
      source: 'WEBSITE',
    };

    it('should create a prospect with calculated initial score', async () => {
      const tenantId = 'tenant-1';
      const calculatedScore = 75;

      leadScoringService.calculateInitialScore.mockReturnValue(calculatedScore);
      prisma.prospect.create.mockResolvedValue(mockProspect);
      prisma.interaction.create.mockResolvedValue({} as any);

      const result = await service.create(tenantId, createProspectDto);

      expect(leadScoringService.calculateInitialScore).toHaveBeenCalledWith({
        source: createProspectDto.source,
        hasEmail: true,
        hasPhone: true,
      });

      expect(prisma.prospect.create).toHaveBeenCalledWith({
        data: {
          firstName: createProspectDto.firstName,
          lastName: createProspectDto.lastName,
          phone: createProspectDto.phone,
          email: createProspectDto.email,
          tenantId,
          source: createProspectDto.source,
          score: calculatedScore,
          stage: 'INITIAL_CONTACT',
          status: 'NEW',
        },
        include: {
          interactions: true,
          examApplications: true,
        },
      });

      expect(prisma.interaction.create).toHaveBeenCalledWith({
        data: {
          prospectId: mockProspect.id,
          type: 'CREATED',
          content: 'Lead created from source: WEBSITE',
        },
      });

      expect(result).toEqual(mockProspect);
    });

    it('should handle prospects without email', async () => {
      const createDto = { ...createProspectDto };
      delete createDto.email;

      leadScoringService.calculateInitialScore.mockReturnValue(65);
      prisma.prospect.create.mockResolvedValue(mockProspect);
      prisma.interaction.create.mockResolvedValue({} as any);

      await service.create('tenant-1', createDto);

      expect(leadScoringService.calculateInitialScore).toHaveBeenCalledWith({
        source: createDto.source,
        hasEmail: false,
        hasPhone: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return filtered and paginated prospects', async () => {
      const tenantId = 'tenant-1';
      const filters = {
        status: 'NEW',
        source: 'WEBSITE',
        search: 'Ahmet',
        page: 1,
        limit: 10,
      };

      const mockProspects = [mockProspect];
      prisma.prospect.findMany.mockResolvedValue(mockProspects);

      const result = await service.findAll(tenantId, filters);

      expect(prisma.prospect.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          status: 'NEW',
          source: 'WEBSITE',
          OR: [
            { firstName: { contains: 'Ahmet', mode: 'insensitive' } },
            { lastName: { contains: 'Ahmet', mode: 'insensitive' } },
            { phone: { contains: 'Ahmet' } },
            { email: { contains: 'Ahmet', mode: 'insensitive' } },
          ],
        },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          examApplications: {
            include: {
              exam: {
                select: { name: true, date: true },
              },
            },
          },
          _count: {
            select: {
              interactions: true,
              examApplications: true,
            },
          },
        },
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(mockProspects);
    });

    it('should handle minimum score filter', async () => {
      const filters = { minScore: 80 };
      prisma.prospect.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', filters);

      expect(prisma.prospect.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            score: { gte: 80 },
          }),
        })
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      stage: 'INTERESTED',
      status: 'ACTIVE',
    };

    it('should update prospect and recalculate score', async () => {
      const mockCurrentProspect = {
        ...mockProspect,
        _count: { interactions: 3 },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockCurrentProspect as any);
      leadScoringService.recalculateScore.mockReturnValue(85);
      prisma.prospect.update.mockResolvedValue({ ...mockProspect, ...updateDto, score: 85 });
      prisma.interaction.create.mockResolvedValue({} as any);

      const result = await service.update('tenant-1', 'prospect-1', updateDto);

      expect(leadScoringService.recalculateScore).toHaveBeenCalledWith({
        currentScore: mockProspect.score,
        stage: updateDto.stage,
        status: updateDto.status,
        interactionCount: 3,
      });

      expect(prisma.prospect.update).toHaveBeenCalledWith({
        where: { id: 'prospect-1', tenantId: 'tenant-1' },
        data: {
          ...updateDto,
          score: 85,
        },
        include: {
          interactions: true,
          examApplications: true,
        },
      });

      expect(prisma.interaction.create).toHaveBeenCalledWith({
        data: {
          prospectId: 'prospect-1',
          type: 'UPDATED',
          content: 'Updated fields: stage, status',
        },
      });
    });
  });

  describe('advanceStage', () => {
    it('should advance prospect stage and log interaction', async () => {
      const newStage = 'QUALIFIED';
      const notes = 'Prospect is qualified for our program';
      
      const updatedProspect = { ...mockProspect, stage: newStage };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProspect as any);
      prisma.interaction.create.mockResolvedValue({} as any);

      const result = await service.advanceStage('tenant-1', 'prospect-1', newStage, notes);

      expect(service.update).toHaveBeenCalledWith('tenant-1', 'prospect-1', { stage: newStage });
      
      expect(prisma.interaction.create).toHaveBeenCalledWith({
        data: {
          prospectId: 'prospect-1',
          type: 'STAGE_ADVANCED',
          content: `Advanced to stage: ${newStage}. Notes: ${notes}`,
        },
      });

      expect(result).toEqual(updatedProspect);
    });
  });

  describe('markAsConverted', () => {
    it('should mark prospect as converted and create conversion record', async () => {
      const prospectId = 'prospect-1';
      const studentId = 'student-1';
      const tenantId = 'tenant-1';

      const mockConversion = {
        id: 'conversion-1',
        prospectId,
        studentId,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockProspect as any);
      prisma.conversion.create.mockResolvedValue(mockConversion);
      prisma.interaction.create.mockResolvedValue({} as any);

      const result = await service.markAsConverted(tenantId, prospectId, studentId);

      expect(service.update).toHaveBeenCalledWith(tenantId, prospectId, {
        status: 'CONVERTED',
        stage: 'ENROLLED',
      });

      expect(prisma.conversion.create).toHaveBeenCalledWith({
        data: {
          prospectId,
          studentId,
        },
      });

      expect(prisma.interaction.create).toHaveBeenCalledWith({
        data: {
          prospectId,
          type: 'CONVERTED',
          content: `Successfully converted to student ID: ${studentId}`,
        },
      });

      expect(result).toEqual(mockConversion);
    });
  });

  describe('getConversionStats', () => {
    it('should return conversion statistics', async () => {
      const tenantId = 'tenant-1';
      const mockStats = {
        totalProspects: 100,
        convertedProspects: 25,
        stageStats: [
          { stage: 'INITIAL_CONTACT', _count: 40 },
          { stage: 'INTERESTED', _count: 30 },
          { stage: 'ENROLLED', _count: 25 },
        ],
      };

      prisma.prospect.count
        .mockResolvedValueOnce(mockStats.totalProspects)
        .mockResolvedValueOnce(mockStats.convertedProspects);
      
      prisma.prospect.groupBy.mockResolvedValue(mockStats.stageStats as any);

      const result = await service.getConversionStats(tenantId);

      expect(result).toEqual({
        totalProspects: 100,
        convertedProspects: 25,
        conversionRate: 25,
        stageDistribution: [
          { stage: 'INITIAL_CONTACT', count: 40 },
          { stage: 'INTERESTED', count: 30 },
          { stage: 'ENROLLED', count: 25 },
        ],
      });
    });

    it('should handle zero prospects correctly', async () => {
      prisma.prospect.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prisma.prospect.groupBy.mockResolvedValue([]);

      const result = await service.getConversionStats('tenant-1');

      expect(result.conversionRate).toBe(0);
    });
  });

  describe('getSourceStats', () => {
    it('should return source statistics', async () => {
      const mockSourceStats = [
        { source: 'WEBSITE', _count: 50, _avg: { score: 75 } },
        { source: 'REFERRAL', _count: 30, _avg: { score: 85 } },
      ];

      prisma.prospect.groupBy.mockResolvedValue(mockSourceStats as any);

      const result = await service.getSourceStats('tenant-1');

      expect(prisma.prospect.groupBy).toHaveBeenCalledWith({
        by: ['source'],
        where: { tenantId: 'tenant-1' },
        _count: true,
        _avg: { score: true },
      });

      expect(result).toEqual(mockSourceStats);
    });
  });
});