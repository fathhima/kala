import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCheckout,
  confirmDevPayment,
  recordPaymentFailure,
  getAdminPayments,
  getAdminPaymentById,
  getPayment,
  getPaymentByBooking,
  getStudentPayments,
  refundPayment,
  type AdminPaymentListQuery,
  type PaymentListQuery,
} from './api'

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ['payments'] as const,
  student: ['payments', 'student'] as const,
  admin: ['payments', 'admin'] as const,
  detail: (paymentId: string) => ['payments', 'detail', paymentId] as const,
  byBooking: (bookingId: string) =>
    ['payments', 'by-booking', bookingId] as const,
}

// ─── Student ────────────────────────────────────────────────────────────────

export const useStudentPaymentsQuery = (query: PaymentListQuery) =>
  useQuery({
    queryKey: [...paymentKeys.student, query],
    queryFn: () => getStudentPayments(query),
    placeholderData: (previousData) => previousData,
  })

export const usePaymentQuery = (paymentId: string) =>
  useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => getPayment(paymentId),
    enabled: Boolean(paymentId),
  })

export const usePaymentByBookingQuery = (
  bookingId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: paymentKeys.byBooking(bookingId),
    queryFn: () => getPaymentByBooking(bookingId),
    enabled: Boolean(bookingId && enabled),
  })

export const useCreateCheckoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCheckout,
    onSuccess: async (_data, bookingId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.student,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byBooking(bookingId),
        }),
      ])
    },
  })
}

export const useConfirmDevPaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmDevPayment,
    onSuccess: async (_data, bookingId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['bookings'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['bookings', bookingId],
        }),
      ])
    },
  })
}

export const useRecordPaymentFailureMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recordPaymentFailure,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byBooking(variables.bookingId),
        }),
      ])
    },
  })
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export const useAdminPaymentsQuery = (query: AdminPaymentListQuery) =>
  useQuery({
    queryKey: [...paymentKeys.admin, query],
    queryFn: () => getAdminPayments(query),
    placeholderData: (previousData) => previousData,
  })

export const useRefundPaymentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: refundPayment,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: paymentKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: paymentKeys.byBooking(variables.bookingId),
        }),
        // Also invalidate bookings since refund changes booking status
        queryClient.invalidateQueries({
          queryKey: ['bookings'],
        }),
      ])
    },
  })
}

export const useAdminPaymentQuery = (paymentId: string) =>
  useQuery({
    queryKey: [...paymentKeys.admin, 'detail', paymentId],
    queryFn: () => getAdminPaymentById(paymentId),
    enabled: Boolean(paymentId),
  })

