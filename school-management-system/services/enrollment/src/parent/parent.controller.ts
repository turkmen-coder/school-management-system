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
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';
import { AssignStudentDto } from './dto/assign-student.dto';

@Controller('parents')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  create(
    @Body() createParentDto: CreateParentDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.parentService.create({ ...createParentDto, tenantId });
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.parentService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.parentService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.update(id, tenantId, updateParentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.parentService.remove(id, tenantId);
  }

  @Post(':id/students')
  assignStudent(
    @Param('id') parentId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() assignStudentDto: AssignStudentDto,
  ) {
    return this.parentService.assignStudent(parentId, tenantId, assignStudentDto);
  }

  @Delete(':parentId/students/:studentId')
  unassignStudent(
    @Param('parentId') parentId: string,
    @Param('studentId') studentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.parentService.unassignStudent(parentId, studentId, tenantId);
  }

  @Patch(':parentId/students/:studentId')
  updateRelationship(
    @Param('parentId') parentId: string,
    @Param('studentId') studentId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateData: any,
  ) {
    return this.parentService.updateRelationship(
      parentId,
      studentId,
      tenantId,
      updateData,
    );
  }

  @Get(':id/students')
  getStudentsByParent(
    @Param('id') parentId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.parentService.getStudentsByParent(parentId, tenantId);
  }
}