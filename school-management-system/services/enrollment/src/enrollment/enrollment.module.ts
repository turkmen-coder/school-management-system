import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [HttpModule, PersistenceModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}