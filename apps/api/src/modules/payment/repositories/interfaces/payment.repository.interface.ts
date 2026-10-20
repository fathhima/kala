import {
  PaymentEntity,
  PaginatedPaymentEntity,
} from '../../entities/payment.entity';
import {
  CreatePaymentInput,
  ConfirmPaymentInput,
  PaymentListQuery,
} from '../../types/payment.type';
import { IBaseRepository, TransactionClient } from '@/shared/prisma/base';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface IPaymentRepository extends IBaseRepository<PaymentEntity> {
  create(
    input: CreatePaymentInput,
    gatewaySessionId: string,
    tx?: TransactionClient,
  ): Promise<PaymentEntity>;

  findById(id: string, tx?: TransactionClient): Promise<PaymentEntity | null>;

  exists(id: string, tx?: TransactionClient): Promise<boolean>;

  findByBookingId(
    bookingId: string,
    tx?: TransactionClient,
  ): Promise<PaymentEntity | null>;

  findByGatewaySessionId(
    sessionId: string,
    tx?: TransactionClient,
  ): Promise<PaymentEntity | null>;

  /**
   * Atomically confirms a payment + booking in a single transaction.
   * Uses gatewayId unique constraint for idempotency.
   */
  confirmPayment(
    input: ConfirmPaymentInput,
    tx?: TransactionClient,
  ): Promise<PaymentEntity>;

  /**
   * Marks a payment as refunded and cancels the booking.
   */
  refundPayment(
    paymentId: string,
    refundId: string,
    refundAmount: number,
    tx?: TransactionClient,
  ): Promise<PaymentEntity>;

  /**
   * Updates only the payment record with refund info.
   * Used by auto-refund flow where booking/slot are already
   * handled by the cancellation transaction.
   */
  markRefunded(
    paymentId: string,
    refundId: string,
    refundAmount: number,
    isPartial: boolean,
    tx?: TransactionClient,
  ): Promise<PaymentEntity>;

  /**
   * Flags a payment as REFUND_PENDING for admin follow-up
   * (used when auto-refund gateway call fails).
   */
  markRefundPending(paymentId: string, tx?: TransactionClient): Promise<void>;

  findStudentPayments(
    studentId: string,
    query: PaymentListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedPaymentEntity>;

  findAdminPayments(
    query: PaymentListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedPaymentEntity>;

  findManyForAdmin(
    query: PaymentListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedPaymentEntity>;

  /**
   * Marks a payment as FAILED. Does not cancel the slot hold,
   * so student can still retry payment if hold is active.
   */
  failPayment(
    gatewaySessionId: string,
    gatewayPaymentIntentId?: string,
    failureReason?: string,
    tx?: TransactionClient,
  ): Promise<PaymentEntity | null>;

  /**
   * Confirms that a refund has settled via refund.processed webhook.
   */
  confirmRefundWebhook(
    gatewayPaymentIntentId: string,
    gatewayRefundId?: string,
    refundAmount?: number,
    tx?: TransactionClient,
  ): Promise<PaymentEntity | null>;

  /**
   * Handles refund.failed webhook. Reverts payment back to SUCCEEDED
   * and logs the failure reason.
   */
  failRefundWebhook(
    gatewayPaymentIntentId: string,
    gatewayRefundId?: string,
    failureReason?: string,
    tx?: TransactionClient,
  ): Promise<PaymentEntity | null>;
}
