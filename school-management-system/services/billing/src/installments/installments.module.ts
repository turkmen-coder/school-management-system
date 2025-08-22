import { Module } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';
import { InstallmentCalculatorService } from './installment-calculator.service';

@Module({
  controllers: [InstallmentsController],
  providers: [InstallmentsService, InstallmentCalculatorService],
  exports: [InstallmentsService, InstallmentCalculatorService],
})
export class InstallmentsModule {}