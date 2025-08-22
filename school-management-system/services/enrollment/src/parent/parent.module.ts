import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [HttpModule, PersistenceModule],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}