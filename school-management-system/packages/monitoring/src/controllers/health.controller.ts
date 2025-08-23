import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth';
import { HealthService } from '../health/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @Public()
  async check() {
    return this.health.check();
  }

  @Get('ready')
  @Public()
  async checkReadiness() {
    return this.health.checkReadiness();
  }

  @Get('live')
  @Public()
  async checkLiveness() {
    return this.health.checkLiveness();
  }

  @Get('business')
  @Public()
  async checkBusinessHealth() {
    return this.health.checkBusinessHealth();
  }
}