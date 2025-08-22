export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'TRY') {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this.amount = Math.round(amount * 100) / 100; // 2 decimal places
    this.currency = currency;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getAmountInKurus(): number {
    return Math.round(this.amount * 100);
  }

  public add(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + money.amount, this.currency);
  }

  public subtract(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    if (this.amount < money.amount) {
      throw new Error('Insufficient funds');
    }
    return new Money(this.amount - money.amount, this.currency);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  public divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  public equals(money: Money): boolean {
    return this.amount === money.amount && this.currency === money.currency;
  }

  public isGreaterThan(money: Money): boolean {
    if (this.currency !== money.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > money.amount;
  }

  public isLessThan(money: Money): boolean {
    if (this.currency !== money.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < money.amount;
  }

  public format(): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: this.currency
    }).format(this.amount);
  }

  public toString(): string {
    return this.format();
  }

  public toJSON() {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }
}