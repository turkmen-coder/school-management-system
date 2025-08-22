import { Injectable } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { ContractDocumentService } from './contract-document.service';
import { AdmissionDocumentService } from './admission-document.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contractDocumentService: ContractDocumentService,
    private readonly admissionDocumentService: AdmissionDocumentService,
  ) {}

  async generateContractDocument(contractId: string): Promise<Buffer> {
    const contract = await this.prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
      include: {
        tenant: true,
        campus: true,
        student: {
          include: {
            parentRelations: {
              include: {
                parent: true,
              },
              where: { isPrimary: true },
            },
          },
        },
        items: {
          include: {
            feeItem: true,
          },
        },
        installments: {
          orderBy: { sequenceNo: 'asc' },
        },
        discounts: true,
      },
    });

    return this.contractDocumentService.generateContract(contract);
  }

  async generateInstallmentPlan(contractId: string): Promise<Buffer> {
    const contract = await this.prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
      include: {
        tenant: true,
        campus: true,
        student: {
          include: {
            parentRelations: {
              include: {
                parent: true,
              },
              where: { isPrimary: true },
            },
          },
        },
        installments: {
          orderBy: { sequenceNo: 'asc' },
        },
      },
    });

    return this.contractDocumentService.generateInstallmentPlan(contract);
  }

  async generateAdmissionTicket(applicationId: string): Promise<Buffer> {
    const application = await this.prisma.examApplication.findUniqueOrThrow({
      where: { id: applicationId },
      include: {
        exam: {
          include: {
            tenant: true,
            campus: true,
          },
        },
        prospect: true,
        student: true,
        admissionTicket: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!application.admissionTicket) {
      throw new Error('Admission ticket not generated for this application');
    }

    return this.admissionDocumentService.generateAdmissionTicket(application);
  }

  async generateExamResultsReport(examId: string): Promise<Buffer> {
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: examId },
      include: {
        tenant: true,
        campus: true,
        applications: {
          include: {
            prospect: true,
            student: true,
          },
          where: {
            score: { not: null },
          },
        },
      },
    });

    return this.admissionDocumentService.generateExamResults(exam);
  }
}