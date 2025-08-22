import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const service = process.env.SERVICE_NAME || 'unknown';

    // Add request ID if not present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      
      this.metrics.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration,
        service,
      );

      // Record request/response sizes
      const requestSize = req.get('content-length') ? parseInt(req.get('content-length')!) : 0;
      if (requestSize > 0) {
        this.metrics.recordHttpRequestSize(req.method, route, requestSize, service);
      }
    });

    next();
  }
}