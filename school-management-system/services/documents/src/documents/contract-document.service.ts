import { Injectable } from '@nestjs/common';
import { ContractGenerator, ContractData } from '@school-management/pdf';

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
      installments: contract.installments.map(inst => ({
        sequenceNo: inst.sequenceNo,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
      })),
      items: contract.items.map(item => ({
        description: item.feeItem.name,
        quantity: item.quantity,
        unitAmount: Number(item.unitAmount),
        totalAmount: Number(item.totalAmount),
      })),
      discounts: contract.discounts?.map(discount => ({
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
      installments: contract.installments.map(inst => ({
        sequenceNo: inst.sequenceNo,
        amount: Number(inst.amount),
        dueDate: inst.dueDate,
      })),
      items: [],
    };

    return ContractGenerator.generateInstallmentPlan(contractData);
  }
}