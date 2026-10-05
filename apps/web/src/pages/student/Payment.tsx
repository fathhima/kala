import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Palette,
  ShieldCheck,
  AlertTriangle,
  Video,
  User,
  Mail,
  RefreshCw,
  Sparkles,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useBookingQuery, useCancelBookingMutation } from '@/features/booking/hooks'
import {
  useCreateCheckoutMutation,
  useConfirmDevPaymentMutation,
  useRecordPaymentFailureMutation,
} from '@/features/payment/hooks'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatTime, formatPrice, cn } from '@/lib/utils'

export function Payment() {
  const { id: paramId, bookingId: paramBookingId } = useParams<{ id?: string; bookingId?: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Resolve bookingId from route param (:id or :bookingId), search params (?bookingId=...), or navigation state
  const bookingId =
    paramBookingId ||
    paramId ||
    searchParams.get('bookingId') ||
    (location.state as { bookingId?: string } | null)?.bookingId ||
    ''

  const {
    data: booking,
    isLoading,
    isError,
    refetch: refetchBooking,
  } = useBookingQuery(bookingId)

  const createCheckoutMutation = useCreateCheckoutMutation()
  const confirmDevPaymentMutation = useConfirmDevPaymentMutation()
  const cancelBookingMutation = useCancelBookingMutation()
  const recordPaymentFailureMutation = useRecordPaymentFailureMutation()

  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId?: string
    orderId?: string
  } | null>(null)
  const [paymentFailedData, setPaymentFailedData] = useState<{
    reason: string
    code?: string
    orderId?: string
    paymentId?: string
  } | null>(null)

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelHoldError, setCancelHoldError] = useState<string | null>(null)

  // ─── Slot hold countdown timer ──────────────────────────────────────────────
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!booking?.holdExpiresAt || booking.status !== 'PAYMENT_PENDING') {
      setRemainingSeconds(null)
      return
    }

    const updateTimer = () => {
      const expiresAt = new Date(booking.holdExpiresAt).getTime()
      const now = Date.now()
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setRemainingSeconds(diff)
      if (diff <= 0) {
        refetchBooking()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [booking?.holdExpiresAt, booking?.status, refetchBooking])

  const formattedCountdown = useMemo(() => {
    if (remainingSeconds === null) return ''
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [remainingSeconds])

  // ─── Razorpay Checkout Trigger ──────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!booking) return
    setPaymentError(null)
    setPaymentFailedData(null)
    setIsProcessingPayment(true)

    try {
      // 1. Create checkout order on backend
      const checkout = await createCheckoutMutation.mutateAsync(booking.id)

      if (!checkout?.sessionId) {
        throw new Error('Checkout session could not be initialized from the server.')
      }

      // If in development mode and the order was generated as a dev mock order (e.g. Razorpay API unreachable)
      if (checkout.sessionId.startsWith('order_dev_')) {
        const payment = await confirmDevPaymentMutation.mutateAsync(booking.id)
        setIsProcessingPayment(false)
        setPaymentSuccessData({
          paymentId: payment.id,
          orderId: checkout.sessionId,
        })
        await refetchBooking()
        return
      }

      // 2. Open client-side Razorpay modal
      await openRazorpayCheckout({
        key: checkout.gatewayKeyId,
        amount: Math.round(booking.amount * 100), // in paise
        currency: booking.currency || 'INR',
        name: 'Kala Learning',
        description: `${(booking.offering as any)?.subcategory?.name || 'Creative'} Session with ${booking.instructor.name}`,
        order_id: checkout.sessionId,
        prefill: {
          name: booking.student.name,
          email: booking.student.email,
        },
        notes: {
          bookingId: booking.id,
        },
        theme: {
          color: '#D97706', // Kala amber
        },
        retry: {
          enabled: false,
        },
        handler: async (response) => {
          setIsProcessingPayment(false)
          setPaymentSuccessData({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          })
          await refetchBooking()
        },
        onFailure: (failure) => {
          setIsProcessingPayment(false)
          const reason =
            failure.error?.description ||
            failure.error?.reason ||
            'Payment failed or was declined.'
          setPaymentFailedData({
            reason,
            code: failure.error?.code,
            orderId: failure.error?.metadata?.order_id || checkout.sessionId,
            paymentId: failure.error?.metadata?.payment_id,
          })
          recordPaymentFailureMutation
            .mutateAsync({
              bookingId: booking.id,
              reason,
            })
            .catch(() => {})
          refetchBooking()
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false)
          },
        },
      })
    } catch (err: any) {
      setIsProcessingPayment(false)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to initialize payment. Please try again.'
      setPaymentError(message)
    }
  }

  const handleSimulatePayment = async () => {
    if (!booking) return
    setIsProcessingPayment(true)
    setPaymentError(null)
    try {
      await createCheckoutMutation.mutateAsync(booking.id).catch(() => {})
      const payment = await confirmDevPaymentMutation.mutateAsync(booking.id)
      setIsProcessingPayment(false)
      setPaymentSuccessData({
        paymentId: payment.id,
        orderId: `dev_sim_${Date.now()}`,
      })
      await refetchBooking()
    } catch (err: any) {
      setIsProcessingPayment(false)
      setPaymentError(err?.response?.data?.message || err?.message || 'Failed to simulate payment.')
    }
  }

  const handleCancelHold = () => {
    setCancelHoldError(null)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancelHold = async () => {
    if (!booking) return
    setCancelHoldError(null)
    try {
      await cancelBookingMutation.mutateAsync({
        bookingId: booking.id,
        reason: 'Cancelled by student during checkout hold',
      })
      setIsCancelModalOpen(false)
      navigate(`/instructors/${booking.profileId || ''}`)
    } catch (err: any) {
      setCancelHoldError(err?.response?.data?.message || err?.message || 'Failed to cancel hold.')
    }
  }

  // ─── Shell Component ────────────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (booking?.profileId) {
                navigate(`/instructors/${booking.profileId}`)
              } else {
                navigate(-1)
              }
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <Link to="/" className="flex items-center gap-2 font-bold text-kala-brown text-lg">
            <Palette size={22} className="text-kala-amber" /> Kala
          </Link>

          <span className="flex items-center gap-1.5 text-xs text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-full">
            <Lock size={12} className="text-green-600" /> Secure Checkout
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-5xl">{children}</div>
      </main>

      {/* ── Cancel Booking Modal ── */}
      <Modal
        open={isCancelModalOpen}
        onClose={() => !cancelBookingMutation.isPending && setIsCancelModalOpen(false)}
        title="Cancel Slot Reservation"
      >
        <div className="space-y-4 pt-1">
          {cancelHoldError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{cancelHoldError}</span>
            </div>
          )}

          <div className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-amber-900">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-950">Release this slot reservation?</p>
              <p className="text-amber-800 leading-relaxed">
                Cancelling will release your temporary hold immediately. This slot will become available for other learners to book.
              </p>
            </div>
          </div>

          {booking && (
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs space-y-2 text-stone-600">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-medium">Instructor</span>
                <span className="font-semibold text-stone-800">{booking.instructor.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 font-medium">Date & Time</span>
                <span className="font-semibold text-stone-800">
                  {formatDate(booking.slot.startTime)} · {formatTime(booking.slot.startTime)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-stone-200/60 pt-2">
                <span className="text-stone-400 font-medium">Fee</span>
                <span className="font-bold text-kala-terracotta text-sm">{formatPrice(booking.amount)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={cancelBookingMutation.isPending}
              onClick={() => setIsCancelModalOpen(false)}
            >
              Keep Slot
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={cancelBookingMutation.isPending}
              onClick={handleConfirmCancelHold}
            >
              Yes, Cancel Slot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Shell>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="h-12 w-12 border-4 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Retrieving booking & session details...</p>
        </div>
      </Shell>
    )
  }

  // ─── Missing / Error State ──────────────────────────────────────────────────
  if (isError || !booking) {
    return (
      <Shell>
        <Card className="p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-stone-800">Booking Not Found</h2>
          <p className="text-sm text-stone-500">
            We could not find the booking you are looking for. It may have expired or was cancelled.
          </p>
          <div className="pt-2">
            <Link to="/instructors">
              <Button variant="outline" className="w-full">
                Browse Instructors
              </Button>
            </Link>
          </div>
        </Card>
      </Shell>
    )
  }

  // ─── Success Screen (Confirmed status or payment callback) ─────────────────
  if (booking.status === 'CONFIRMED' || paymentSuccessData) {
    return (
      <Shell>
        <Card className="p-8 sm:p-10 text-center max-w-lg mx-auto space-y-6 shadow-sm">
          <div className="flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mx-auto">
            <CheckCircle2 size={44} className="text-green-600" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full mb-2">
              <Sparkles size={13} /> Payment Successful
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-kala-brown">You're Booked!</h1>
            <p className="text-stone-500 text-sm mt-1">
              Your session with <span className="font-semibold text-stone-800">{booking.instructor.name}</span> is confirmed.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 text-sm text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-medium">Booking ID</span>
              <span className="font-mono text-xs font-bold text-stone-700">{booking.id}</span>
            </div>

            {paymentSuccessData?.paymentId && (
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-xs text-stone-400 uppercase font-medium">Payment ID</span>
                <span className="font-mono text-xs text-stone-600">{paymentSuccessData.paymentId}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Topic</span>
              <span className="font-medium text-stone-800">
                {booking.offering.title || (booking.offering as any)?.subcategory?.name || 'Creative Session'}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Date</span>
              <span className="font-medium text-stone-800">{formatDate(booking.slot.startTime)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Time</span>
              <span className="font-medium text-stone-800">
                {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)} ({booking.slot.timezone || 'IST'})
              </span>
            </div>

            <div className="flex justify-between border-t border-stone-200 pt-3">
              <span className="font-semibold text-stone-700">Amount Paid</span>
              <span className="font-extrabold text-green-700 text-base">
                {formatPrice(booking.amount)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button className="w-full" size="lg" onClick={() => navigate('/dashboard/bookings')}>
              Go to My Bookings
            </Button>
            <Link to="/" className="block">
              <Button variant="ghost" className="w-full text-stone-500">
                Return to Home
              </Button>
            </Link>
          </div>
        </Card>
      </Shell>
    )
  }

  // ─── Payment Failed Screen ──────────────────────────────────────────────────
  if (paymentFailedData) {
    return (
      <Shell>
        <Card className="p-8 sm:p-10 text-center max-w-lg mx-auto space-y-6 shadow-sm border-stone-200">
          <div className="flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mx-auto">
            <XCircle size={44} className="text-red-500" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-100 px-3 py-1 rounded-full mb-2">
              Payment Unsuccessful
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-kala-brown">Payment Failed</h1>
            <p className="text-stone-500 text-sm mt-1 max-w-sm mx-auto">
              {paymentFailedData.reason}
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 text-sm text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-stone-200">
              <span className="text-xs text-stone-400 uppercase font-medium">Booking ID</span>
              <span className="font-mono text-xs font-bold text-stone-700">{booking.id}</span>
            </div>

            {paymentFailedData.paymentId && (
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-xs text-stone-400 uppercase font-medium">Attempt Reference</span>
                <span className="font-mono text-xs text-stone-600">{paymentFailedData.paymentId}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-600">
              <span>Topic</span>
              <span className="font-medium text-stone-800">
                {booking.offering.title || (booking.offering as any)?.subcategory?.name || 'Creative Session'}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Instructor</span>
              <span className="font-medium text-stone-800">{booking.instructor.name}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Date</span>
              <span className="font-medium text-stone-800">{formatDate(booking.slot.startTime)}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Time</span>
              <span className="font-medium text-stone-800">
                {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
              </span>
            </div>

            <div className="flex justify-between border-t border-stone-200 pt-3">
              <span className="font-semibold text-stone-700">Amount Due</span>
              <span className="font-extrabold text-stone-900 text-base">
                {formatPrice(booking.amount)}
              </span>
            </div>
          </div>

          {remainingSeconds !== null && remainingSeconds > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 text-left flex items-start gap-2.5">
              <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Your slot hold is still reserved for {formattedCountdown}!</p>
                <p className="mt-0.5 text-amber-700">
                  You can retry paying now, or visit your <strong>My Bookings</strong> section to complete it anytime before the hold expires.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <Button
              className="w-full gap-2 text-base font-semibold shadow-md shadow-amber-600/20"
              size="lg"
              onClick={() => {
                setPaymentFailedData(null)
                handleProceedToPayment()
              }}
            >
              <RotateCcw size={16} /> Try Paying Again
            </Button>

            <Button
              variant="outline"
              className="w-full text-stone-700"
              size="lg"
              onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
            >
              Go to My Bookings
            </Button>

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full text-center text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-2.5 transition-colors"
              >
                 Simulate Successful Payment (Dev Mode)
              </button>
            )}

            <button
              type="button"
              disabled={cancelBookingMutation.isPending}
              onClick={handleCancelHold}
              className="w-full text-center text-xs text-stone-400 hover:text-stone-700 py-1 transition-colors"
            >
              Cancel Booking
            </button>
          </div>
        </Card>
      </Shell>
    )
  }

  // ─── Hold Expired State ─────────────────────────────────────────────────────
  if (booking.status === 'EXPIRED' || (remainingSeconds !== null && remainingSeconds <= 0)) {
    return (
      <Shell>
        <Card className="p-8 text-center max-w-md mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800 mb-1">Slot Hold Expired</h2>
            <p className="text-sm text-stone-500">
              The 10-minute hold window for this session has elapsed. The slot has been released for other students.
            </p>
          </div>

          <div className="pt-2">
            <Link to={`/instructors/${booking.profileId}`}>
              <Button className="w-full">
                Choose Another Slot
              </Button>
            </Link>
          </div>
        </Card>
      </Shell>
    )
  }

  // ─── Cancelled State ────────────────────────────────────────────────────────
  if (booking.status === 'CANCELLED') {
    return (
      <Shell>
        <Card className="p-8 text-center max-w-md mx-auto space-y-4">
          <h2 className="text-xl font-bold text-stone-800">Booking Cancelled</h2>
          <p className="text-sm text-stone-500">
            This booking was cancelled and the slot is no longer reserved.
          </p>
          <div className="pt-2">
            <Link to="/instructors">
              <Button variant="outline" className="w-full">
                Browse Instructors
              </Button>
            </Link>
          </div>
        </Card>
      </Shell>
    )
  }

  // ─── Main Checkout & Review View ───────────────────────────────────────────
  return (
    <Shell>
      {/* ── Top Countdown Notice Banner ── */}
      {remainingSeconds !== null && remainingSeconds > 0 && (
        <div
          className={cn(
            'mb-6 px-4 py-3 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm transition-colors',
            remainingSeconds < 120
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50/90 border-amber-200 text-kala-brown',
          )}
        >
          <div className="flex items-center gap-2.5">
            <Clock size={18} className={remainingSeconds < 120 ? 'text-red-500 animate-pulse' : 'text-kala-amber'} />
            <span className="font-medium">
              Slot held for you! Complete payment to confirm your booking.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 bg-white/80 rounded-xl border border-stone-200/80 shadow-xs">
            <span>Expires in:</span>
            <span className={cn(remainingSeconds < 120 ? 'text-red-600' : 'text-kala-terracotta')}>
              {formattedCountdown}
            </span>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {paymentError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Payment was not completed</p>
              <p className="text-xs text-red-600 mt-0.5">{paymentError}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="text-xs font-semibold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Simulate Payment (Dev Mode)
              </button>
            )}
            <button
              type="button"
              onClick={() => setPaymentError(null)}
              className="text-xs underline text-red-700 hover:text-red-900 ml-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-kala-brown">Review & Checkout</h1>
        <p className="text-stone-500 text-sm mt-1">
          Review your session details and complete payment with Razorpay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* ══════════════════════════════════════════
            LEFT COLUMN: Session & Instructor Details (3/5)
        ══════════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-5">
          {/* Instructor Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Instructor
              </h2>
              <Link
                to={`/instructors/${booking.profileId}`}
                className="text-xs font-medium text-kala-terracotta hover:underline"
              >
                View Profile
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Avatar
                name={booking.instructor.name}
                src={typeof booking.instructor.imageUrl === 'string' ? booking.instructor.imageUrl : undefined}
                size="lg"
                className="ring-2 ring-stone-100"
              />
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-base">{booking.instructor.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified Instructor on Kala
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="warning">
                    {(booking.offering as any)?.subcategory?.name || 'Creative Arts'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Session Details Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Session Schedule
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-stone-700">
                <div className="p-2 rounded-xl bg-amber-50 text-kala-amber shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{formatDate(booking.slot.startTime)}</p>
                  <p className="text-xs text-stone-500">Confirmed booking date</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-stone-700">
                <div className="p-2 rounded-xl bg-amber-50 text-kala-amber shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">
                    {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                  </p>
                  <p className="text-xs text-stone-500">
                    Duration: {booking.durationMinutes || 60} minutes ({booking.slot.timezone || 'IST'})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-stone-700">
                <div className="p-2 rounded-xl bg-amber-50 text-kala-amber shrink-0">
                  <Video size={18} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">1-on-1 Interactive Video Session</p>
                  <p className="text-xs text-stone-500">
                    Live video call link will be activated in your dashboard once confirmed.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Learner Info Card */}
          <Card className="p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Learner Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <User size={15} className="text-stone-400 shrink-0" />
                <span className="truncate font-medium">{booking.student.name}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <Mail size={15} className="text-stone-400 shrink-0" />
                <span className="truncate font-medium">{booking.student.email}</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 pt-1">
              Your receipt and meeting invite will be delivered to this email.
            </p>
          </Card>

          {/* Refund & Cancellation Policy Notice */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 text-xs text-stone-600 space-y-2">
            <p className="font-semibold text-stone-800 text-sm flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-kala-amber" /> Kala Satisfaction & Refund Policy
            </p>
            <p className="leading-relaxed">
              Plans change! Cancel with full peace of mind:
            </p>
            <ul className="list-disc list-inside space-y-1 text-stone-500 pl-1">
              <li><strong className="text-stone-700">100% refund</strong> if cancelled 24+ hours prior to start.</li>
              <li><strong className="text-stone-700">50% refund</strong> if cancelled between 12 and 24 hours prior.</li>
              <li><strong className="text-stone-700">25% refund</strong> if cancelled between 2 and 12 hours prior.</li>
            </ul>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT COLUMN: Sticky Order Summary & Pay (2/5)
        ══════════════════════════════════════════ */}
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-5 sticky top-24 shadow-sm border-stone-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Payment Summary
            </h2>

            {/* Offering Title */}
            <div>
              <p className="font-bold text-stone-800 text-base leading-snug">
                {booking.offering.title || (booking.offering as any)?.subcategory?.name || 'One-on-One Session'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                with {booking.instructor.name}
              </p>
            </div>

            <hr className="border-stone-100" />

            {/* Price Line Items */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Hourly Rate</span>
                <span>{formatPrice(booking.hourlyRate)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Duration</span>
                <span>{booking.durationMinutes || 60} mins</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Platform & Service Fee</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-stone-800 text-base">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-kala-terracotta">
                    {formatPrice(booking.amount)}
                  </span>
                  <span className="block text-[10px] text-stone-400 uppercase font-medium">
                    {booking.currency || 'INR'} Includes taxes
                  </span>
                </div>
              </div>
            </div>

            {/* Action: Pay with Razorpay */}
            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                className="w-full text-base font-semibold gap-2 py-3.5 shadow-md shadow-amber-600/20"
                loading={isProcessingPayment || createCheckoutMutation.isPending}
                onClick={handleProceedToPayment}
              >
                <Lock size={16} /> Pay {formatPrice(booking.amount)} with Razorpay
              </Button>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  disabled={isProcessingPayment || confirmDevPaymentMutation.isPending}
                  onClick={handleSimulatePayment}
                  className="w-full text-center text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-2.5 transition-colors flex items-center justify-center gap-1.5"
                >
                   Simulate Successful Payment (Dev Mode)
                </button>
              )}

              <button
                type="button"
                disabled={cancelBookingMutation.isPending}
                onClick={handleCancelHold}
                className="w-full text-center text-xs text-stone-400 hover:text-stone-700 py-1 transition-colors"
              >
                Cancel Booking
              </button>
            </div>

            {/* Trust and Razorpay badges */}
            <div className="border-t border-stone-100 pt-4 space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
                <ShieldCheck size={14} className="text-green-600" />
                <span>256-bit SSL encrypted · Razorpay secure gateway</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-tight">
                Supports UPI, Credit/Debit Cards, NetBanking & Wallets
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
