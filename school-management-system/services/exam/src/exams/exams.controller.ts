import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamFiltersDto } from './dto/exam-filters.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @Body() createExamDto: CreateExamDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.create(tenantId, createExamDto);
  }

  @Get()
  findAll(
    @Query() filters: ExamFiltersDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.findAll(tenantId, filters);
  }

  @Get('dashboard/stats')
  getDashboardStats(@Headers('x-tenant-id') tenantId: string) {
    return this.examsService.getDashboardStats(tenantId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.findOne(tenantId, id);
  }

  @Get(':id/statistics')
  async getStatistics(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.examsService.getExamStatistics(tenantId, id);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examsService.update(tenantId, id, updateExamDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.remove(tenantId, id);
  }

  @Post(':id/start')
  startExam(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.startExam(tenantId, id);
  }

  @Post(':id/finish')
  finishExam(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.examsService.finishExam(tenantId, id);
  }

  @Post(':id/cancel')
  cancelExam(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { reason?: string },
  ) {
    return this.examsService.cancelExam(tenantId, id, body.reason);
  }

  @Post(':id/assign-seats')
  async assignSeats(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.examsService.assignSeats(tenantId, id);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}