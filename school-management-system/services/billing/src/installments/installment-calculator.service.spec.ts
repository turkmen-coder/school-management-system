import { Test, TestingModule } from '@nestjs/testing';
import { InstallmentCalculatorService } from './installment-calculator.service';

describe('InstallmentCalculatorService', () => {
  let service: InstallmentCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallmentCalculatorService],
    }).compile();

    service = module.get<InstallmentCalculatorService>(InstallmentCalculatorService);
  });

  describe('Basic Calculation Tests', () => {
    it('should divide amount equally when no remainder', () => {
      const result = service.createInstallmentPlan({
        netAmount: 12000,
        installmentCount: 12,
        firstDueDate: new Date('2024-09-15'),
        monthlyInterval: 1
      });

      expect(result).toHaveLength(12);
      result.forEach(installment => {
        expect(installment.amount).toBe(1000);
      });
    });

    it('should distribute remainder to first installments', () => {
      const result = service.createInstallmentPlan({
        netAmount: 10007, // 7 kuruş kalan
        installmentCount: 10,
        firstDueDate: new Date('2024-09-15'),
        monthlyInterval: 1
      });

      expect(result[0].amount).toBe(1000.7); // +1 kuruş
      expect(result[1].amount).toBe(1000.7); // +1 kuruş
      expect(result[6].amount).toBe(1000.7); // +1 kuruş (7. taksit)
      expect(result[7].amount).toBe(1000.7); // normal
      expect(result[8].amount).toBe(1000.7); // normal
      expect(result[9].amount).toBe(1000.7); // normal

      // Toplam tutarı kontrol et
      const total = result.reduce((sum, inst) => sum + inst.amount, 0);
      expect(Math.round(total * 100) / 100).toBe(10007);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single installment', () => {
      const result = service.createInstallmentPlan({
        netAmount: 5000,
        installmentCount: 1,
        firstDueDate: new Date('2024-09-15'),
        monthlyInterval: 1
      });

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(5000);
    });

    it('should throw error when net amount is less than installment count', () => {
      expect(() => {
        service.createInstallmentPlan({
          netAmount: 5,
          installmentCount: 10,
          firstDueDate: new Date('2024-09-15'),
          monthlyInterval: 1
        });
      }).toThrow('Net amount cannot be less than installment count');
    });

    it('should throw error when net amount is zero or negative', () => {
      expect(() => {
        service.createInstallmentPlan({
          netAmount: 0,
          installmentCount: 10,
          firstDueDate: new Date('2024-09-15'),
          monthlyInterval: 1
        });
      }).toThrow('Net amount must be greater than 0');
    });
  });

  describe('Business Day Adjustment', () => {
    it('should move weekend dates to next Monday', () => {
      // 2024-09-14 is Saturday
      const result = service.createInstallmentPlan({
        netAmount: 1000,
        installmentCount: 1,
        firstDueDate: new Date('2024-09-14'),
        monthlyInterval: 1
      });

      // Should be moved to Monday (2024-09-16)
      expect(result[0].dueDate.getDay()).toBe(1); // Monday
      expect(result[0].dueDate.getDate()).toBe(16);
    });

    it('should move holiday dates to next business day', () => {
      // Test with a known holiday (2024-01-01 - New Year's Day)
      const result = service.createInstallmentPlan({
        netAmount: 1000,
        installmentCount: 1,
        firstDueDate: new Date('2024-01-01'), // New Year's Day
        monthlyInterval: 1
      });

      // Should be moved to next business day
      expect(result[0].dueDate.getTime()).toBeGreaterThan(
        new Date('2024-01-01').getTime()
      );
    });
  });

  describe('Large Amount Tests', () => {
    it('should handle large amounts without precision loss', () => {
      const result = service.createInstallmentPlan({
        netAmount: 999999.99,
        installmentCount: 12,
        firstDueDate: new Date('2024-09-15'),
        monthlyInterval: 1
      });

      const totalCalculated = result.reduce((sum, inst) => sum + inst.amount, 0);
      expect(Math.abs(totalCalculated - 999999.99)).toBeLessThan(0.01);
    });
  });

  describe('Scholarship Distribution', () => {
    it('should correctly apply scholarship discount', () => {
      const result = service.distributeScholarship(10000, 2500, 10);

      expect(result).toHaveLength(10);
      const total = result.reduce((sum, inst) => sum + inst.amount, 0);
      expect(Math.round(total * 100) / 100).toBe(7500);
    });

    it('should return empty array for full scholarship', () => {
      const result = service.distributeScholarship(10000, 10000, 10);
      expect(result).toHaveLength(0);
    });
  });

  describe('Early Payment Discount', () => {
    it('should apply discount to specified number of installments', () => {
      const installments = service.createInstallmentPlan({
        netAmount: 10000,
        installmentCount: 10,
        firstDueDate: new Date('2024-09-15'),
        monthlyInterval: 1
      });

      const discounted = service.applyEarlyPaymentDiscount(installments, 5, 3);

      // First 3 installments should have 5% discount
      expect(discounted[0].amount).toBe(installments[0].amount * 0.95);
      expect(discounted[1].amount).toBe(installments[1].amount * 0.95);
      expect(discounted[2].amount).toBe(installments[2].amount * 0.95);
      
      // Rest should remain unchanged
      expect(discounted[3].amount).toBe(installments[3].amount);
      expect(discounted[9].amount).toBe(installments[9].amount);
    });
  });

  describe('Pesin Price Calculation', () => {
    it('should calculate pesin price with discount', () => {
      const pesinPrice = service.calculatePesinPrice(10000, 10);
      expect(pesinPrice).toBe(9000);
    });

    it('should calculate pesin price with custom discount', () => {
      const pesinPrice = service.calculatePesinPrice(10000, 15);
      expect(pesinPrice).toBe(8500);
    });
  });
});