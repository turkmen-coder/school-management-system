import { Controller, Get, Post, Body, Param, Delete, Put, Query, Headers } from '@nestjs/common';
import { EnrollmentService, Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.enrollmentService.create({ ...createEnrollmentDto, tenantId });
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.enrollmentService.findAll(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      status,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.enrollmentService.findOne(id, tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, tenantId, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.enrollmentService.remove(id, tenantId);
  }

  @Get('student/:studentId')
  getByStudent(
    @Param('studentId') studentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.enrollmentService.getByStudent(studentId, tenantId);
  }

  @Get('class/:classId')
  getByClass(
    @Param('classId') classId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.enrollmentService.getByClass(classId, tenantId);
  }
}