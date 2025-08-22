import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  service?: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  statusCode?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
          });
        })
      ),
      defaultMeta: {
        service: process.env.SERVICE_NAME || 'school-management',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.SERVICE_VERSION || '1.0.0',
      },
      transports: [
        // Console output for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${level}] ${message} ${metaString}`;
            })
          ),
        }),

        // Daily rotate file for all logs
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),

        // Daily rotate file for error logs only
        new DailyRotateFile({
          level: 'error',
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });
  }

  log(message: string, context?: LogContext) {
    this.logger.info(message, context);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.logger.error(message, {
      ...context,
      trace,
    });
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: LogContext) {
    this.logger.verbose(message, context);
  }

  // Structured logging methods
  logAuth(action: string, context: LogContext) {
    this.log(`Auth: ${action}`, {
      ...context,
      category: 'auth',
      action,
    });
  }

  logDatabase(action: string, table: string, duration: number, context?: LogContext) {
    this.log(`Database: ${action} on ${table}`, {
      ...context,
      category: 'database',
      action,
      table,
      duration,
    });
  }

  logAPI(method: string, url: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    this.logger[level](`API: ${method} ${url}`, {
      ...context,
      category: 'api',
      method,
      url,
      statusCode,
      duration,
    });
  }

  logBusiness(event: string, entity: string, entityId: string, context?: LogContext) {
    this.log(`Business: ${event} for ${entity}`, {
      ...context,
      category: 'business',
      event,
      entity,
      entityId,
    });
  }

  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext) {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.logger[level](`Security: ${event}`, {
      ...context,
      category: 'security',
      event,
      severity,
    });
  }

  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.logger[level](`Performance: ${operation} took ${duration}ms`, {
      ...context,
      category: 'performance',
      operation,
      duration,
    });
  }

  // Create child logger with persistent context
  createChildLogger(persistentContext: LogContext): CustomLogger {
    const childLogger = new CustomLogger();
    const originalLog = childLogger.log.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalDebug = childLogger.debug.bind(childLogger);

    childLogger.log = (message: string, context?: LogContext) => {
      originalLog(message, { ...persistentContext, ...context });
    };

    childLogger.error = (message: string, trace?: string, context?: LogContext) => {
      originalError(message, trace, { ...persistentContext, ...context });
    };

    childLogger.warn = (message: string, context?: LogContext) => {
      originalWarn(message, { ...persistentContext, ...context });
    };

    childLogger.debug = (message: string, context?: LogContext) => {
      originalDebug(message, { ...persistentContext, ...context });
    };

    return childLogger;
  }

  // Audit logging for compliance
  logAudit(action: string, resource: string, resourceId: string, context?: LogContext) {
    this.log(`Audit: ${action} on ${resource}`, {
      ...context,
      category: 'audit',
      action,
      resource,
      resourceId,
      auditTimestamp: new Date().toISOString(),
    });
  }
}