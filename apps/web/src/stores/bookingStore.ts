import { create } from 'zustand'
import type { Booking, Review } from '../types'
import { mockBookings } from '../lib/mock'

interface BookingState {
  bookings: Booking[]
  selectedBooking: Booking | null
  setBookings: (bookings: Booking[]) => void
  selectBooking: (booking: Booking | null) => void
  cancelBooking: (id: string) => void
  addBooking: (booking: Booking) => void
  setBookingReview: (bookingId: string, review: Review) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: mockBookings,
  selectedBooking: null,
  setBookings: (bookings) => set({ bookings }),
  selectBooking: (booking) => set({ selectedBooking: booking }),
  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'CANCELLED' as const } : b
      ),
    })),
  addBooking: (booking) =>
    set((state) => ({ bookings: [booking, ...state.bookings] })),
  setBookingReview: (bookingId, review) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, review, status: 'COMPLETED' as const } : b
      ),
    })),
}))
