import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notifications-service',
          brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        },
        consumer: {
          groupId: 'notifications-service-consumer',
        },
      },
    },
  );

  // HTTP endpoint for notification management
  const httpApp = await NestFactory.create(AppModule);
  httpApp.enableCors();
  
  await httpApp.listen(process.env.PORT || 3005);
  await app.listen();
  
  console.log('Notifications service is running on:', process.env.PORT || 3005);
}

bootstrap();