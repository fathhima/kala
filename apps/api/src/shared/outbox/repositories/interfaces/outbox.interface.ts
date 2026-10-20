export const OUTBOX_SERVICE = Symbol('OUTBOX_SERVICE');

export interface OutboxEventRecord {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: any;
  status: string;
  retryCount: number;
  errorMessage: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export interface IOutboxService {
  fetchAndLockPendingEvents(limit?: number): Promise<OutboxEventRecord[]>;
  markAsProcessed(eventId: string): Promise<void>;
  markAsFailed(eventId: string, errorMessage: string): Promise<void>;
}
