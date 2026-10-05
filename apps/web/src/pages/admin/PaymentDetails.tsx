import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Calendar,
  ExternalLink,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react'
import { useAdminPaymentQuery, useRefundPaymentMutation } from '@/features/payment/hooks'
import { useBookingQuery } from '@/features/booking/hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'

export function AdminPaymentDetails() {
  const { id } = useParams<{ id: string }>()

  const { data: payment, isLoading, isError, refetch } = useAdminPaymentQuery(id ?? '')
  const { data: booking } = useBookingQuery(payment?.bookingId ?? '')

  const refundMutation = useRefundPaymentMutation()
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refundError, setRefundError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="h-10 w-10 border-4 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading payment details...</p>
      </div>
    )
  }

  if (isError || !payment) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-stone-800">Payment not found</h2>
        <p className="text-stone-500 text-sm">
          No payment transaction was found matching this identifier.
        </p>
        <Link to="/admin/payments">
          <Button variant="outline">Back to Payments</Button>
        </Link>
      </div>
    )
  }

  const handleIssueRefund = async () => {
    if (!payment.bookingId) return
    setRefundError(null)
    try {
      await refundMutation.mutateAsync({
        bookingId: payment.bookingId,
        reason: refundReason.trim() || 'Admin initiated refund',
      })
      setRefundModalOpen(false)
      await refetch()
    } catch (err: any) {
      setRefundError(err?.response?.data?.message || 'Failed to issue refund.')
    }
  }

  const isSucceeded = payment.status === 'SUCCEEDED'
  const isRefunded = payment.status === 'REFUNDED'
  const isRefundPending = payment.status === 'REFUND_PENDING'
  const isFailed = payment.status === 'FAILED'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <Badge variant="success">SUCCEEDED</Badge>
      case 'INITIATED':
        return <Badge variant="warning">INITIATED</Badge>
      case 'REFUNDED':
        return <Badge variant="info">REFUNDED</Badge>
      case 'REFUND_PENDING':
        return <Badge variant="warning">REFUND PENDING</Badge>
      case 'FAILED':
        return <Badge variant="error">FAILED</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Top Bar ── */}
      <Link
        to="/admin/payments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Payments Overview
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-kala-brown">Payment Details</h1>
            {getStatusBadge(payment.status)}
          </div>
          <p className="text-xs text-stone-400 font-mono mt-1">
            Payment ID: {payment.id}
          </p>
        </div>

        <div className="text-xs text-stone-500 text-right">
          <p>Initiated: {formatDate(payment.createdAt)} · {formatTime(payment.createdAt)}</p>
          {payment.paidAt && (
            <p className="text-emerald-600 font-medium mt-0.5">
              Captured: {formatDate(payment.paidAt)} · {formatTime(payment.paidAt)}
            </p>
          )}
        </div>
      </div>

      {/* ── Status Banners ── */}
      {isRefunded && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <RotateCcw className="text-blue-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Payment Refunded</p>
            <p className="text-blue-700 mt-0.5 text-xs">
              A refund of {formatPrice(payment.refundAmount || payment.amount)} was processed
              {payment.refundedAt ? ` on ${formatDate(payment.refundedAt)}` : ''}.
              {payment.refundId && (
                <span className="block mt-1 font-mono text-[11px]">Refund ID: {payment.refundId}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <XCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Payment Failed</p>
            <p className="text-red-700 mt-0.5 text-xs">
              {payment.failureReason || 'Transaction was declined or cancelled by the provider.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Main Details Grid (2 Cols) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Transaction Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-3">
            Financial Transaction
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-stone-500">Gross Amount:</span>
              <span className="text-2xl font-extrabold text-kala-terracotta">
                {formatPrice(payment.amount)}
              </span>
            </div>

            <div className="space-y-2 text-xs border-t border-stone-100 pt-3">
              <div className="flex justify-between">
                <span className="text-stone-400">Currency:</span>
                <span className="font-semibold text-stone-700">{payment.currency || 'INR'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Payment Gateway:</span>
                <span className="font-semibold text-stone-700">{payment.gateway || 'RAZORPAY'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Gateway Transaction ID:</span>
                <span className="font-mono text-[11px] text-stone-700">{payment.gatewayId || '—'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Student ID:</span>
                <span className="font-mono text-[11px] text-stone-600">{payment.studentId || '—'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Related Booking Card */}
        <Card className="p-6 space-y-4 border-stone-200/80">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Related Booking
            </h2>
            <Link
              to={`/admin/bookings/${payment.bookingId}`}
              className="text-xs text-kala-terracotta hover:underline font-medium inline-flex items-center gap-1"
            >
              View Booking <ExternalLink size={11} />
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-stone-400 font-mono">Booking ID: {payment.bookingId}</p>
              {booking && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        getBookingStatusColor(booking.status),
                      )}
                    >
                      {getBookingStatusLabel(booking.status)}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {booking.offering?.title || (booking.offering as any)?.subcategory?.name || 'Session'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-500 pt-1">
                    <p>
                      <strong>Student:</strong> {booking.student?.name} ({booking.student?.email})
                    </p>
                    <p className="mt-0.5">
                      <strong>Instructor:</strong> {booking.instructor?.name}
                    </p>
                    <p className="mt-0.5">
                      <strong>Scheduled:</strong> {formatDate(booking.slot.startTime)} · {formatTime(booking.slot.startTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Admin Refund Actions ── */}
      {isSucceeded && (
        <Card className="p-6 border-amber-200 bg-amber-50/20 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Administrative Refund Action
          </h2>
          <p className="text-xs text-stone-600 max-w-xl">
            This payment was captured successfully. If the student or instructor raised a dispute, you can issue a refund via the Razorpay gateway.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100 gap-1.5"
            onClick={() => setRefundModalOpen(true)}
          >
            <RotateCcw size={14} /> Issue Full Refund via Gateway
          </Button>
        </Card>
      )}

      {/* ── Refund Modal ── */}
      <Modal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Issue Payment Refund"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Are you sure you want to refund <strong className="text-stone-900">{formatPrice(payment.amount)}</strong> to the customer?
            This will communicate directly with the Razorpay gateway and update the payment record.
          </p>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Refund reason:
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Instructor cancellation, student refund request, or dispute resolution"
              className="w-full text-sm border border-stone-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-kala-amber/30 min-h-[80px]"
            />
          </div>

          {refundError && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">
              {refundError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundModalOpen(false)}
              disabled={refundMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={refundMutation.isPending}
              onClick={handleIssueRefund}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
