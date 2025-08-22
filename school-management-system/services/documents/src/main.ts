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
          clientId: 'documents-service',
          brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
        },
        consumer: {
          groupId: 'documents-service-consumer',
        },
      },
    },
  );

  // HTTP endpoint for document generation
  const httpApp = await NestFactory.create(AppModule);
  httpApp.enableCors();
  
  await httpApp.listen(process.env.PORT || 3006);
  await app.listen();
  
  console.log('Documents service is running on:', process.env.PORT || 3006);
}

bootstrap();