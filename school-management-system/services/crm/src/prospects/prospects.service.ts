import { Injectable } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { LeadScoringService } from './lead-scoring.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { ProspectFiltersDto } from './dto/prospect-filters.dto';

@Injectable()
export class ProspectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  async create(tenantId: string, createProspectDto: CreateProspectDto) {
    const { source, ...prospectData } = createProspectDto;
    
    // Calculate initial lead score
    const score = this.leadScoringService.calculateInitialScore({
      source,
      hasEmail: !!prospectData.email,
      hasPhone: !!prospectData.phone,
    });

    const prospect = await this.prisma.prospect.create({
      data: {
        ...prospectData,
        tenantId,
        source,
        score,
        stage: 'INITIAL_CONTACT',
        status: 'NEW',
      },
      include: {
        interactions: true,
        examApplications: true,
      },
    });

    // Create initial interaction
    await this.prisma.interaction.create({
      data: {
        prospectId: prospect.id,
        type: 'CREATED',
        content: `Lead created from source: ${source}`,
      },
    });

    return prospect;
  }

  async findAll(tenantId: string, filters?: ProspectFiltersDto) {
    const where: any = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.stage) {
      where.stage = filters.stage;
    }
    if (filters?.minScore !== undefined) {
      where.score = { gte: filters.minScore };
    }
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.prospect.findMany({
      where,
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
      skip: filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0,
      take: filters?.limit || 10,
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.prospect.findUnique({
      where: { id, tenantId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
        examApplications: {
          include: {
            exam: true,
          },
        },
        conversions: true,
      },
    });
  }

  async update(tenantId: string, id: string, updateProspectDto: UpdateProspectDto) {
    // Get current prospect data with interaction count
    const currentProspect = await this.prisma.prospect.findUnique({
      where: { id, tenantId },
      include: {
        interactions: true,
        examApplications: {
          include: {
            exam: true,
          },
        },
        conversions: true,
        _count: {
          select: {
            interactions: true,
            examApplications: true,
          },
        },
      },
    });

    if (!currentProspect) {
      throw new Error('Prospect not found');
    }

    // Recalculate score if relevant fields changed
    let newScore = currentProspect.score;
    if (updateProspectDto.stage || updateProspectDto.status) {
      newScore = this.leadScoringService.recalculateScore({
        currentScore: currentProspect.score || 0,
        stage: updateProspectDto.stage || currentProspect.stage || 'INITIAL_CONTACT',
        status: updateProspectDto.status || currentProspect.status,
        interactionCount: currentProspect._count?.interactions || 0,
      });
    }

    const updatedProspect = await this.prisma.prospect.update({
      where: { id, tenantId },
      data: {
        ...updateProspectDto,
        score: newScore,
      },
      include: {
        interactions: true,
        examApplications: true,
      },
    });

    // Log the update
    const changedFields = Object.keys(updateProspectDto);
    await this.prisma.interaction.create({
      data: {
        prospectId: id,
        type: 'UPDATED',
        content: `Updated fields: ${changedFields.join(', ')}`,
      },
    });

    return updatedProspect;
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.prospect.delete({
      where: { id, tenantId },
    });
  }

  // Lead nurturing methods
  async advanceStage(tenantId: string, id: string, newStage: string, notes?: string) {
    const prospect = await this.update(tenantId, id, { stage: newStage });
    
    await this.prisma.interaction.create({
      data: {
        prospectId: id,
        type: 'STAGE_ADVANCED',
        content: `Advanced to stage: ${newStage}${notes ? `. Notes: ${notes}` : ''}`,
      },
    });

    return prospect;
  }

  async markAsConverted(tenantId: string, prospectId: string, studentId: string) {
    // Update prospect status
    await this.update(tenantId, prospectId, { 
      status: 'CONVERTED',
      stage: 'ENROLLED' 
    });

    // Create conversion record
    const conversion = await this.prisma.conversion.create({
      data: {
        prospectId,
        studentId,
      },
    });

    // Log the conversion
    await this.prisma.interaction.create({
      data: {
        prospectId,
        type: 'CONVERTED',
        content: `Successfully converted to student ID: ${studentId}`,
      },
    });

    return conversion;
  }

  // Analytics methods
  async getConversionStats(tenantId: string) {
    const [totalProspects, convertedProspects, stageStats] = await Promise.all([
      this.prisma.prospect.count({ where: { tenantId } }),
      this.prisma.prospect.count({ where: { tenantId, status: 'CONVERTED' } }),
      this.prisma.prospect.groupBy({
        by: ['stage'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    const conversionRate = totalProspects > 0 
      ? Math.round((convertedProspects / totalProspects) * 100)
      : 0;

    return {
      totalProspects,
      convertedProspects,
      conversionRate,
      stageDistribution: stageStats.map((stat: any) => ({
        stage: stat.stage,
        count: stat._count,
      })),
    };
  }

  async getSourceStats(tenantId: string) {
    return this.prisma.prospect.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: true,
      _avg: { score: true },
    });
  }
}