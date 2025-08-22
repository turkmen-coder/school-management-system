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
import { SessionsService, CreateSessionDto, UpdateSessionDto } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.sessionsService.create({
        ...createSessionDto,
        tenantId,
      });
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  findAll(
    @Query('examId') examId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.sessionsService.findAll(tenantId, examId);
  }

  @Get('room/:room/schedule')
  getRoomSchedule(
    @Param('room') room: string,
    @Query('date') date: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.sessionsService.getRoomSchedule(tenantId, room, date);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.sessionsService.findOne(id, tenantId);
  }

  @Get(':id/capacity')
  getCapacityInfo(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.sessionsService.getSessionCapacityInfo(id, tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    try {
      return await this.sessionsService.update(id, tenantId, updateSessionDto);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.sessionsService.remove(id, tenantId);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}