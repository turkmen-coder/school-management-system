import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MonitoringModule, LoggingInterceptor } from '@school/monitoring';
import { ExamsModule } from './exams/exams.module';
import { ApplicationsModule } from './applications/applications.module';
import { SessionsModule } from './sessions/sessions.module';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MonitoringModule,
    PersistenceModule,
    ExamsModule,
    ApplicationsModule,
    SessionsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}