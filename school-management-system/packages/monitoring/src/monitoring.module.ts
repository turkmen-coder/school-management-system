import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CustomLogger } from './logger/logger.service';
import { MetricsService } from './metrics/metrics.service';
import { HealthService } from './health/health.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MetricsMiddleware } from './middleware/metrics.middleware';
import { MetricsController } from './controllers/metrics.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [MetricsController, HealthController],
  providers: [
    CustomLogger,
    MetricsService,
    HealthService,
    LoggingInterceptor,
    MetricsMiddleware,
  ],
  exports: [
    CustomLogger,
    MetricsService,
    HealthService,
    LoggingInterceptor,
    MetricsMiddleware,
  ],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}