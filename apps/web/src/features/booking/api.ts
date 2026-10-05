import {
  BookingsApi,
  Configuration,
  type BookingControllerListStudentStatusEnum,
  type BookingControllerListInstructorStatusEnum,
  type BookingControllerListAdminStatusEnum,
  type PaginatedBookingsDataDto,
  type BookingDto,
} from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
})

const bookingsApi = new BookingsApi(configuration, undefined, apiClient)

// ─── Types ──────────────────────────────────────────────────────────────────

export type BookingListQuery = {
  page: number
  limit: number
  status?: BookingControllerListStudentStatusEnum
  from?: string
  to?: string
}

export type InstructorBookingListQuery = {
  page: number
  limit: number
  status?: BookingControllerListInstructorStatusEnum
  from?: string
  to?: string
}

export type AdminBookingListQuery = {
  page: number
  limit: number
  status?: BookingControllerListAdminStatusEnum
  from?: string
  to?: string
}

// ─── Student ────────────────────────────────────────────────────────────────

export const holdSlot = async (params: {
  slotId: string
  idempotencyKey: string
}): Promise<BookingDto> => {
  const response = await bookingsApi.bookingControllerHold(
    params.idempotencyKey,
    { slotId: params.slotId },
  )

  return response.data.data
}

export const getStudentBookings = async (
  query: BookingListQuery,
): Promise<PaginatedBookingsDataDto> => {
  const response = await bookingsApi.bookingControllerListStudent(
    query.status,
    query.from,
    query.to,
    query.page,
    query.limit,
  )

  return response.data.data
}

export const getBookingById = async (
  bookingId: string,
): Promise<BookingDto> => {
  const response = await bookingsApi.bookingControllerGetById(bookingId)

  return response.data.data
}

export const cancelBooking = async (params: {
  bookingId: string
  reason?: string
}): Promise<BookingDto> => {
  const response = await bookingsApi.bookingControllerCancel(
    params.bookingId,
    { reason: params.reason },
  )

  return response.data.data
}

// ─── Instructor ─────────────────────────────────────────────────────────────

export const getInstructorBookings = async (
  query: InstructorBookingListQuery,
): Promise<PaginatedBookingsDataDto> => {
  const response = await bookingsApi.bookingControllerListInstructor(
    query.status,
    query.from,
    query.to,
    query.page,
    query.limit,
  )

  return response.data.data
}

export const completeBooking = async (
  bookingId: string,
): Promise<BookingDto> => {
  const response = await bookingsApi.bookingControllerComplete(bookingId)

  return response.data.data
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export const getAdminBookings = async (
  query: AdminBookingListQuery,
): Promise<PaginatedBookingsDataDto> => {
  const response = await bookingsApi.bookingControllerListAdmin(
    query.status,
    query.from,
    query.to,
    query.page,
    query.limit,
  )

  return response.data.data
}
