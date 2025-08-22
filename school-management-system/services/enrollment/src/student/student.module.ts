import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [HttpModule, PersistenceModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}