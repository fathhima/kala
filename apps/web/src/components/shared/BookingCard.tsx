import { Link } from 'react-router-dom'
import { Calendar, Clock, CreditCard, ArrowRight } from 'lucide-react'
import type { BookingDto } from '@/api'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'

export function BookingCard({ booking }: { booking: BookingDto }) {
  const isPendingPayment = booking.status === 'PAYMENT_PENDING'
  const targetLink = isPendingPayment
    ? `/checkout/${booking.id}`
    : `/dashboard/bookings/${booking.id}`

  const subcategoryName = (booking.offering as any)?.subcategory?.name || ''
  const offeringTitle = booking.offering.title || subcategoryName || 'Creative Session'

  return (
    <Card hover className="p-5 transition-all border-stone-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Instructor avatar & session info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <Avatar
            name={booking.instructor.name}
            src={typeof booking.instructor.imageUrl === 'string' ? booking.instructor.imageUrl : undefined}
            size="md"
            className="ring-1 ring-stone-200 shrink-0"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-stone-900 text-sm truncate">
                {booking.instructor.name}
              </p>
              {subcategoryName && (
                <Badge variant="default" className="text-[10px] py-0 px-2">
                  {subcategoryName}
                </Badge>
              )}
            </div>

            <p className="text-xs text-stone-600 font-medium truncate">
              {offeringTitle}
            </p>

            <div className="flex items-center gap-4 text-xs text-stone-500 pt-0.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-kala-amber" />
                {formatDate(booking.slot.startTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-kala-amber" />
                {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status, Price, and Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                getBookingStatusColor(booking.status),
              )}
            >
              {getBookingStatusLabel(booking.status)}
            </span>
          </div>

          <p className="text-sm font-bold text-stone-800">
            {formatPrice(booking.amount)}
          </p>

          <div className="flex items-center gap-2 mt-1">
            {isPendingPayment ? (
              <Link
                to={`/checkout/${booking.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-kala-amber hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <CreditCard size={13} /> Complete Payment
              </Link>
            ) : (
              <Link
                to={targetLink}
                className="inline-flex items-center gap-1 text-xs font-medium text-kala-terracotta hover:underline"
              >
                View Details <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
