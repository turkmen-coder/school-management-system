import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnApplicationShutdown {
  private readonly register: promClient.Registry;

  // HTTP metrics
  private readonly httpRequestDuration: promClient.Histogram<string>;
  private readonly httpRequestTotal: promClient.Counter<string>;
  private readonly httpRequestSize: promClient.Histogram<string>;
  private readonly httpResponseSize: promClient.Histogram<string>;

  // Database metrics
  private readonly dbConnectionPool: promClient.Gauge<string>;
  private readonly dbQueryDuration: promClient.Histogram<string>;
  private readonly dbQueryTotal: promClient.Counter<string>;

  // Business metrics
  private readonly studentEnrollments: promClient.Counter<string>;
  private readonly examApplications: promClient.Counter<string>;
  private readonly prospectConversions: promClient.Counter<string>;
  private readonly activeUsers: promClient.Gauge<string>;

  // System metrics
  private readonly memoryUsage: promClient.Gauge<string>;
  private readonly cpuUsage: promClient.Gauge<string>;
  private readonly uptime: promClient.Gauge<string>;

  // Error metrics
  private readonly errorTotal: promClient.Counter<string>;
  private readonly warningTotal: promClient.Counter<string>;

  constructor() {
    this.register = new promClient.Registry();

    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: 'school_management_',
    });

    // HTTP Metrics
    this.httpRequestDuration = new promClient.Histogram({
      name: 'school_management_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'school_management_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
    });

    this.httpRequestSize = new promClient.Histogram({
      name: 'school_management_http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route', 'service'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    this.httpResponseSize = new promClient.Histogram({
      name: 'school_management_http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'service'],
      buckets: [100, 1000, 10000, 100000, 1000000],
    });

    // Database Metrics
    this.dbConnectionPool = new promClient.Gauge({
      name: 'school_management_db_connections_active',
      help: 'Number of active database connections',
      labelNames: ['database', 'service'],
    });

    this.dbQueryDuration = new promClient.Histogram({
      name: 'school_management_db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table', 'service'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
    });

    this.dbQueryTotal = new promClient.Counter({
      name: 'school_management_db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status', 'service'],
    });

    // Business Metrics
    this.studentEnrollments = new promClient.Counter({
      name: 'school_management_student_enrollments_total',
      help: 'Total number of student enrollments',
      labelNames: ['tenant_id', 'class_level', 'status'],
    });

    this.examApplications = new promClient.Counter({
      name: 'school_management_exam_applications_total',
      help: 'Total number of exam applications',
      labelNames: ['tenant_id', 'exam_type', 'status'],
    });

    this.prospectConversions = new promClient.Counter({
      name: 'school_management_prospect_conversions_total',
      help: 'Total number of prospect conversions',
      labelNames: ['tenant_id', 'source', 'stage'],
    });

    this.activeUsers = new promClient.Gauge({
      name: 'school_management_active_users',
      help: 'Number of currently active users',
      labelNames: ['tenant_id', 'role'],
    });

    // System Metrics
    this.memoryUsage = new promClient.Gauge({
      name: 'school_management_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type', 'service'],
    });

    this.cpuUsage = new promClient.Gauge({
      name: 'school_management_cpu_usage_percent',
      help: 'CPU usage percentage',
      labelNames: ['service'],
    });

    this.uptime = new promClient.Gauge({
      name: 'school_management_uptime_seconds',
      help: 'Service uptime in seconds',
      labelNames: ['service'],
    });

    // Error Metrics
    this.errorTotal = new promClient.Counter({
      name: 'school_management_errors_total',
      help: 'Total number of errors',
      labelNames: ['service', 'type', 'severity'],
    });

    this.warningTotal = new promClient.Counter({
      name: 'school_management_warnings_total',
      help: 'Total number of warnings',
      labelNames: ['service', 'type'],
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.httpRequestSize);
    this.register.registerMetric(this.httpResponseSize);
    this.register.registerMetric(this.dbConnectionPool);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.dbQueryTotal);
    this.register.registerMetric(this.studentEnrollments);
    this.register.registerMetric(this.examApplications);
    this.register.registerMetric(this.prospectConversions);
    this.register.registerMetric(this.activeUsers);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.cpuUsage);
    this.register.registerMetric(this.uptime);
    this.register.registerMetric(this.errorTotal);
    this.register.registerMetric(this.warningTotal);

    // Start collecting system metrics
    this.startSystemMetricsCollection();
  }

  // HTTP Methods
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, service: string) {
    this.httpRequestDuration.labels(method, route, statusCode.toString(), service).observe(duration);
    this.httpRequestTotal.labels(method, route, statusCode.toString(), service).inc();
  }

  recordHttpRequestSize(method: string, route: string, size: number, service: string) {
    this.httpRequestSize.labels(method, route, service).observe(size);
  }

  recordHttpResponseSize(method: string, route: string, size: number, service: string) {
    this.httpResponseSize.labels(method, route, service).observe(size);
  }

  // Database Methods
  recordDbConnectionPool(database: string, activeConnections: number, service: string) {
    this.dbConnectionPool.labels(database, service).set(activeConnections);
  }

  recordDbQuery(operation: string, table: string, duration: number, status: string, service: string) {
    this.dbQueryDuration.labels(operation, table, service).observe(duration);
    this.dbQueryTotal.labels(operation, table, status, service).inc();
  }

  // Business Methods
  recordStudentEnrollment(tenantId: string, classLevel: string, status: string) {
    this.studentEnrollments.labels(tenantId, classLevel, status).inc();
  }

  recordExamApplication(tenantId: string, examType: string, status: string) {
    this.examApplications.labels(tenantId, examType, status).inc();
  }

  recordProspectConversion(tenantId: string, source: string, stage: string) {
    this.prospectConversions.labels(tenantId, source, stage).inc();
  }

  setActiveUsers(tenantId: string, role: string, count: number) {
    this.activeUsers.labels(tenantId, role).set(count);
  }

  // Error Methods
  recordError(service: string, type: string, severity: string) {
    this.errorTotal.labels(service, type, severity).inc();
  }

  recordWarning(service: string, type: string) {
    this.warningTotal.labels(service, type).inc();
  }

  // System Methods
  private startSystemMetricsCollection() {
    const service = process.env.SERVICE_NAME || 'unknown';
    const startTime = Date.now();

    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      this.memoryUsage.labels('heap_used', service).set(memoryUsage.heapUsed);
      this.memoryUsage.labels('heap_total', service).set(memoryUsage.heapTotal);
      this.memoryUsage.labels('external', service).set(memoryUsage.external);
      this.memoryUsage.labels('rss', service).set(memoryUsage.rss);

      // CPU usage (approximated)
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      this.cpuUsage.labels(service).set(cpuPercent);

      // Uptime
      const uptimeSeconds = (Date.now() - startTime) / 1000;
      this.uptime.labels(service).set(uptimeSeconds);
    }, 5000); // Collect every 5 seconds
  }

  // Get metrics for Prometheus endpoint
  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Get registry for custom use
  getRegistry(): promClient.Registry {
    return this.register;
  }

  // Custom business logic metrics
  createCustomCounter(name: string, help: string, labelNames: string[] = []): promClient.Counter<string> {
    const counter = new promClient.Counter({
      name: `school_management_${name}`,
      help,
      labelNames,
    });
    this.register.registerMetric(counter);
    return counter;
  }

  createCustomGauge(name: string, help: string, labelNames: string[] = []): promClient.Gauge<string> {
    const gauge = new promClient.Gauge({
      name: `school_management_${name}`,
      help,
      labelNames,
    });
    this.register.registerMetric(gauge);
    return gauge;
  }

  createCustomHistogram(name: string, help: string, labelNames: string[] = [], buckets?: number[]): promClient.Histogram<string> {
    const histogram = new promClient.Histogram({
      name: `school_management_${name}`,
      help,
      labelNames,
      buckets: buckets || [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });
    this.register.registerMetric(histogram);
    return histogram;
  }

  onApplicationShutdown(signal?: string) {
    // Clear all metrics on shutdown
    this.register.clear();
  }
}