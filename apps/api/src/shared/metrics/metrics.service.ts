import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Histogram } from "prom-client";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric("http_requests_total")
    public readonly httpRequestsTotal: Counter<string>,

    @InjectMetric("http_request_duration_seconds")
    public readonly httpRequestDuration: Histogram<string>,

    @InjectMetric("bookings_total")
    public readonly bookingsTotal: Counter<string>,

    @InjectMetric("payments_total")
    public readonly paymentsTotal: Counter<string>,

    @InjectMetric("bullmq_jobs_total")
    public readonly bullmqJobsTotal: Counter<string>,
  ) {}
}
