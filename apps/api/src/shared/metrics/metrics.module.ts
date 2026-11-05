import { Global, Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    MetricsService,
    HttpMetricsInterceptor,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    makeCounterProvider({
      name: 'bookings_total',
      help: 'Total number of bookings',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: 'payments_total',
      help: 'Total number of payments',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: 'bullmq_jobs_total',
      help: 'Total BullMQ jobs processed',
      labelNames: ['queue', 'status'],
    }),
  ],
  exports: [MetricsService, HttpMetricsInterceptor],
})
export class MetricsModule {}
