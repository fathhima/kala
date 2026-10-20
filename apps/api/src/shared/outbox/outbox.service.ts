import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { IOutboxService, OutboxEventRecord } from './repositories/interfaces/outbox.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class OutboxService implements IOutboxService {
  constructor(
    private readonly _prisma: PrismaService,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  async fetchAndLockPendingEvents(limit = 20): Promise<OutboxEventRecord[]> {
    return this._prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<OutboxEventRecord[]>`
        SELECT id, "eventType", "aggregateType", "aggregateId", payload, status, "retryCount", "errorMessage", "createdAt", "processedAt"
        FROM outbox_events
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      `;
      return rows;
    });
  }

  async markAsProcessed(eventId: string): Promise<void> {
    await this._prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }

  async markAsFailed(eventId: string, errorMessage: string): Promise<void> {
    await this._prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: 'FAILED',
        errorMessage: errorMessage.substring(0, 1000),
        retryCount: { increment: 1 },
      },
    });
  }
}
