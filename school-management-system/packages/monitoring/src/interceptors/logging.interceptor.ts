import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const start = Date.now();

    const { method, url, headers, body } = req;
    const uaHeader = headers['user-agent'];
    const userAgent = (Array.isArray(uaHeader) ? uaHeader[0] : uaHeader) ?? '';
    const ip = req.ip || req.socket?.remoteAddress || '';
    const ridHeader = headers['x-request-id'];
    const requestId = (Array.isArray(ridHeader) ? ridHeader[0] : ridHeader) ?? this.generateRequestId();
    const tidHeader = headers['x-tenant-id'];
    const tenantId = Array.isArray(tidHeader) ? tidHeader[0] : tidHeader;
    const userId = (req as any).user?.id;
    const service = process.env.SERVICE_NAME || 'unknown';

    // Log request start
    this.logger.logAPI(method, url, 0, 0, {
      requestId,
      tenantId,
      userId,
      userAgent,
      ip,
      service,
      metadata: {
        requestBody: this.sanitizeBody(body),
        requestSize: JSON.stringify(body || {}).length,
      },
    });

    // Record request size
    const requestSize = JSON.stringify(body || {}).length;
    this.metrics.recordHttpRequestSize(method, url, requestSize, service);

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const duration = Date.now() - start;
          const statusCode = res.statusCode;
          const route = req.route?.path || url;
          
          // Log successful response
          this.logger.logAPI(method, url, statusCode, duration, {
            requestId,
            tenantId,
            userId,
            userAgent,
            ip,
            service,
            metadata: {
              responseSize: JSON.stringify(responseBody || {}).length,
              responseTime: duration,
            },
          });

          // Record metrics
          this.metrics.recordHttpRequest(method, route, statusCode, duration / 1000, service);
          const responseSize = JSON.stringify(responseBody || {}).length;
          this.metrics.recordHttpResponseSize(method, route, responseSize, service);

          // Log performance warnings
          if (duration > 1000) {
            this.logger.logPerformance(`Slow API response: ${method} ${url}`, duration, {
              requestId,
              tenantId,
              userId,
              service,
            });
          }
        },
        error: (error) => {
          const duration = Date.now() - start;
          const statusCode = res.statusCode || 500;
          const route = req.route?.path || url;

          // Log error
          this.logger.error(
            `API Error: ${method} ${url} - ${error.message}`,
            error.stack,
            {
              requestId,
              tenantId,
              userId,
              userAgent,
              ip,
              service,
              statusCode,
              duration,
              error,
            },
          );

          // Record error metrics
          this.metrics.recordHttpRequest(method, route, statusCode, duration / 1000, service);
          this.metrics.recordError(service, 'http_error', statusCode >= 500 ? 'critical' : 'medium');
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...body };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          obj[key] = sanitizeObject(obj[key]);
        }
      }
      return obj;
    };

    return sanitizeObject(sanitized);
  }
}