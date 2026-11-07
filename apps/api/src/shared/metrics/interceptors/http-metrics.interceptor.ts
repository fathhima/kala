import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.recordMetric(context, req, start),
        error: () => this.recordMetric(context, req, start),
      }),
    );
  }

  private recordMetric(context: ExecutionContext, req: any, start: number): void {
    const route = req.route?.path ?? req.path;

    // Don't record scrape or health check endpoints
    if (route === '/metrics' || route === '/health') return;

    const duration = (Date.now() - start) / 1000;
    const res = context.switchToHttp().getResponse();

    this.metrics.httpRequestsTotal.inc({
      method: req.method,
      route,
      status: String(res.statusCode ?? 500),
    });

    this.metrics.httpRequestDuration.observe({ method: req.method, route }, duration);
  }
}
