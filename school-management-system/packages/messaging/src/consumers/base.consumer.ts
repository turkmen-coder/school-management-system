import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export interface EventHandler<T = any> {
  handle(event: T): Promise<void>;
}

@Injectable()
export abstract class BaseKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  protected abstract groupId: string;
  protected abstract topics: string[];

  constructor() {
    this.kafka = new Kafka({
      clientId: 'school-management-consumer',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
  }

  async onModuleInit() {
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    await this.consumer.connect();
    
    for (const topic of this.topics) {
      await this.consumer.subscribe({ topic });
    }

    await this.consumer.run({
      eachMessage: this.handleMessage.bind(this),
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const { topic, message } = payload;
      const eventType = message.headers?.type?.toString();
      const eventData = JSON.parse(message.value?.toString() || '{}');

      await this.processEvent(topic, eventType || 'unknown', eventData);
    } catch (error) {
      console.error('Failed to process message:', error);
      // Implement dead letter queue logic here
    }
  }

  protected abstract processEvent(
    topic: string,
    eventType: string,
    eventData: any
  ): Promise<void>;
}