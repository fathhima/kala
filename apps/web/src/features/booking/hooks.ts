import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBooking,
  completeBooking,
  getAdminBookings,
  getBookingById,
  getInstructorBookings,
  getStudentBookings,
  holdSlot,
  type AdminBookingListQuery,
  type BookingListQuery,
  type InstructorBookingListQuery,
} from './api'

// ─── Query Keys ─────────────────────────────────────────────────────────────

const bookingKeys = {
  all: ['bookings'] as const,
  student: ['bookings', 'student'] as const,
  instructor: ['bookings', 'instructor'] as const,
  admin: ['bookings', 'admin'] as const,
  detail: (bookingId: string) => ['bookings', 'detail', bookingId] as const,
}

// ─── Student ────────────────────────────────────────────────────────────────

export const useStudentBookingsQuery = (query: BookingListQuery) =>
  useQuery({
    queryKey: [...bookingKeys.student, query],
    queryFn: () => getStudentBookings(query),
    placeholderData: (previousData) => previousData,
  })

export const useBookingQuery = (bookingId: string) =>
  useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => getBookingById(bookingId),
    enabled: Boolean(bookingId),
  })

export const useHoldSlotMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: holdSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookingKeys.student,
      })
    },
  })
}

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: bookingKeys.detail(variables.bookingId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['payments'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['payments', 'by-booking', variables.bookingId],
        }),
      ])
    },
  })
}

// ─── Instructor ─────────────────────────────────────────────────────────────

export const useInstructorBookingsQuery = (query: InstructorBookingListQuery) =>
  useQuery({
    queryKey: [...bookingKeys.instructor, query],
    queryFn: () => getInstructorBookings(query),
    placeholderData: (previousData) => previousData,
  })

export const useCompleteBookingMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeBooking,
    onSuccess: async (_data, bookingId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: bookingKeys.instructor,
        }),
        queryClient.invalidateQueries({
          queryKey: bookingKeys.detail(bookingId),
        }),
      ])
    },
  })
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export const useAdminBookingsQuery = (query: AdminBookingListQuery) =>
  useQuery({
    queryKey: [...bookingKeys.admin, query],
    queryFn: () => getAdminBookings(query),
    placeholderData: (previousData) => previousData,
  })
