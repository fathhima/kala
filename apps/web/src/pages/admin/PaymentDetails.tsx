import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mockBookings } from '../../lib/mock'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatDateTime, formatPrice, getBookingStatusLabel } from '../../lib/utils'

const paymentRows = mockBookings
  .filter((booking) => booking.payment)
  .map((booking) => ({
    booking,
    payment: booking.payment!,
    student: booking.studentName,
    instructor: booking.instructor.user.name,
    date: booking.slot.startTime,
  }))

export function AdminPaymentDetails() {
  const { id } = useParams<{ id: string }>()
  const row = paymentRows.find((item) => item.payment.id === id)

  if (!row) {
    return <Navigate to="/admin/payments" replace />
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/payments" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft size={15} /> Back to payments
      </Link>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-kala-brown">Payment Details</h1>
            <p className="text-xs text-stone-400 font-mono mt-1">{row.payment.id}</p>
          </div>
          <Badge variant={row.payment.status === 'SUCCESS' ? 'success' : row.payment.status === 'PENDING' ? 'warning' : 'error'}>
            {row.payment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Amount</p>
            <p className="font-semibold text-kala-terracotta">{formatPrice(row.payment.amount)}</p>
          </div>
          <div>
            <p className="text-stone-400">Provider</p>
            <p className="font-medium text-stone-700">{row.payment.provider || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400">Transaction ID</p>
            <p className="font-mono text-xs text-stone-600 break-all">{row.payment.transactionId || '—'}</p>
          </div>
          <div>
            <p className="text-stone-400">Session Date</p>
            <p className="font-medium text-stone-700">{formatDateTime(row.date)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">Related Booking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">Booking ID</p>
            <Link to={`/admin/bookings/${row.booking.id}`} className="font-mono text-xs text-kala-terracotta hover:underline">
              {row.booking.id}
            </Link>
          </div>
          <div>
            <p className="text-stone-400">Booking Status</p>
            <p className="font-medium text-stone-700">{getBookingStatusLabel(row.booking.status)}</p>
          </div>
          <div>
            <p className="text-stone-400">Student</p>
            <p className="font-medium text-stone-700">{row.student}</p>
          </div>
          <div>
            <p className="text-stone-400">Instructor</p>
            <p className="font-medium text-stone-700">{row.instructor}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
