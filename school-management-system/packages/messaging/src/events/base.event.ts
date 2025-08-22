export interface BaseEvent {
  id: string;
  type: string;
  tenantId?: string;
  timestamp: Date;
  version: string;
  metadata?: Record<string, any>;
}

export abstract class DomainEvent implements BaseEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly tenantId?: string;
  public readonly timestamp: Date;
  public readonly version: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    id: string,
    type: string,
    tenantId?: string,
    metadata?: Record<string, any>
  ) {
    this.id = id;
    this.type = type;
    this.tenantId = tenantId;
    this.timestamp = new Date();
    this.version = '1.0.0';
    this.metadata = metadata;
  }
}