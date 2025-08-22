import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ContractDocumentService } from './contract-document.service';
import { AdmissionDocumentService } from './admission-document.service';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    ContractDocumentService,
    AdmissionDocumentService,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}