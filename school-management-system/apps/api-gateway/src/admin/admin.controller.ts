import { Controller, Get } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor() {}

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'admin-gateway' };
  }
}