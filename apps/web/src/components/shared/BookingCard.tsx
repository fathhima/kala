import { Link } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import type { Booking } from '../../types'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { cn, formatDate, formatTime, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'

export function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Link to={`/dashboard/bookings/${booking.id}`}>
      <Card hover className="p-4">
        <div className="flex items-start gap-3">
          <Avatar name={booking.instructor.user.name} src={booking.instructor.user.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-stone-800 text-sm">{booking.instructor.user.name}</p>
                <p className="text-xs text-stone-400">{booking.instructor.skills[0]?.name}</p>
              </div>
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0', getBookingStatusColor(booking.status))}>
                {getBookingStatusLabel(booking.status)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
              <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(booking.slot.startTime)}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{formatTime(booking.slot.startTime)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
