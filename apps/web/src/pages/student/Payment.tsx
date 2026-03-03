import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft, CreditCard, Smartphone, CheckCircle2,
  Lock, Calendar, Clock, Star, Palette,
} from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthStore } from '../../stores/authStore'
import { mockSlots } from '../../lib/mock'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { formatDate, formatPrice, formatTime, cn } from '../../lib/utils'
import type { Booking } from '../../types'

type PaymentMethod = 'card' | 'upi'

interface LocationState {
  instructorId?: string
  slotId?: string
  skillId?: string
  skillName?: string
  price?: number
}

/* ── helpers ─────────────────────────────────────────────────── */

function formatCardNumber(raw: string) {
  return raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

/* ── component ───────────────────────────────────────────────── */

export function Payment() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: LocationState | null }
  const { instructors } = useInstructorStore()
  const { addBooking } = useBookingStore()
  const { user } = useAuthStore()

  const instructorId = state?.instructorId
  const slotId = state?.slotId
  const skillName = state?.skillName ?? ''
  const price = state?.price ?? 0

  const instructor = instructors.find((i) => i.id === instructorId)
  const slot = mockSlots.find((s) => s.id === slotId)

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [errors, setErrors] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '', upiId: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = { cardNumber: '', expiry: '', cvv: '', cardName: '', upiId: '' }
    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter a valid 16-digit card number'
      if (expiry.length < 5) e.expiry = 'Enter a valid expiry (MM/YY)'
      if (cvv.length < 3) e.cvv = 'Enter a valid CVV'
      if (!cardName.trim()) e.cardName = 'Enter the name on card'
    } else {
      if (!upiId.includes('@')) e.upiId = 'Enter a valid UPI ID (e.g. name@upi)'
    }
    setErrors(e)
    return !e.cardNumber && !e.expiry && !e.cvv && !e.cardName && !e.upiId
  }

  const handlePay = async () => {
    if (!instructor || !slot || !user) return
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))

    const bookingId = `book-${Date.now()}`
    const newBooking: Booking = {
      id: bookingId,
      studentId: user.id,
      studentName: user.name,
      instructorId: instructor.id,
      instructor,
      slotId: slot.id,
      slot,
      status: 'CONFIRMED',
      payment: {
        id: `pay-${Date.now()}`,
        bookingId,
        amount: price,
        status: 'SUCCESS',
        provider: 'RAZORPAY',
        transactionId: `txn_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      },
      messages: [],
      createdAt: new Date().toISOString(),
    }

    addBooking(newBooking)
    setLoading(false)
    setSuccess(true)
  }

  /* ── shared full-screen shell ────────────────────────────────── */
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <Link to="/" className="flex items-center gap-2 font-bold text-kala-brown text-lg">
            <Palette size={22} className="text-kala-amber" /> Kala
          </Link>

          <span className="flex items-center gap-1.5 text-xs text-stone-400">
            <Lock size={11} /> Secure Checkout
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  )

  /* ── Guard ───────────────────────────────────────────────────── */
  if (!instructor || !slot || !user) {
    return (
      <Shell>
        <Card className="p-10 text-center max-w-md mx-auto">
          <p className="text-stone-500 mb-5">Session details not found. Please go back and select a slot.</p>
          <Link to="/instructors"><Button variant="outline">Browse Instructors</Button></Link>
        </Card>
      </Shell>
    )
  }

  /* ── Success screen ──────────────────────────────────────────── */
  if (success) {
    return (
      <Shell>
        <Card className="p-10 text-center max-w-md mx-auto space-y-5">
          <div className="flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mx-auto">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-kala-brown mb-1">Payment Successful!</h2>
            <p className="text-stone-500 text-sm">
              Your session with{' '}
              <span className="font-semibold text-stone-700">{instructor.user.name}</span> is confirmed.
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-4 text-sm text-left space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>Skill</span>
              <span className="font-medium text-stone-800">{skillName}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Date</span>
              <span className="font-medium text-stone-800">{formatDate(slot.startTime)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Time</span>
              <span className="font-medium text-stone-800">
                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2">
              <span className="font-semibold text-stone-700">Amount Paid</span>
              <span className="font-bold text-green-600">{formatPrice(price)}</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => navigate('/dashboard/bookings')}>
            View My Bookings
          </Button>
        </Card>
      </Shell>
    )
  }

  /* ── Main checkout ───────────────────────────────────────────── */
  return (
    <Shell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-kala-brown">Checkout</h1>
        <p className="text-stone-500 text-sm mt-1">Complete your payment to confirm the session.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Payment form (3/5) ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Method selector */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-stone-700 mb-3">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              {(['card', 'upi'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors',
                    method === m
                      ? 'border-kala-amber bg-amber-50 text-kala-brown'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  )}
                >
                  {m === 'card' ? <CreditCard size={16} /> : <Smartphone size={16} />}
                  {m === 'card' ? 'Credit / Debit Card' : 'UPI'}
                </button>
              ))}
            </div>
          </Card>

          {/* Card form */}
          {method === 'card' && (
            <Card className="p-5 space-y-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                error={errors.cardNumber}
                maxLength={19}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  error={errors.expiry}
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  type="password"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  error={errors.cvv}
                  maxLength={4}
                />
              </div>
              <Input
                label="Name on Card"
                placeholder="As printed on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                error={errors.cardName}
              />
            </Card>
          )}

          {/* UPI form */}
          {method === 'upi' && (
            <Card className="p-5">
              <Input
                label="UPI ID"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                error={errors.upiId}
                hint="Enter your UPI ID registered with your bank (e.g. 9876543210@okaxis)"
              />
            </Card>
          )}

          <Button size="lg" className="w-full gap-2" loading={loading} onClick={handlePay}>
            <Lock size={15} />
            Pay {formatPrice(price)} Securely
          </Button>

          <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <Lock size={11} /> 256-bit SSL encrypted · Safe & Secure
          </p>
        </div>

        {/* ── Order summary (2/5) ── */}
        <div className="lg:col-span-2">
          <Card className="p-5 space-y-4 sticky top-6">
            <p className="text-sm font-semibold text-stone-700 uppercase tracking-wide">Order Summary</p>

            <div className="flex items-center gap-3">
              <Avatar name={instructor.user.name} src={instructor.user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-stone-800 text-sm truncate">{instructor.user.name}</p>
                <p className="text-xs text-stone-500">{skillName}</p>
                {instructor.avgRating > 0 && (
                  <p className="text-xs text-stone-400 flex items-center gap-0.5 mt-0.5">
                    <Star size={10} className="text-kala-amber fill-kala-amber" />
                    {instructor.avgRating.toFixed(1)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-stone-400 flex-shrink-0" />
                <span>{formatDate(slot.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-stone-400 flex-shrink-0" />
                <span>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
              <div className="flex justify-between text-stone-600">
                <span>Session fee</span>
                <span>{formatPrice(price)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Platform fee</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-stone-800 border-t border-stone-100 pt-2">
                <span>Total</span>
                <span className="text-kala-brown">{formatPrice(price)}</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </Shell>
  )
}
