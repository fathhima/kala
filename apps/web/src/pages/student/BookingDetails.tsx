import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Video,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react'
import { useBookingQuery, useCancelBookingMutation } from '@/features/booking/hooks'
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

export function BookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading, isError, refetch } = useBookingQuery(id ?? '')
  const { data: payment, refetch: refetchPayment } = usePaymentByBookingQuery(id ?? '', Boolean(id && booking))

  const cancelMutation = useCancelBookingMutation()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading booking information...</p>
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-stone-800">Booking not found</h2>
        <p className="text-stone-500 text-sm">
          The booking could not be loaded or may not exist.
        </p>
        <Link to="/dashboard/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  const handleCancelBooking = async () => {
    setCancelError(null)
    try {
      await cancelMutation.mutateAsync({
        bookingId: booking.id,
        reason: cancelReason.trim() || undefined,
      })
      setCancelModalOpen(false)
      await Promise.all([refetch(), refetchPayment()])
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || 'Failed to cancel booking.')
    }
  }

  const subcategoryName = (booking.offering as any)?.subcategory?.name || ''
  const isPending = booking.status === 'PAYMENT_PENDING'
  const isConfirmed = booking.status === 'CONFIRMED'
  const isCancelled = booking.status === 'CANCELLED'
  const isCompleted = booking.status === 'COMPLETED'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Top Bar ── */}
      <Link
        to="/dashboard/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Bookings
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-kala-brown">Booking Details</h1>
          <p className="text-xs text-stone-400 font-mono mt-0.5">ID: {booking.id}</p>
        </div>

        <span
          className={cn(
            'inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border w-fit',
            getBookingStatusColor(booking.status),
          )}
        >
          {getBookingStatusLabel(booking.status)}
        </span>
      </div>

      {/* ── Action Notice for Payment Failed or Pending ── */}
      {isPending && payment?.status === 'FAILED' ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 text-sm">Payment Attempt Failed</p>
              <p className="text-xs text-red-700 mt-0.5">
                {payment.failureReason ? String(payment.failureReason) : 'Your previous payment attempt was declined. You can retry paying to secure this slot.'}
              </p>
            </div>
          </div>

          <Link to={`/checkout/${booking.id}`}>
            <Button size="sm" className="whitespace-nowrap gap-1.5 shadow-xs bg-red-600 hover:bg-red-700 text-white">
              <RotateCcw size={14} /> Retry Payment
            </Button>
          </Link>
        </div>
      ) : isPending ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-kala-amber shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-kala-brown text-sm">Payment Pending</p>
              <p className="text-xs text-stone-600 mt-0.5">
                Complete payment to confirm and secure this slot with your instructor.
              </p>
            </div>
          </div>

          <Link to={`/checkout/${booking.id}`}>
            <Button size="sm" className="whitespace-nowrap gap-1.5 shadow-xs">
              <CreditCard size={14} /> Complete Payment
            </Button>
          </Link>
        </div>
      ) : null}

      {/* ── Cancellation & Refund Status Card ── */}
      {isCancelled && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-stone-900 text-base">Booking Cancelled</p>
                {booking.cancelledAt && (
                  <span className="text-xs text-stone-400">
                    Cancelled on {formatDate(String(booking.cancelledAt))}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600">
                Cancelled by <span className="font-semibold text-stone-800">
                  {String(booking.cancelledBy) === booking.studentId
                    ? 'You (Student)'
                    : String(booking.cancelledBy) === booking.instructor?.userId
                    ? `Instructor (${booking.instructor.name})`
                    : booking.cancelledBy
                    ? 'Platform Administration'
                    : 'System'}
                </span>
                {(booking.cancelReason || (booking as any).cancellationReason) && (
                  <>: &ldquo;<span className="italic">{String(booking.cancelReason || (booking as any).cancellationReason)}</span>&rdquo;</>
                )}
              </p>
            </div>
          </div>

          {/* Refund Details Breakdown */}
          {payment?.status === 'REFUNDED' || payment?.status === 'PARTIALLY_REFUNDED' || payment?.status === 'REFUND_PENDING' ? (
            <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span className="font-bold text-sm text-stone-800">
                    {payment.status === 'REFUNDED'
                      ? 'Full Refund Processed'
                      : payment.status === 'PARTIALLY_REFUNDED'
                      ? 'Partial Refund Processed'
                      : 'Refund Queued & Under Review'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {payment.status === 'REFUNDED'
                    ? '100% Refund'
                    : payment.status === 'PARTIALLY_REFUNDED'
                    ? (payment.refundAmount && payment.amount
                        ? `${Math.round((Number(payment.refundAmount) / Number(payment.amount)) * 100)}% Refund`
                        : 'Partial Refund')
                    : 'Pending Settlement'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block font-medium">Refund Amount</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    {formatPrice(Number(payment.refundAmount ?? booking.amount))}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Refund Reference ID</span>
                  <span className="font-mono text-stone-700 select-all">
                    {payment.refundId ? String(payment.refundId) : 'Processing...'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block font-medium">Refund Destination</span>
                  <span className="text-stone-700 font-medium">
                    Original Payment Method
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                <strong>Settlement Timeline:</strong> The refund has been submitted via Razorpay directly back to your source payment method (Bank account, UPI, or Credit/Debit Card). Depending on your bank, it typically reflects within 5–7 business days.
              </p>
            </div>
          ) : payment?.status === 'SUCCEEDED' ? (() => {
            const slotStartTime = booking.slot?.startTime ? new Date(booking.slot.startTime).getTime() : 0
            const cancelledTime = booking.cancelledAt
              ? new Date(booking.cancelledAt).getTime()
              : (booking.updatedAt ? new Date(booking.updatedAt).getTime() : Date.now())
            const hoursUntilSession = (slotStartTime - cancelledTime) / (1000 * 60 * 60)

            if (hoursUntilSession >= 2) {
              const expectedPct = hoursUntilSession >= 24 ? '100%' : hoursUntilSession >= 12 ? '50%' : '25%'
              return (
                <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50/40 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600 animate-spin" />
                    <p className="font-bold text-blue-900">Refund Processing</p>
                  </div>
                  <p className="text-blue-800">
                    This session cancellation qualifies for an automated {expectedPct} refund under Kala policy. The refund is currently being processed by the payment gateway and will reflect shortly.
                  </p>
                </div>
              )
            }

            return (
              <div className="bg-white rounded-xl p-4 border border-amber-200 text-xs space-y-1.5">
                <p className="font-bold text-amber-900">Non-Refundable Cancellation</p>
                <p className="text-amber-800">
                  As per Kala refund policy, cancellations made within 2 hours of scheduled session start time are not eligible for automated refunds.
                </p>
              </div>
            )
          })() : (
            <div className="bg-white rounded-xl p-3.5 border border-stone-200 text-xs text-stone-500">
              This reservation was cancelled during the checkout hold window before payment was completed. No charge was deducted.
            </div>
          )}
        </div>
      )}

      {/* ── Grid: Instructor & Session Info ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Instructor info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Instructor
          </h2>
          <div className="flex items-center gap-3.5">
            <Avatar
              name={booking.instructor.name}
              src={typeof booking.instructor.imageUrl === 'string' ? booking.instructor.imageUrl : undefined}
              size="lg"
              className="ring-1 ring-stone-200"
            />
            <div className="min-w-0">
              <p className="font-bold text-stone-900 text-base">{booking.instructor.name}</p>
              <p className="text-xs text-stone-500">Verified Kala Instructor</p>
              <Link
                to={`/instructors/${booking.profileId}`}
                className="inline-block text-xs font-medium text-kala-terracotta hover:underline mt-1"
              >
                View Profile
              </Link>
            </div>
          </div>
        </Card>

        {/* Session info */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Session Details
          </h2>
          <div className="space-y-2.5 text-sm text-stone-700">
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-kala-amber shrink-0" />
              <span className="font-medium">{formatDate(booking.slot.startTime)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-kala-amber shrink-0" />
              <span>
                {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)} ({booking.slot.timezone || 'IST'})
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Badge variant="default" className="text-xs">
                {subcategoryName || 'Creative Learning'}
              </Badge>
              <span className="text-xs text-stone-400 font-medium">
                {booking.durationMinutes || 60} mins
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Payment Info Card ── */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Payment Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-xs text-stone-400 block font-medium">Session Fee</span>
            <span className="font-extrabold text-stone-800 text-base">
              {formatPrice(booking.amount)}
            </span>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col justify-between">
            <span className="text-xs text-stone-400 block font-medium">Payment Status</span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span
                className={cn(
                  'font-semibold text-sm capitalize',
                  payment?.status === 'FAILED'
                    ? 'text-red-600'
                    : payment?.status === 'SUCCEEDED'
                    ? 'text-green-600'
                    : payment?.status === 'REFUNDED'
                    ? 'text-emerald-700'
                    : payment?.status === 'PARTIALLY_REFUNDED'
                    ? 'text-amber-700'
                    : payment?.status === 'REFUND_PENDING'
                    ? 'text-amber-600'
                    : isCancelled
                    ? 'text-stone-400'
                    : 'text-stone-700',
                )}
              >
                {payment?.status
                  ? payment.status.toLowerCase().replace('_', ' ')
                  : isConfirmed
                  ? 'succeeded'
                  : isCancelled
                  ? 'cancelled'
                  : 'pending'}
              </span>
              {isPending && (
                <Link to={`/checkout/${booking.id}`}>
                  <Button size="sm" variant="outline" className="gap-1 text-xs py-1 h-7 text-kala-terracotta border-amber-200 hover:bg-amber-50">
                    <RotateCcw size={12} /> Retry
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-xs text-stone-400 block font-medium">
              {payment?.refundAmount ? 'Refund Processed' : 'Gateway'}
            </span>
            <span className="font-semibold text-stone-800 text-sm">
              {payment?.refundAmount ? (
                <span className="text-emerald-700 font-extrabold">{formatPrice(Number(payment.refundAmount))}</span>
              ) : (
                'Razorpay Secure'
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-400 pt-1">
          {payment?.gatewayId && (
            <span>Transaction ID: {String(payment.gatewayId)}</span>
          )}
          {payment?.refundId && (
            <span className="text-emerald-700 font-sans font-medium">
              Refund ID: <strong className="font-mono text-stone-700">{String(payment.refundId)}</strong>
            </span>
          )}
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {isConfirmed && (
          <Button
            size="lg"
            className="gap-2"
            onClick={() => alert('The video call room opens 5 minutes before scheduled session time.')}
          >
            <Video size={17} /> Join Video Session
          </Button>
        )}

        {isPending && (
          <Link to={`/checkout/${booking.id}`}>
            <Button size="lg" className="gap-2 shadow-xs">
              {payment?.status === 'FAILED' ? (
                <>
                  <RotateCcw size={17} /> Retry Payment
                </>
              ) : (
                <>
                  <CreditCard size={17} /> Proceed to Checkout
                </>
              )}
            </Button>
          </Link>
        )}

        {(isPending || isConfirmed) && (
          <Button
            variant="destructive"
            onClick={() => setCancelModalOpen(true)}
            disabled={cancelMutation.isPending}
          >
            Cancel Booking
          </Button>
        )}

        <Link to="/instructors">
          <Button variant="outline">Browse Other Instructors</Button>
        </Link>
      </div>

      {/* ── Cancellation Modal ── */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Booking"
      >
        <div className="space-y-4 pt-2">
          {cancelError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {cancelError}
            </div>
          )}

          <p className="text-sm text-stone-600">
            Are you sure you want to cancel this booking? If you paid for this session, a refund will be calculated and processed automatically according to our refund policy.
          </p>

          <div className="bg-stone-50 p-3.5 rounded-xl text-xs text-stone-500 space-y-1 border border-stone-200/70">
            <p className="font-bold text-stone-700">Refund Policy Reminder:</p>
            <p>• 100% refund: 24+ hours before start time</p>
            <p>• 50% refund: 12 to 24 hours before start time</p>
            <p>• 25% refund: 2 to 12 hours before start time</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Reason for cancellation (optional):
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, personal emergency..."
              className="w-full text-sm rounded-xl border border-stone-200 p-3 focus:outline-none focus:ring-2 focus:ring-kala-amber/40"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={handleCancelBooking}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
