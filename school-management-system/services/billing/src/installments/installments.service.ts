import { Injectable } from '@nestjs/common';
import { InstallmentCalculatorService } from './installment-calculator.service';

@Injectable()
export class InstallmentsService {
  constructor(
    private readonly installmentCalculatorService: InstallmentCalculatorService
  ) {}

  async calculateInstallments(
    totalAmount: number,
    installmentCount: number,
    interestRate: number = 0
  ) {
    return this.installmentCalculatorService.calculateInstallments(
      totalAmount,
      installmentCount,
      interestRate
    );
  }
}