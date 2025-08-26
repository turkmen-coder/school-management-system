import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';
import { EnrollmentModule } from './enrollment/enrollment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    StudentModule,
    ParentModule,
    EnrollmentModule,
  ],
})
export class AppModule {}