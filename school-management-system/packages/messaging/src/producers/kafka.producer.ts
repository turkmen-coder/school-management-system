import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { BaseEvent } from '../events';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'school-management-producer',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
    
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishEvent(topic: string, event: BaseEvent): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.id,
            value: JSON.stringify(event),
            headers: {
              type: event.type,
              tenantId: event.tenantId || '',
              timestamp: event.timestamp.toISOString(),
            },
          },
        ],
      });
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async publishEvents(topic: string, events: BaseEvent[]): Promise<void> {
    try {
      const messages = events.map(event => ({
        key: event.id,
        value: JSON.stringify(event),
        headers: {
          type: event.type,
          tenantId: event.tenantId || '',
          timestamp: event.timestamp.toISOString(),
        },
      }));

      await this.producer.send({
        topic,
        messages,
      });
    } catch (error) {
      console.error('Failed to publish events:', error);
      throw error;
    }
  }
}