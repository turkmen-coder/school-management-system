import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id?: string) {
    this.id = id || uuidv4();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  public equals(entity: BaseEntity): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    return this.id === entity.id;
  }
}