import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CreditCard, Video, MessageSquare } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ReviewCard } from '../../components/shared/ReviewCard'
import { cn, formatDateTime, formatPrice, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'

export function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookings, cancelBooking } = useBookingStore()

  const booking = bookings.find((b) => b.id === id)

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Booking not found.</p>
        <Link to="/dashboard/bookings"><Button variant="outline">Back to Bookings</Button></Link>
      </div>
    )
  }

  const messageCount = booking.messages.length

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/dashboard/bookings" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft size={14} /> Back to Bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-kala-brown">Booking Details</h1>
        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getBookingStatusColor(booking.status))}>
          {getBookingStatusLabel(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Instructor info */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Instructor</h3>
          <div className="flex items-center gap-3">
            <Avatar name={booking.instructor.user.name} src={booking.instructor.user.avatarUrl} size="lg" />
            <div>
              <p className="font-semibold text-stone-800">{booking.instructor.user.name}</p>
              <p className="text-sm text-stone-500">{booking.instructor.skills[0]?.name}</p>
              <p className="text-sm text-kala-terracotta font-medium">{formatPrice(booking.instructor.pricing)}/session</p>
            </div>
          </div>
        </Card>

        {/* Session info */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Session</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar size={15} className="text-stone-400" />
              {formatDateTime(booking.slot.startTime)}
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Clock size={15} className="text-stone-400" />
              {booking.slot.title || 'Creative Session'}
            </div>
            {booking.payment && (
              <div className="flex items-center gap-2 text-stone-600">
                <CreditCard size={15} className="text-stone-400" />
                {formatPrice(booking.payment.amount)} — <Badge variant={booking.payment.status === 'SUCCESS' ? 'success' : 'warning'}>{booking.payment.status}</Badge>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {booking.status === 'CONFIRMED' && (
          <Button className="gap-2" onClick={() => navigate(`/session/${booking.id}`)}>
            <Video size={16} /> Join Session
          </Button>
        )}
        <Link to={`/dashboard/bookings/${booking.id}/chat`}>
          <Button variant="outline" className="gap-2">
            <MessageSquare size={16} />
            Chat with Instructor
            {messageCount > 0 && (
              <span className="ml-1 text-xs bg-kala-amber/15 text-kala-terracotta px-1.5 py-0.5 rounded-full font-medium">
                {messageCount}
              </span>
            )}
          </Button>
        </Link>
        {(booking.status === 'INITIATED' || booking.status === 'CONFIRMED') && (
          <Button variant="destructive" onClick={() => cancelBooking(booking.id)} className="gap-2">
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Review */}
      {booking.review && (
        <div>
          <h2 className="text-lg font-semibold text-kala-brown mb-3">Your Review</h2>
          <ReviewCard review={booking.review} />
        </div>
      )}
    </div>
  )
}
