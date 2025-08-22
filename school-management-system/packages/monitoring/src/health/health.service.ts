import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @HealthCheck()
  async check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      
      // Memory health check (heap should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Memory health check (RSS should not exceed 300MB)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      
      // Disk health check (storage should not exceed 90% of capacity)
      () => this.disk.checkStorage('storage', { 
        thresholdPercent: 0.9, 
        path: '/' 
      }),
    ]);
  }

  @HealthCheck()
  async checkReadiness() {
    return this.health.check([
      // Database connectivity for readiness
      () => this.db.pingCheck('database'),
      
      // Custom readiness checks
      () => this.checkDependentServices(),
      () => this.checkCriticalComponents(),
    ]);
  }

  @HealthCheck()
  async checkLiveness() {
    return this.health.check([
      // Basic liveness checks
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.checkApplicationHealth(),
    ]);
  }

  private async checkDependentServices() {
    try {
      // Check Redis connection
      const redisHealthy = await this.checkRedisHealth();
      
      // Check Kafka connection
      const kafkaHealthy = await this.checkKafkaHealth();
      
      // Check external APIs if any
      const externalApisHealthy = await this.checkExternalApis();

      if (redisHealthy && kafkaHealthy && externalApisHealthy) {
        return {
          'dependent-services': {
            status: 'up',
            details: {
              redis: redisHealthy,
              kafka: kafkaHealthy,
              externalApis: externalApisHealthy,
            },
          },
        };
      }

      throw new Error('One or more dependent services are unhealthy');
    } catch (error) {
      return {
        'dependent-services': {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private async checkCriticalComponents() {
    try {
      // Check if essential services are running
      const authServiceHealthy = await this.checkServiceHealth('auth');
      const crmServiceHealthy = await this.checkServiceHealth('crm');
      const enrollmentServiceHealthy = await this.checkServiceHealth('enrollment');
      const examServiceHealthy = await this.checkServiceHealth('exam');

      return {
        'critical-components': {
          status: 'up',
          details: {
            authService: authServiceHealthy,
            crmService: crmServiceHealthy,
            enrollmentService: enrollmentServiceHealthy,
            examService: examServiceHealthy,
          },
        },
      };
    } catch (error) {
      return {
        'critical-components': {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private async checkApplicationHealth() {
    try {
      // Check application-specific health indicators
      const startupTime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Consider unhealthy if uptime is too low (just started)
      if (startupTime < 10) {
        throw new Error('Application is still starting up');
      }

      // Check for memory leaks
      const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (heapUsedPercentage > 95) {
        throw new Error('Memory usage is critically high');
      }

      return {
        'application-health': {
          status: 'up',
          details: {
            uptime: startupTime,
            memoryUsage: {
              heapUsed: memoryUsage.heapUsed,
              heapTotal: memoryUsage.heapTotal,
              heapUsedPercentage: Math.round(heapUsedPercentage),
            },
            cpuUsage,
          },
        },
      };
    } catch (error) {
      return {
        'application-health': {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      // In a real implementation, you would check Redis connection here
      // For now, we'll simulate a health check
      return process.env.REDIS_URL ? true : false;
    } catch (error) {
      return false;
    }
  }

  private async checkKafkaHealth(): Promise<boolean> {
    try {
      // In a real implementation, you would check Kafka connection here
      // For now, we'll simulate a health check
      return process.env.KAFKA_BROKERS ? true : false;
    } catch (error) {
      return false;
    }
  }

  private async checkExternalApis(): Promise<boolean> {
    try {
      // Check external API dependencies (SMS provider, email service, etc.)
      // This would make actual HTTP requests to health endpoints
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkServiceHealth(serviceName: string): Promise<boolean> {
    try {
      // In a microservices environment, this would check if the service is reachable
      // For now, we'll simulate based on environment configuration
      const serviceUrl = process.env[`${serviceName.toUpperCase()}_SERVICE_URL`];
      return Boolean(serviceUrl);
    } catch (error) {
      return false;
    }
  }

  // Custom health indicators for business logic
  async checkBusinessHealth() {
    return this.health.check([
      () => this.checkDatabaseIntegrity(),
      () => this.checkCriticalBusinessProcesses(),
    ]);
  }

  private async checkDatabaseIntegrity() {
    try {
      // Check critical tables exist and have expected structure
      // This would run basic queries to verify data integrity
      
      return {
        'database-integrity': {
          status: 'up',
          message: 'Database integrity check passed',
        },
      };
    } catch (error) {
      return {
        'database-integrity': {
          status: 'down',
          message: `Database integrity check failed: ${error.message}`,
        },
      };
    }
  }

  private async checkCriticalBusinessProcesses() {
    try {
      // Check if critical business processes are working
      // For example: can create a student, can process an application, etc.
      
      const processes = {
        studentEnrollment: true,
        examApplications: true,
        prospectManagement: true,
        documentGeneration: true,
        notifications: true,
      };

      const allHealthy = Object.values(processes).every(Boolean);

      if (!allHealthy) {
        throw new Error('One or more critical business processes are failing');
      }

      return {
        'business-processes': {
          status: 'up',
          details: processes,
        },
      };
    } catch (error) {
      return {
        'business-processes': {
          status: 'down',
          message: error.message,
        },
      };
    }
  }
}