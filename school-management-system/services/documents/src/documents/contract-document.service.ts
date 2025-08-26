import { Injectable } from '@nestjs/common';

// TODO: Fix PDF module import when available
interface ContractData {
  contractNo: string;
  tenant: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  campus: {
    name: string;
    address?: string;
    phone?: string;
  };
  student: {
    firstName: string;
    lastName: string;
    tcNo: string;
    birthDate: Date;
    classLevel: string;
  };
  parent: {
    firstName: string;
    lastName: string;
    tcNo: string;
    phone: string;
    email: string;
    address: string;
  };
  schoolYear: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  installments: Array<{
    sequenceNo: number;
    amount: number;
    dueDate: Date;
  }>;
  items: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
  }>;
  discounts?: Array<{
    type: string;
    amount?: number;
    percentage?: number;
    reason?: string;
  }>;
}

class ContractGenerator {
  static generateContract(data: ContractData): Buffer {
    // TODO: Implement PDF generation
    return Buffer.from(`Mock Contract PDF for ${data.student.firstName} ${data.student.lastName}`);
  }

  static generateInstallmentPlan(data: ContractData): Buffer {
    // TODO: Implement PDF generation
    return Buffer.from(`Mock Installment Plan PDF for ${data.student.firstName} ${data.student.lastName}`);
  }
}

@Injectable()
export class ContractDocumentService {
  async generateContract(contract: any): Promise<Buffer> {
    const primaryParent = contract.student.parentRelations[0]?.parent;
    
    if (!primaryParent) {
      throw new Error('Primary parent not found for student');
    }

    const contractData: ContractData = {
      contractNo: contract.contractNo,
      tenant: {
        name: contract.tenant.name,
        address: contract.tenant.settings?.address,
        phone: contract.tenant.settings?.phone,
        email: contract.tenant.settings?.email,
      },
      campus: {
        name: contract.campus.name,
        address: contract.campus.address,
        phone: contract.campus.phone,
      },
      student: {
        firstName: contract.student.firstName,
        lastName: contract.student.lastName,
        tcNo: contract.student.tcNo,
        birthDate: contract.student.birthDate,
        classLevel: contract.student.classLevel,
      },
      parent: {
        firstName: primaryParent.firstName,
        lastName: primaryParent.lastName,
        tcNo: primaryParent.tcNo,
        phone: primaryParent.phone,
        email: primaryParent.email,
        address: primaryParent.address,
      },
      schoolYear: contract.schoolYear,
      totalAmount: Number(contract.totalAmount),
      discountAmount: Number(contract.discountAmount),
      netAmount: Number(contract.netAmount),
      installments: contract.installments.map((inst: any) => ({
        sequenceNo: inst.sequenceNo,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
      })),
      items: contract.items.map((item: any) => ({
        description: item.feeItem.name,
        quantity: item.quantity,
        unitAmount: Number(item.unitAmount),
        totalAmount: Number(item.totalAmount),
      })),
      discounts: contract.discounts?.map((discount: any) => ({
        type: discount.type,
        amount: discount.amount ? Number(discount.amount) : undefined,
        percentage: discount.percentage,
        reason: discount.reason,
      })),
    };

    return ContractGenerator.generateContract(contractData);
  }

  async generateInstallmentPlan(contract: any): Promise<Buffer> {
    const primaryParent = contract.student.parentRelations[0]?.parent;
    
    if (!primaryParent) {
      throw new Error('Primary parent not found for student');
    }

    const contractData: ContractData = {
      contractNo: contract.contractNo,
      tenant: {
        name: contract.tenant.name,
      },
      campus: {
        name: contract.campus.name,
      },
      student: {
        firstName: contract.student.firstName,
        lastName: contract.student.lastName,
        tcNo: contract.student.tcNo,
        birthDate: contract.student.birthDate,
        classLevel: contract.student.classLevel,
      },
      parent: {
        firstName: primaryParent.firstName,
        lastName: primaryParent.lastName,
        tcNo: primaryParent.tcNo,
        phone: primaryParent.phone,
        email: primaryParent.email,
        address: primaryParent.address,
      },
      schoolYear: contract.schoolYear,
      totalAmount: Number(contract.totalAmount),
      discountAmount: Number(contract.discountAmount),
      netAmount: Number(contract.netAmount),
      installments: contract.installments.map((inst: any) => ({
        sequenceNo: inst.sequenceNo,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
      })),
      items: [],
    };

    return ContractGenerator.generateInstallmentPlan(contractData);
  }
}