import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Mail,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react'
import {
  useBookingQuery,
  useCompleteBookingMutation,
  useCancelBookingMutation,
} from '@/features/booking/hooks'
import { usePaymentByBookingQuery } from '@/features/payment/hooks'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'

export function InstructorSessionDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading, isError, refetch } = useBookingQuery(id ?? '')
  const { data: payment } = usePaymentByBookingQuery(id ?? '', Boolean(id && booking))

  const completeMutation = useCompleteBookingMutation()
  const cancelMutation = useCancelBookingMutation()

  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading session information...</p>
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-stone-800">Session not found</h2>
        <p className="text-stone-500 text-sm">
          The requested session could not be loaded or may not exist.
        </p>
        <Link to="/instructor/sessions">
          <Button variant="outline">Back to My Sessions</Button>
        </Link>
      </div>
    )
  }

  const handleCompleteSession = async () => {
    setCompleteError(null)
    try {
      await completeMutation.mutateAsync(booking.id)
      setCompleteModalOpen(false)
      await refetch()
    } catch (err: any) {
      setCompleteError(
        err?.response?.data?.message || 'Failed to mark session as completed.',
      )
    }
  }

  const handleCancelSession = async () => {
    setCancelError(null)
    try {
      await cancelMutation.mutateAsync({
        bookingId: booking.id,
        reason: cancelReason.trim() || undefined,
      })
      setCancelModalOpen(false)
      await refetch()
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || 'Failed to cancel session.')
    }
  }

  const subcategoryName = (booking.offering as any)?.subcategory?.name || ''
  const isConfirmed = booking.status === 'CONFIRMED'
  const isCompleted = booking.status === 'COMPLETED'
  const isCancelled = booking.status === 'CANCELLED'
  const isPending = booking.status === 'PAYMENT_PENDING'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Top Bar ── */}
      <Link
        to="/instructor/sessions"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Sessions
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-kala-brown">Session Details</h1>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                getBookingStatusColor(booking.status),
              )}
            >
              {getBookingStatusLabel(booking.status)}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1 font-mono">
            Booking ID: {booking.id}
          </p>
        </div>

        <div className="text-xs text-stone-500">
          Booked on {formatDate(booking.createdAt)}
        </div>
      </div>

      {/* ── Status Banners ── */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Payment Pending</p>
            <p className="text-amber-700 mt-0.5 text-xs">
              The student has reserved this slot. Payment is pending confirmation.
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-emerald-900">Session Completed</p>
            <p className="text-emerald-700 mt-0.5 text-xs">
              This session was completed successfully
              {booking.updatedAt ? ` on ${formatDate(String(booking.updatedAt))}` : ''}.
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <XCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-red-900">Session Cancelled</p>
            <p className="text-red-700 text-xs">
              This session was cancelled
              {booking.cancelledAt ? ` on ${formatDate(String(booking.cancelledAt))}` : ''} by{' '}
              <strong className="text-red-900">
                {String(booking.cancelledBy) === booking.instructor?.userId
                  ? 'You (Instructor)'
                  : String(booking.cancelledBy) === booking.studentId
                  ? `Student (${booking.student?.name || 'Student'})`
                  : booking.cancelledBy
                  ? 'Platform Administration'
                  : 'System'}
              </strong>.
              {(booking.cancelReason || (booking as any).cancellationReason) && (
                <span className="block mt-1 italic text-stone-600">
                  Reason: &ldquo;{String(booking.cancelReason || (booking as any).cancellationReason)}&rdquo;
                </span>
              )}
            </p>
            <p className="text-[11px] text-red-800 pt-0.5">
              {String(booking.cancelledBy) === booking.instructor?.userId
                ? 'ℹ️ Instructor cancellation policy applied: A 100% full refund was automatically issued to the student.'
                : 'ℹ️ Student cancellation policy applied: Eligible refund was computed and processed automatically.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student & Session Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Student Profile Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Student Information
            </h2>

            <div className="flex items-center gap-4">
              <Avatar
                name={booking.student?.name || 'Student'}
                src={
                  typeof booking.student?.imageUrl === 'string'
                    ? booking.student.imageUrl
                    : undefined
                }
                size="lg"
                className="ring-2 ring-stone-100"
              />
              <div className="min-w-0">
                <p className="text-lg font-bold text-stone-900">
                  {booking.student?.name || 'Student'}
                </p>
                <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-stone-400" />
                  <a
                    href={`mailto:${booking.student?.email}`}
                    className="hover:text-kala-terracotta hover:underline"
                  >
                    {booking.student?.email}
                  </a>
                </p>
              </div>
            </div>
          </Card>

          {/* Session Details Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Session & Schedule Details
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-stone-800 text-base">
                    {booking.offering.title || subcategoryName || 'One-on-One Session'}
                  </h3>
                  {subcategoryName && (
                    <Badge variant="default" className="text-xs">
                      {subcategoryName}
                    </Badge>
                  )}
                </div>
              </div>

              <hr className="border-stone-100" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2.5">
                  <Calendar size={16} className="text-kala-amber shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-400 block font-medium">Date</span>
                    <span className="font-semibold text-stone-800">
                      {formatDate(booking.slot.startTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-kala-amber shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-stone-400 block font-medium">Time Window</span>
                    <span className="font-semibold text-stone-800">
                      {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                    </span>
                    <span className="text-xs text-stone-400 block">
                      {booking.slot.timezone || 'Asia/Kolkata'} ({booking.durationMinutes || 60} mins)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Payment & Actions */}
        <div className="space-y-6">
          {/* Payment & Earnings Summary */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Payment & Earnings
            </h2>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-stone-600">
                <span>Hourly Rate</span>
                <span>{formatPrice(booking.hourlyRate)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>Duration</span>
                <span>{booking.durationMinutes || 60} mins</span>
              </div>

              <div className="border-t border-stone-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-stone-800">Session Fee</span>
                <span className={cn(
                  'text-xl font-extrabold',
                  isCancelled ? 'line-through text-stone-400 text-base' : 'text-kala-terracotta',
                )}>
                  {formatPrice(booking.amount)}
                </span>
              </div>

              {isCancelled && (
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-stone-700 text-sm">Instructor Earnings</span>
                  <span className="text-base font-extrabold text-stone-500">
                    ₹0.00
                  </span>
                </div>
              )}
            </div>

            {payment && (
              <div className="border-t border-stone-100 pt-3 text-xs space-y-1.5 text-stone-500">
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={cn(
                    'font-semibold',
                    payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED'
                      ? 'text-amber-700'
                      : payment.status === 'SUCCEEDED'
                      ? 'text-emerald-700'
                      : 'text-stone-700',
                  )}>
                    {payment.status}
                  </span>
                </div>

                {payment.refundAmount ? (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Student Refund:</span>
                    <span className="font-bold">{formatPrice(Number(payment.refundAmount))}</span>
                  </div>
                ) : null}

                {payment.refundId && (
                  <div className="flex justify-between">
                    <span>Refund ID:</span>
                    <span className="font-mono text-[11px] truncate max-w-[140px] text-stone-600">
                      {String(payment.refundId)}
                    </span>
                  </div>
                )}

                {(payment as any).gatewaySessionId && (
                  <div className="flex justify-between">
                    <span>Order Ref:</span>
                    <span className="font-mono text-[11px] truncate max-w-[140px]">
                      {String((payment as any).gatewaySessionId)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Session Action Controls */}
          {isConfirmed && (
            <Card className="p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Instructor Actions
              </h2>

              <Button
                className="w-full gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setCompleteModalOpen(true)}
              >
                <CheckCircle2 size={16} /> Mark as Completed
              </Button>

              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Session
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* ── Complete Session Modal ── */}
      <Modal
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Session"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Has this session with <strong className="text-stone-900">{booking.student?.name}</strong> concluded?
            Marking this session as completed will update its status in both student and instructor dashboards.
          </p>

          {completeError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
              {completeError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
              disabled={completeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={completeMutation.isPending}
              onClick={handleCompleteSession}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Complete
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Cancel Session Modal ── */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Session"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to cancel this session? The slot will be released and the learner will be notified.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason for cancellation (optional):
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict or emergency"
              className="w-full text-sm border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-kala-amber/30 min-h-[80px]"
            />
          </div>

          {cancelError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
              {cancelError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Session
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={handleCancelSession}
            >
              Cancel Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
