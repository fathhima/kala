import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  FileText,
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

export function AdminBookingDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading, isError, refetch } = useBookingQuery(id ?? '')
  const { data: payment } = usePaymentByBookingQuery(id ?? '', Boolean(id && booking))

  const cancelMutation = useCancelBookingMutation()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading booking records...</p>
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
          No booking record found with the identifier provided.
        </p>
        <Link to="/admin/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  const handleAdminCancel = async () => {
    setCancelError(null)
    try {
      await cancelMutation.mutateAsync({
        bookingId: booking.id,
        reason: cancelReason.trim() || 'Cancelled by platform administrator',
      })
      setCancelModalOpen(false)
      await refetch()
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || 'Failed to cancel booking.')
    }
  }

  const subcategoryName = (booking.offering as any)?.subcategory?.name || ''
  const isPending = booking.status === 'PAYMENT_PENDING'
  const isConfirmed = booking.status === 'CONFIRMED'
  const isCompleted = booking.status === 'COMPLETED'
  const isCancelled = booking.status === 'CANCELLED'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Top Bar ── */}
      <Link
        to="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Booking Monitoring
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-kala-brown">Booking Record</h1>
            <span
              className={cn(
                'inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border',
                getBookingStatusColor(booking.status),
              )}
            >
              {getBookingStatusLabel(booking.status)}
            </span>
          </div>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Reference ID: {booking.id}
          </p>
        </div>

        <div className="text-xs text-stone-500 text-right">
          <p>Created: {formatDate(booking.createdAt)}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Last Updated: {formatDate(booking.updatedAt)}</p>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <XCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm space-y-1">
            <p className="font-semibold text-red-900">Booking Cancelled</p>
            <p className="text-red-700 text-xs">
              This reservation was cancelled
              {booking.cancelledAt ? ` on ${formatDate(booking.cancelledAt)}` : ''} by{' '}
              <strong className="text-red-900">
                {booking.cancelledBy === booking.studentId
                  ? 'Student'
                  : booking.cancelledBy === booking.instructor?.userId
                  ? 'Instructor'
                  : 'Platform Administrator'}
              </strong>.
              {(booking.cancelReason || (booking as any).cancellationReason) && (
                <span className="block mt-1 italic text-stone-600">
                  Reason: &ldquo;{booking.cancelReason || (booking as any).cancellationReason}&rdquo;
                </span>
              )}
            </p>
            {payment?.status === 'REFUNDED' || payment?.status === 'PARTIALLY_REFUNDED' ? (
              <p className="text-[11px] text-emerald-800 font-medium pt-1">
                ✓ Auto-Refund Processed: {formatPrice(payment.refundAmount ?? booking.amount)} credited via Razorpay REST API
                {payment.refundId ? ` (Refund ID: ${payment.refundId})` : ''}
              </p>
            ) : payment?.status === 'REFUND_PENDING' ? (
              <p className="text-[11px] text-amber-800 font-medium pt-1">
                ⚠️ Refund flagged as REFUND_PENDING for gateway review. Check Payment Management for details.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-emerald-900">Session Completed</p>
            <p className="text-emerald-700 mt-0.5 text-xs">
              The instructor has marked this session as successfully completed
              {booking.updatedAt ? ` on ${formatDate(String(booking.updatedAt))}` : ''}.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Details Grid (2x2) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Student Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Student / Learner
            </h2>
            <Link
              to={`/admin/users/${booking.studentId}`}
              className="text-xs text-kala-terracotta hover:underline font-medium inline-flex items-center gap-1"
            >
              View User <ExternalLink size={11} />
            </Link>
          </div>

          <div className="flex items-start gap-3.5">
            <Avatar
              name={booking.student?.name || 'Student'}
              src={typeof booking.student?.imageUrl === 'string' ? booking.student.imageUrl : undefined}
              size="lg"
              className="ring-1 ring-stone-200"
            />
            <div className="min-w-0 space-y-1">
              <p className="font-bold text-stone-900 text-base">{booking.student?.name || 'Student'}</p>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <Mail size={12} className="text-stone-400" /> {booking.student?.email}
              </p>
              <p className="text-[11px] font-mono text-stone-400">ID: {booking.studentId}</p>
            </div>
          </div>
        </Card>

        {/* 2. Instructor Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Instructor
            </h2>
            <Link
              to={`/instructors/${booking.profileId}`}
              target="_blank"
              className="text-xs text-kala-terracotta hover:underline font-medium inline-flex items-center gap-1"
            >
              Public Profile <ExternalLink size={11} />
            </Link>
          </div>

          <div className="flex items-start gap-3.5">
            <Avatar
              name={booking.instructor?.name || 'Instructor'}
              src={typeof booking.instructor?.imageUrl === 'string' ? booking.instructor.imageUrl : undefined}
              size="lg"
              className="ring-1 ring-stone-200"
            />
            <div className="min-w-0 space-y-1">
              <p className="font-bold text-stone-900 text-base">{booking.instructor?.name || 'Instructor'}</p>
              <p className="text-xs text-stone-500">Instructor Profile: {booking.profileId}</p>
              <p className="text-[11px] font-mono text-stone-400">User ID: {booking.instructor?.userId}</p>
            </div>
          </div>
        </Card>

        {/* 3. Session Details Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-3">
            Session & Schedule
          </h2>

          <div className="space-y-3">
            <div>
              <p className="font-bold text-stone-800 text-base">
                {booking.offering.title || subcategoryName || 'One-on-One Session'}
              </p>
              {subcategoryName && (
                <Badge variant="default" className="text-xs mt-1">
                  {subcategoryName}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pt-1">
              <div>
                <span className="text-xs text-stone-400 block font-medium">Date</span>
                <span className="font-semibold text-stone-700 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={13} className="text-kala-amber" />
                  {formatDate(booking.slot.startTime)}
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-400 block font-medium">Time Window</span>
                <span className="font-semibold text-stone-700 flex items-center gap-1.5 mt-0.5">
                  <Clock size={13} className="text-kala-amber" />
                  {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-400 block font-medium">Duration</span>
                <span className="font-medium text-stone-700">
                  {booking.durationMinutes || 60} minutes
                </span>
              </div>

              <div>
                <span className="text-xs text-stone-400 block font-medium">Timezone</span>
                <span className="font-mono text-xs text-stone-600">
                  {booking.slot.timezone || 'Asia/Kolkata'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Payment & Financial Summary Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Payment & Transaction
            </h2>
            {payment && (
              <Link
                to={`/admin/payments/${payment.id}`}
                className="text-xs text-kala-terracotta hover:underline font-medium inline-flex items-center gap-1"
              >
                Payment Details <ExternalLink size={11} />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-stone-500 text-sm">Session Total:</span>
              <span className="text-2xl font-extrabold text-kala-terracotta">
                {formatPrice(booking.amount)}
              </span>
            </div>

            <div className="text-xs space-y-2 pt-1 border-t border-stone-100">
              <div className="flex justify-between">
                <span className="text-stone-400">Payment Status:</span>
                <span className={cn(
                  'font-semibold',
                  payment?.status === 'REFUNDED' || payment?.status === 'PARTIALLY_REFUNDED'
                    ? 'text-amber-700'
                    : payment?.status === 'SUCCEEDED'
                    ? 'text-emerald-700'
                    : 'text-stone-800',
                )}>
                  {payment ? payment.status : booking.status === 'PAYMENT_PENDING' ? 'PENDING' : 'UNKNOWN'}
                </span>
              </div>

              {payment?.refundAmount ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Refunded:</span>
                  <span className="font-bold">{formatPrice(payment.refundAmount)}</span>
                </div>
              ) : null}

              {payment?.refundId && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Refund ID:</span>
                  <span className="font-mono text-[11px] text-stone-700 truncate max-w-[130px]">{payment.refundId}</span>
                </div>
              )}

              {payment?.gateway && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Gateway:</span>
                  <span className="font-medium text-stone-700">{payment.gateway}</span>
                </div>
              )}

              {payment?.gatewaySessionId && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Gateway Order ID:</span>
                  <span className="font-mono text-[11px] text-stone-600">{payment.gatewaySessionId}</span>
                </div>
              )}

              {payment?.gatewayId && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Transaction Ref:</span>
                  <span className="font-mono text-[11px] text-stone-600">{payment.gatewayId}</span>
                </div>
              )}

              {payment?.id && (
                <div className="pt-2 border-t border-stone-100">
                  <Link
                    to={`/admin/payments/${payment.id}`}
                    className="flex items-center justify-between text-xs text-kala-terracotta hover:underline font-semibold"
                  >
                    <span>View in Payments Ledger</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Admin Management Actions ── */}
      {(isPending || isConfirmed) && (
        <Card className="p-6 border-red-100 bg-red-50/20 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-700">
            Administrative Intervention
          </h2>
          <p className="text-xs text-stone-600 max-w-xl">
            As an administrator, you can cancel this booking. Cancelling will release the slot back to the calendar and invokes Refund.
          </p>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Booking as Administrator
          </Button>
        </Card>
      )}

      {/* ── Cancel Booking Modal ── */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Admin: Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to cancel booking <strong className="font-mono text-stone-900">{booking.id}</strong>?
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin cancellation reason:
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Terms violation, dispute resolution, or system maintenance"
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
              Dismiss
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={handleAdminCancel}
            >
              Confirm Admin Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
