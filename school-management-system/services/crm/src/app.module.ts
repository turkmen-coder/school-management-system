import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitoringModule, LoggingInterceptor } from '@school/monitoring';
import { ProspectsModule } from './prospects/prospects.module';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MonitoringModule,
    PersistenceModule,
    ProspectsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}