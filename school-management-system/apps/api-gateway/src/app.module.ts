import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import * as redisStore from 'cache-manager-redis-store';
// import { AuthModule } from './auth/auth.module';
// import { AdminModule } from './admin/admin.module';
// import { MobileModule } from './mobile/mobile.module';
// import { ServicesModule } from './services/services.module';
// import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'medium',
        ttl: 600000, // 10 minutes
        limit: 500, // 500 requests per 10 minutes
      },
    ]),

    // Caching - Simplified for now
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default TTL
    }),

    // HTTP client
    HttpModule.register({
      timeout: 30000, // 30 seconds
      maxRedirects: 3,
    }),

    // Application modules - commented out until modules are created
    // AuthModule,
    // AdminModule,
    // MobileModule,
    // ServicesModule,
    // HealthModule,
  ],
})
export class AppModule {}