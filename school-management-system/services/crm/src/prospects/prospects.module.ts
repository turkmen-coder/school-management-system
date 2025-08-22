import { Module } from '@nestjs/common';
import { ProspectsController } from './prospects.controller';
import { ProspectsService } from './prospects.service';
import { LeadScoringService } from './lead-scoring.service';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [PersistenceModule],
  controllers: [ProspectsController],
  providers: [ProspectsService, LeadScoringService],
  exports: [ProspectsService],
})
export class ProspectsModule {}