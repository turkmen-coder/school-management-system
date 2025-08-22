import { PdfGenerator } from './pdf.generator';
import { AdmissionTicketData } from '../types';

export class AdmissionGenerator {
  static async generateAdmissionTicket(data: AdmissionTicketData): Promise<Buffer> {
    return PdfGenerator.generateFromTemplate('admission-ticket', {
      ...data,
      generatedAt: new Date(),
      qrCode: await PdfGenerator.generateQRCode(
        `EXAM:${data.exam.id}:${data.application.id}:${data.session.id}`,
        120
      ),
    });
  }

  static async generateExamResults(examId: string, results: any[]): Promise<Buffer> {
    return PdfGenerator.generateFromTemplate('exam-results', {
      examId,
      results,
      generatedAt: new Date(),
      totalApplications: results.length,
      passedCount: results.filter(r => r.passed).length,
    });
  }
}