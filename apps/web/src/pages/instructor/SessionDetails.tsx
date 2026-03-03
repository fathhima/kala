import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, CreditCard, Video, MessageSquare, Palette, XCircle } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { cn, formatDateTime, formatDate, formatPrice, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'

export function InstructorSessionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookings, cancelBooking } = useBookingStore()
  const [confirmCancel, setConfirmCancel] = useState(false)

  const booking = bookings.find((b) => b.id === id)

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Session not found.</p>
        <Link to="/instructor/sessions">
          <Button variant="outline">Back to Sessions</Button>
        </Link>
      </div>
    )
  }

  const handleCancel = () => {
    cancelBooking(booking.id)
    setConfirmCancel(false)
    navigate('/instructor/sessions')
  }

  const messageCount = booking.messages.length
  const skill = booking.instructor.skills.find((s) => s.id === booking.slot.skillId) ?? booking.instructor.skills[0]

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to="/instructor/sessions"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Sessions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Session Details</h1>
          <p className="text-stone-500 text-sm mt-1">Booking #{booking.id}</p>
        </div>
        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium flex-shrink-0', getBookingStatusColor(booking.status))}>
          {getBookingStatusLabel(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Student info */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Student</h3>
          <div className="flex items-center gap-3">
            <Avatar name={booking.studentName} size="lg" />
            <div>
              <p className="font-semibold text-stone-800">{booking.studentName}</p>
              <p className="text-sm text-stone-400">Booked {formatDate(booking.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Session info */}
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Session</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-stone-600">
              <Calendar size={14} className="text-stone-400 flex-shrink-0" />
              {formatDateTime(booking.slot.startTime)}
            </div>
            {booking.slot.title && (
              <div className="flex items-center gap-2.5 text-stone-600">
                <Clock size={14} className="text-stone-400 flex-shrink-0" />
                {booking.slot.title}
              </div>
            )}
            {skill && (
              <div className="flex items-center gap-2.5 text-stone-600">
                <Palette size={14} className="text-stone-400 flex-shrink-0" />
                {skill.name}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Payment details */}
      {booking.payment && (
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            <span className="inline-flex items-center gap-2">
              <CreditCard size={13} /> Payment
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div>
              <p className="text-xs text-stone-400 mb-1">Amount</p>
              <p className="text-lg font-bold text-kala-terracotta">{formatPrice(booking.payment.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Status</p>
              <Badge
                variant={
                  booking.payment.status === 'SUCCESS'
                    ? 'success'
                    : booking.payment.status === 'REFUNDED'
                    ? 'warning'
                    : 'error'
                }
              >
                {booking.payment.status}
              </Badge>
            </div>
            {booking.payment.provider && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Provider</p>
                <p className="text-sm font-semibold text-stone-700">{booking.payment.provider}</p>
              </div>
            )}
            {booking.payment.transactionId && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Transaction ID</p>
                <p className="text-xs font-mono text-stone-500 truncate">{booking.payment.transactionId}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Cancelled banner */}
      {booking.status === 'CANCELLED' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <XCircle size={18} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">This session was cancelled</p>
            <p className="text-xs text-red-400 mt-0.5">Originally booked on {formatDate(booking.createdAt)}</p>
          </div>
        </div>
      )}

      {/* Actions: CONFIRMED or INITIATED */}
      {(booking.status === 'CONFIRMED' || booking.status === 'INITIATED') && (
        <div className="flex flex-wrap items-center gap-3">
          {booking.status === 'CONFIRMED' && (
            <Button className="gap-2" onClick={() => navigate(`/session/${booking.id}`)}>
              <Video size={16} /> Join Session
            </Button>
          )}

          <Link to={`/instructor/sessions/${booking.id}/chat`}>
            <Button variant="outline" className="gap-2">
              <MessageSquare size={16} />
              Chat with Student
              {messageCount > 0 && (
                <span className="ml-1 text-xs bg-kala-amber/15 text-kala-terracotta px-1.5 py-0.5 rounded-full font-medium">
                  {messageCount}
                </span>
              )}
            </Button>
          </Link>

          {!confirmCancel ? (
            <Button variant="destructive" onClick={() => setConfirmCancel(true)}>
              Cancel Session
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <p className="text-sm text-red-700 font-medium">Cancel this session?</p>
              <Button size="sm" variant="destructive" onClick={handleCancel}>
                Yes, Cancel
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmCancel(false)}>
                No
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Completed — show student review if present */}
      {booking.status === 'COMPLETED' && booking.review && (
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Student Review</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={cn('text-lg', i < booking.review!.rating ? 'text-kala-amber' : 'text-stone-200')}>
                  ★
                </span>
              ))}
              <span className="text-sm text-stone-500 ml-2">{booking.review.rating} / 5</span>
            </div>
            {booking.review.comment && (
              <p className="text-sm text-stone-600 leading-relaxed">{booking.review.comment}</p>
            )}
            <p className="text-xs text-stone-400">{formatDate(booking.review.createdAt)}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
