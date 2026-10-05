import {
  PaymentsApi,
  Configuration,
  type PaymentControllerListStudentPaymentsStatusEnum,
  type PaymentControllerListAdminPaymentsStatusEnum,
  type PaginatedPaymentsDataDto,
  type PaymentDto,
} from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
})

const paymentsApi = new PaymentsApi(configuration, undefined, apiClient)

// ─── Types ──────────────────────────────────────────────────────────────────

export type CheckoutData = {
  paymentId: string
  checkoutUrl: string
  sessionId: string
  gatewayKeyId: string
}

export type PaymentListQuery = {
  page: number
  limit: number
  status?: PaymentControllerListStudentPaymentsStatusEnum
  from?: string
  to?: string
}

export type AdminPaymentListQuery = {
  page: number
  limit: number
  status?: PaymentControllerListAdminPaymentsStatusEnum
  from?: string
  to?: string
}

// ─── Student ────────────────────────────────────────────────────────────────

export const createCheckout = async (
  bookingId: string,
): Promise<CheckoutData> => {
  const response = await paymentsApi.paymentControllerCreateCheckout({
    bookingId,
  })

  // The generated type has `data: object` so we cast to the known shape
  return response.data.data as CheckoutData
}

export const confirmDevPayment = async (
  bookingId: string,
): Promise<PaymentDto> => {
  const response = await apiClient.post<{ success: boolean; data: PaymentDto }>(
    '/api/payments/dev-confirm',
    { bookingId },
  )
  return response.data.data
}

export const recordPaymentFailure = async (params: {
  bookingId: string
  reason?: string
}): Promise<PaymentDto> => {
  const response = await apiClient.post<{ success: boolean; data: PaymentDto }>(
    '/api/payments/fail',
    params,
  )
  return response.data.data
}

export const getPayment = async (
  paymentId: string,
): Promise<PaymentDto> => {
  const response = await paymentsApi.paymentControllerGetPayment(paymentId)

  return response.data.data
}

export const getPaymentByBooking = async (
  bookingId: string,
): Promise<PaymentDto> => {
  const response = await paymentsApi.paymentControllerGetPaymentByBooking(
    bookingId,
  )

  return response.data.data
}

export const getStudentPayments = async (
  query: PaymentListQuery,
): Promise<PaginatedPaymentsDataDto> => {
  const response = await paymentsApi.paymentControllerListStudentPayments(
    query.status,
    query.from,
    query.to,
    query.page,
    query.limit,
  )

  return response.data.data
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export const getAdminPayments = async (
  query: AdminPaymentListQuery,
): Promise<PaginatedPaymentsDataDto> => {
  const response = await paymentsApi.paymentControllerListAdminPayments(
    query.status,
    query.from,
    query.to,
    query.page,
    query.limit,
  )

  return response.data.data
}

export const refundPayment = async (params: {
  bookingId: string
  reason?: string
}): Promise<PaymentDto> => {
  const response = await paymentsApi.paymentControllerRefundPayment(
    params.bookingId,
    { reason: params.reason },
  )

  return response.data.data
}

export const getAdminPaymentById = async (
  paymentId: string,
): Promise<PaymentDto> => {
  const response = await apiClient.get<{ success: boolean; data: PaymentDto }>(
    `/api/admin/payments/${paymentId}`,
  )
  return response.data.data
}
