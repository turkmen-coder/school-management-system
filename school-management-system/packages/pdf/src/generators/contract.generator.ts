import { PdfGenerator } from './pdf.generator';
import { ContractData } from '../types';

export class ContractGenerator {
  static async generateContract(data: ContractData): Promise<Buffer> {
    return PdfGenerator.generateFromTemplate('contract', {
      ...data,
      generatedAt: new Date(),
      qrCode: await PdfGenerator.generateQRCode(
        `CONTRACT:${data.contractNo}:${data.student.tcNo}`,
        150
      ),
    });
  }

  static async generateInstallmentPlan(data: ContractData): Promise<Buffer> {
    return PdfGenerator.generateFromTemplate('installment-plan', {
      ...data,
      generatedAt: new Date(),
      totalInstallments: data.installments.length,
      qrCode: await PdfGenerator.generateQRCode(
        `INSTALLMENT:${data.contractNo}`,
        100
      ),
    });
  }
}