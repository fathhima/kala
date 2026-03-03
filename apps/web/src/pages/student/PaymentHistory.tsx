import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CreditCard, RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { cn, formatPrice, formatDateTime, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'
import type { Booking } from '../../types'

type Filter = 'all' | 'paid' | 'refunded' | 'pending'

function paymentFilter(booking: Booking, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'paid') return booking.payment?.status === 'SUCCESS'
  if (filter === 'refunded') return booking.payment?.status === 'REFUNDED'
  if (filter === 'pending') return !booking.payment || booking.payment.status === 'PENDING' || booking.payment.status === 'FAILED'
  return true
}

function StatusIcon({ status }: { status: string | undefined }) {
  if (status === 'SUCCESS') return <CheckCircle2 size={15} className="text-green-500" />
  if (status === 'REFUNDED') return <RotateCcw size={15} className="text-blue-500" />
  if (status === 'FAILED') return <XCircle size={15} className="text-red-500" />
  return <Clock size={15} className="text-stone-400" />
}

function paymentStatusBadgeVariant(status: string | undefined): 'success' | 'error' | 'warning' | 'default' {
  if (status === 'SUCCESS') return 'success'
  if (status === 'REFUNDED') return 'warning'
  if (status === 'FAILED') return 'error'
  return 'default'
}

export function PaymentHistory() {
  const { bookings } = useBookingStore()
  const { user } = useAuthStore()
  const [activeFilter, setActiveFilter] = useState<Filter>('all')

  const myBookings = bookings.filter((b) => b.studentId === user?.id)

  const stats = useMemo(() => {
    const paid = myBookings
      .filter((b) => b.payment?.status === 'SUCCESS')
      .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0)
    const refunded = myBookings
      .filter((b) => b.payment?.status === 'REFUNDED')
      .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0)
    const pending = myBookings.filter((b) => !b.payment || b.payment.status === 'PENDING').length
    return { paid, refunded, pending }
  }, [myBookings])

  const filtered = myBookings.filter((b) => paymentFilter(b, activeFilter))

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: myBookings.length },
    { key: 'paid', label: 'Paid', count: myBookings.filter((b) => b.payment?.status === 'SUCCESS').length },
    { key: 'refunded', label: 'Refunded', count: myBookings.filter((b) => b.payment?.status === 'REFUNDED').length },
    { key: 'pending', label: 'Pending', count: myBookings.filter((b) => !b.payment || b.payment?.status === 'PENDING').length },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Payments</h1>
        <p className="text-stone-500 text-sm mt-1">All your session payments and refunds in one place.</p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={15} className="text-green-500" />
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{formatPrice(stats.paid)}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {myBookings.filter((b) => b.payment?.status === 'SUCCESS').length} session{myBookings.filter((b) => b.payment?.status === 'SUCCESS').length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw size={15} className="text-blue-500" />
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Refunded</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{formatPrice(stats.refunded)}</p>
          <p className="text-xs text-stone-400 mt-0.5">
            {myBookings.filter((b) => b.payment?.status === 'REFUNDED').length} cancellation{myBookings.filter((b) => b.payment?.status === 'REFUNDED').length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-stone-400" />
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="text-2xl font-bold text-stone-800">{stats.pending}</p>
          <p className="text-xs text-stone-400 mt-0.5">awaiting payment</p>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeFilter === tab.key
                ? 'bg-white text-kala-brown shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              activeFilter === tab.key
                ? 'bg-kala-amber/10 text-kala-terracotta'
                : 'bg-stone-200 text-stone-500'
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Transaction list ── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const instructor = booking.instructor
            const skill = instructor.skills.find((s) => s.id === booking.slot.skillId) ?? instructor.skills[0]
            const pStatus = booking.payment?.status

            return (
              <Link
                key={booking.id}
                to={`/dashboard/bookings/${booking.id}`}
                className="flex items-center gap-4 bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm hover:border-kala-amber/40 hover:shadow-md transition-all group"
              >
                <Avatar
                  name={instructor.user.name}
                  src={instructor.user.avatarUrl}
                  size="md"
                />

                {/* Instructor + session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-stone-800 truncate">{instructor.user.name}</p>
                    <span className={cn(
                      'flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                      getBookingStatusColor(booking.status)
                    )}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 truncate">
                    {skill?.name ?? 'Session'} · {formatDateTime(booking.slot.startTime)}
                  </p>
                  {booking.payment?.transactionId && (
                    <p className="text-xs text-stone-400 font-mono mt-0.5 truncate">
                      {booking.payment.transactionId}
                    </p>
                  )}
                </div>

                {/* Provider */}
                {booking.payment?.provider && (
                  <p className="flex-shrink-0 text-xs font-semibold text-stone-400 hidden sm:block">
                    {booking.payment.provider}
                  </p>
                )}

                {/* Amount + status */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-1">
                    <StatusIcon status={pStatus} />
                    <p className={cn(
                      'text-base font-bold',
                      pStatus === 'SUCCESS' ? 'text-stone-800' :
                      pStatus === 'REFUNDED' ? 'text-blue-600' :
                      pStatus === 'FAILED' ? 'text-red-500' :
                      'text-stone-400'
                    )}>
                      {booking.payment ? formatPrice(booking.payment.amount) : '—'}
                    </p>
                  </div>
                  <Badge variant={paymentStatusBadgeVariant(pStatus)}>
                    {pStatus ?? 'Pending'}
                  </Badge>
                </div>

                <ChevronRight size={16} className="text-stone-300 group-hover:text-kala-amber transition-colors flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <CreditCard size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No {activeFilter === 'all' ? '' : activeFilter} transactions found.</p>
        </div>
      )}
    </div>
  )
}
