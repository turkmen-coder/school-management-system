import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { LeadScoringService } from './lead-scoring.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { ProspectFiltersDto } from './dto/prospect-filters.dto';

// Mock auth guard - replace with real implementation
const AuthGuard = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor;

@Controller('prospects')
@UseGuards(AuthGuard())
export class ProspectsController {
  constructor(
    private readonly prospectsService: ProspectsService,
    private readonly leadScoringService: LeadScoringService,
  ) {}

  @Post()
  async create(@Body() createProspectDto: CreateProspectDto, @Req() req: any) {
    // In real implementation, get tenantId from JWT token
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.create(tenantId, createProspectDto);
  }

  @Get()
  async findAll(@Query() filters: ProspectFiltersDto, @Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.findAll(tenantId, filters);
  }

  @Get('stats/conversion')
  async getConversionStats(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.getConversionStats(tenantId);
  }

  @Get('stats/sources')
  async getSourceStats(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.getSourceStats(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.findOne(tenantId, id);
  }

  @Get(':id/recommendations')
  async getRecommendations(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    const prospect = await this.prospectsService.findOne(tenantId, id);
    
    if (!prospect) {
      throw new Error('Prospect not found');
    }

    const score = prospect.score || 0;
    const stage = prospect.stage || 'INITIAL_CONTACT';
    
    return {
      scoreCategory: this.leadScoringService.getScoreCategory(score),
      recommendedActions: this.leadScoringService.getRecommendedActions(score, stage),
      score,
      stage,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProspectDto: UpdateProspectDto,
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.update(tenantId, id, updateProspectDto);
  }

  @Patch(':id/stage')
  async advanceStage(
    @Param('id') id: string,
    @Body() body: { stage: string; notes?: string },
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.advanceStage(tenantId, id, body.stage, body.notes);
  }

  @Post(':id/convert')
  async markAsConverted(
    @Param('id') id: string,
    @Body() body: { studentId: string },
    @Req() req: any,
  ) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.markAsConverted(tenantId, id, body.studentId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.prospectsService.remove(tenantId, id);
  }
}