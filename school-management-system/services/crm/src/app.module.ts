import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProspectsModule } from './prospects/prospects.module';
import { PersistenceModule } from '@school/persistence';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PersistenceModule,
    ProspectsModule,
  ],
})
export class AppModule {}