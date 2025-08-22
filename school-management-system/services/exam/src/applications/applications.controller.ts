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
import { 
  ApplicationsService, 
  CreateApplicationDto, 
  UpdateApplicationDto,
  ApplicationFiltersDto 
} from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.applicationsService.create({
      ...createApplicationDto,
      tenantId,
    });
  }

  @Get()
  findAll(
    @Query() filters: ApplicationFiltersDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.applicationsService.findAll(tenantId, filters);
  }

  @Get('stats')
  getStats(
    @Query('examId') examId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.applicationsService.getApplicationStats(tenantId, examId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.applicationsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, tenantId, updateApplicationDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.applicationsService.remove(id, tenantId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.applicationsService.approve(id, tenantId);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { reason?: string },
  ) {
    return this.applicationsService.reject(id, tenantId, body.reason);
  }

  @Post('bulk/approve')
  async bulkApprove(
    @Body() body: { applicationIds: string[] },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.applicationsService.bulkApprove(body.applicationIds, tenantId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}