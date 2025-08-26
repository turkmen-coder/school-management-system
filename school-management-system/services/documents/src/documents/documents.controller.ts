import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('contracts/:id/document')
  async generateContract(
    @Param('id') contractId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.documentsService.generateContractDocument(contractId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${contractId}.pdf"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @Get('contracts/:id/installment-plan')
  async generateInstallmentPlan(
    @Param('id') contractId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.documentsService.generateInstallmentPlan(contractId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="installment-plan-${contractId}.pdf"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @Get('exam-applications/:id/admission-ticket')
  async generateAdmissionTicket(
    @Param('id') applicationId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.documentsService.generateAdmissionTicket(applicationId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="admission-ticket-${applicationId}.pdf"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  @Get('exams/:id/results-report')
  async generateExamResults(
    @Param('id') examId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.documentsService.generateExamResultsReport(examId);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="exam-results-${examId}.pdf"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}