export class TurkishId {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid Turkish ID number');
    }
    this.value = value;
  }

  private isValid(tcNo: string): boolean {
    // TC Kimlik No validation
    if (!tcNo || tcNo.length !== 11) {
      return false;
    }

    // All digits check
    if (!/^\d+$/.test(tcNo)) {
      return false;
    }

    // First digit cannot be 0
    if (tcNo[0] === '0') {
      return false;
    }

    const digits = tcNo.split('').map(Number);
    
    // Algorithm validation
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    const tenthDigit = ((oddSum * 7) - evenSum) % 10;
    if (tenthDigit !== digits[9]) {
      return false;
    }

    const eleventhDigit = (oddSum + evenSum + digits[9]) % 10;
    if (eleventhDigit !== digits[10]) {
      return false;
    }

    return true;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TurkishId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public toJSON(): string {
    return this.value;
  }

  // Mask TC number for display (e.g., 123****8901)
  public getMasked(): string {
    return this.value.substring(0, 3) + '****' + this.value.substring(7);
  }
}