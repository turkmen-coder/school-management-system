import { Injectable } from '@nestjs/common';
import { Money } from '@school/kernel';

export interface InstallmentPlan {
  sequenceNo: number;
  amount: number;
  dueDate: Date;
}

export interface CreateInstallmentPlanRequest {
  netAmount: number;
  installmentCount: number;
  firstDueDate: Date;
  monthlyInterval: number; // Ayda kaç taksit (1 veya 12)
}

@Injectable()
export class InstallmentCalculatorService {
  
  calculateInstallments(
    totalAmount: number,
    installmentCount: number,
    interestRate: number = 0
  ): InstallmentPlan[] {
    const firstDueDate = new Date();
    firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    
    return this.createInstallmentPlan({
      netAmount: totalAmount * (1 + interestRate / 100),
      installmentCount,
      firstDueDate,
      monthlyInterval: 1
    });
  }
  private readonly holidays: Date[] = [
    // 2024 Resmi tatiller
    new Date('2024-01-01'), // Yılbaşı
    new Date('2024-04-23'), // 23 Nisan
    new Date('2024-05-01'), // 1 Mayıs
    new Date('2024-05-19'), // 19 Mayıs
    new Date('2024-07-15'), // 15 Temmuz
    new Date('2024-08-30'), // 30 Ağustos
    new Date('2024-10-29'), // Cumhuriyet Bayramı
    // Ramazan ve Kurban Bayramı tarihleri değişkendir
  ];

  public createInstallmentPlan(
    request: CreateInstallmentPlanRequest
  ): InstallmentPlan[] {
    const { netAmount, installmentCount, firstDueDate, monthlyInterval } = request;

    // Validation
    if (netAmount <= 0) {
      throw new Error('Net amount must be greater than 0');
    }
    if (installmentCount <= 0) {
      throw new Error('Installment count must be greater than 0');
    }
    if (netAmount < installmentCount) {
      throw new Error('Net amount cannot be less than installment count');
    }

    // Tutarı kuruş cinsine çevir (floating point problemini önlemek için)
    const netAmountInKurus = Math.round(netAmount * 100);

    // Temel taksit tutarı (kuruş cinsinden)
    const baseAmountInKurus = Math.floor(netAmountInKurus / installmentCount);

    // Kalan kuruşlar
    const remainderKurus = netAmountInKurus % installmentCount;

    const installments: InstallmentPlan[] = [];
    let currentDueDate = new Date(firstDueDate);

    for (let i = 0; i < installmentCount; i++) {
      // İlk taksitlerden itibaren kalan kuruşları dağıt
      const extraKurus = i < remainderKurus ? 1 : 0;
      const installmentAmountKurus = baseAmountInKurus + extraKurus;
      const installmentAmount = installmentAmountKurus / 100;

      // Vade tarihini iş gününe ayarla
      const adjustedDueDate = this.adjustToBusinessDay(currentDueDate);

      installments.push({
        sequenceNo: i + 1,
        amount: installmentAmount,
        dueDate: adjustedDueDate
      });

      // Bir sonraki vade tarihini hesapla
      if (monthlyInterval === 1) {
        // Aylık taksit
        currentDueDate = this.addMonths(currentDueDate, 1);
      } else {
        // Peşin dışı taksitler için eşit dağılım
        const daysBetween = 365 / installmentCount;
        currentDueDate = this.addDays(currentDueDate, Math.round(daysBetween));
      }
    }

    return installments;
  }

  private adjustToBusinessDay(date: Date): Date {
    let adjustedDate = new Date(date);

    // Hafta sonu kontrolü
    while (this.isWeekend(adjustedDate) || this.isHoliday(adjustedDate)) {
      adjustedDate = this.addDays(adjustedDate, 1);
    }

    return adjustedDate;
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Pazar (0) veya Cumartesi (6)
  }

  private isHoliday(date: Date): boolean {
    return this.holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
    );
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const targetMonth = result.getMonth() + months;
    const targetDate = result.getDate();
    
    // Set to first day to avoid issues with different month lengths
    result.setDate(1);
    result.setMonth(targetMonth);
    
    // Get the last day of the target month
    const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    
    // Set the date to the original date or the last day of the month if it doesn't exist
    result.setDate(Math.min(targetDate, lastDayOfMonth));
    
    return result;
  }

  public calculatePesinPrice(totalAmount: number, discountPercentage: number = 10): number {
    const discountAmount = totalAmount * (discountPercentage / 100);
    return totalAmount - discountAmount;
  }

  public distributeScholarship(
    totalAmount: number,
    scholarshipAmount: number,
    installmentCount: number
  ): InstallmentPlan[] {
    const netAmount = totalAmount - scholarshipAmount;
    
    if (netAmount <= 0) {
      // Full scholarship
      return [];
    }

    return this.createInstallmentPlan({
      netAmount,
      installmentCount,
      firstDueDate: new Date(),
      monthlyInterval: 1
    });
  }

  public applyEarlyPaymentDiscount(
    installments: InstallmentPlan[],
    discountPercentage: number,
    maxInstallments: number
  ): InstallmentPlan[] {
    return installments.map((installment, index) => {
      if (index < maxInstallments) {
        const discountAmount = installment.amount * (discountPercentage / 100);
        return {
          ...installment,
          amount: installment.amount - discountAmount
        };
      }
      return installment;
    });
  }
}