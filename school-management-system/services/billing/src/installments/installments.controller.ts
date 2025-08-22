import { Controller, Post, Body } from '@nestjs/common';
import { InstallmentsService } from './installments.service';

interface CalculateInstallmentsDto {
  totalAmount: number;
  installmentCount: number;
  interestRate?: number;
}

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post('calculate')
  async calculateInstallments(@Body() dto: CalculateInstallmentsDto) {
    return this.installmentsService.calculateInstallments(
      dto.totalAmount,
      dto.installmentCount,
      dto.interestRate
    );
  }
}