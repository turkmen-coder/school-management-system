import { BaseEntity } from './base.entity';
import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  domain: z.string().min(1).max(100),
  settings: z.record(z.any()).default({}),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TenantData = z.infer<typeof TenantSchema>;

export class Tenant extends BaseEntity {
  public name: string;
  public domain: string;
  public settings: Record<string, any>;
  public isActive: boolean;

  constructor(data: Partial<TenantData>) {
    super(data.id);
    this.name = data.name || '';
    this.domain = data.domain || '';
    this.settings = data.settings || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  public activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }

  public updateSettings(settings: Record<string, any>): void {
    this.settings = { ...this.settings, ...settings };
    this.updateTimestamp();
  }

  public toJSON(): TenantData {
    return {
      id: this.id,
      name: this.name,
      domain: this.domain,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}