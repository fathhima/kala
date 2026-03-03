import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mockBookings } from '../../lib/mock'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime, formatPrice, getBookingStatusLabel } from '../../lib/utils'

export function AdminBookingDetails() {
  const { id } = useParams<{ id: string }>()
  const booking = mockBookings.find((item) => item.id === id)

  if (!booking) {
    return <Navigate to="/admin/bookings" replace />
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft size={15} /> Back to bookings
      </Link>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-kala-brown">Booking Details</h1>
            <p className="text-xs text-stone-400 font-mono mt-1">{booking.id}</p>
          </div>
          <Badge variant={booking.status === 'CONFIRMED' || booking.status === 'COMPLETED' ? 'success' : booking.status === 'CANCELLED' ? 'error' : 'warning'}>
            {getBookingStatusLabel(booking.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Student</p>
            <p className="font-medium text-stone-700">{booking.studentName}</p>
          </div>
          <div>
            <p className="text-stone-400">Instructor</p>
            <p className="font-medium text-stone-700">{booking.instructor.user.name}</p>
          </div>
          <div>
            <p className="text-stone-400">Session Start</p>
            <p className="font-medium text-stone-700">{formatDateTime(booking.slot.startTime)}</p>
          </div>
          <div>
            <p className="text-stone-400">Session End</p>
            <p className="font-medium text-stone-700">{formatDateTime(booking.slot.endTime)}</p>
          </div>
          <div>
            <p className="text-stone-400">Timezone</p>
            <p className="font-medium text-stone-700">{booking.slot.timezone}</p>
          </div>
          <div>
            <p className="text-stone-400">Created</p>
            <p className="font-medium text-stone-700">{formatDateTime(booking.createdAt)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-semibold text-stone-800">Payment</h2>
        {booking.payment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-stone-400">Amount</p>
              <p className="font-semibold text-kala-terracotta">{formatPrice(booking.payment.amount)}</p>
            </div>
            <div>
              <p className="text-stone-400">Status</p>
              <p className="font-medium text-stone-700">{booking.payment.status}</p>
            </div>
            <div>
              <p className="text-stone-400">Provider</p>
              <p className="font-medium text-stone-700">{booking.payment.provider || '—'}</p>
            </div>
            <div>
              <p className="text-stone-400">Transaction ID</p>
              <p className="font-mono text-xs text-stone-600 break-all">{booking.payment.transactionId || '—'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500">No payment data available.</p>
        )}
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-semibold text-stone-800">Engagement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Messages</p>
            <p className="font-medium text-stone-700">{booking.messages.length}</p>
          </div>
          <div>
            <p className="text-stone-400">Review</p>
            <p className="font-medium text-stone-700">{booking.review ? `${booking.review.rating} / 5` : 'No review yet'}</p>
          </div>
          {booking.review?.comment && (
            <div className="sm:col-span-2">
              <p className="text-stone-400">Review Comment</p>
              <p className="text-stone-700 mt-1">{booking.review.comment}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
