import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InstallmentsModule } from './installments/installments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InstallmentsModule,
  ],
})
export class AppModule {}