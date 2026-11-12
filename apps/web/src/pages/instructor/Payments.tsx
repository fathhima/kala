import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { PaymentControllerListStudentPaymentsStatusEnum } from '@/api'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import type { InstructorPaymentItem } from '@/features/payment/api'
import { useInstructorPaymentsQuery } from '@/features/payment/hooks'
import {
  cn,
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'

const statusTabs: {
  label: string
  value?: PaymentControllerListStudentPaymentsStatusEnum
}[] = [
  { label: 'All', value: undefined },
  { label: 'Succeeded', value: 'SUCCEEDED' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Partially Refunded', value: 'PARTIALLY_REFUNDED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
]

function paymentStatusBadgeVariant(
  status: string,
): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'SUCCEEDED':
      return 'success'
    case 'REFUNDED':
      return 'info'
    case 'PARTIALLY_REFUNDED':
    case 'REFUND_PENDING':
    case 'PROCESSING':
      return 'warning'
    case 'FAILED':
      return 'error'
    default:
      return 'default'
  }
}

function formatPaymentStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'SUCCEEDED') {
    return <CheckCircle2 size={15} className="text-emerald-600" />
  }
  if (
    status === 'REFUNDED' ||
    status === 'PARTIALLY_REFUNDED' ||
    status === 'REFUND_PENDING'
  ) {
    return <RotateCcw size={15} className="text-blue-500" />
  }
  if (status === 'FAILED') {
    return <XCircle size={15} className="text-red-500" />
  }
  return <Clock size={15} className="text-stone-400" />
}

function getNetDisplayAmount(item: InstructorPaymentItem): number {
  if (item.status === 'PARTIALLY_REFUNDED') {
    return Math.max(0, item.amount - (item.refundAmount ?? 0))
  }
  return item.amount
}

export function InstructorPayments() {
  const [page, setPage] = useState(1)
  const limit = 10
  const [selectedStatus, setSelectedStatus] = useState<
    PaymentControllerListStudentPaymentsStatusEnum | undefined
  >(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fromIso = fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined
  const toIso = toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined

  const { data, isLoading, isError, refetch, isFetching } =
    useInstructorPaymentsQuery({
      page,
      limit,
      status: selectedStatus,
      from: fromIso,
      to: toIso,
    })

  const summary = data?.summary ?? {
    totalEarned: 0,
    paidCount: 0,
    thisMonthEarned: 0,
    totalRefunded: 0,
    refundedCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
  }
  const items: InstructorPaymentItem[] = data?.items ?? []
  const meta = data?.meta

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items

    return items.filter((item) => {
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.offeringTitle.toLowerCase().includes(q) ||
        item.bookingId.toLowerCase().includes(q) ||
        (item.gatewayId?.toLowerCase().includes(q) ?? false) ||
        (item.refundId?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [items, searchQuery])

  const currentMonthLabel = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const handleStatusChange = (
    status?: PaymentControllerListStudentPaymentsStatusEnum,
  ) => {
    setSelectedStatus(status)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSelectedStatus(undefined)
    setSearchQuery('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const hasActiveFilters = Boolean(
    selectedStatus || searchQuery.trim() || fromDate || toDate,
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">
            Earnings &amp; Payments
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Track your session revenue, monthly earnings, and refund history.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start sm:self-auto text-stone-600 hover:text-stone-900"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-stone-200/80">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">
            <IndianRupee size={14} className="text-emerald-600" />
            <span>Net Earned</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {formatPrice(summary.totalEarned)}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {summary.paidCount} paid session{summary.paidCount !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="p-5 border-stone-200/80">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">
            <TrendingUp size={14} className="text-kala-amber" />
            <span>This Month</span>
          </div>
          <p className="text-2xl font-bold text-kala-terracotta">
            {formatPrice(summary.thisMonthEarned)}
          </p>
          <p className="text-xs text-stone-500 mt-1">{currentMonthLabel}</p>
        </Card>

        <Card className="p-5 border-stone-200/80">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">
            <RotateCcw size={14} className="text-blue-500" />
            <span>Refunded</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {formatPrice(summary.totalRefunded)}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {summary.refundedCount} refund{summary.refundedCount !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="p-5 border-stone-200/80">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-400 mb-1.5">
            <Clock size={14} className="text-amber-500" />
            <span>Pending</span>
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {formatPrice(summary.pendingAmount)}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {summary.pendingCount} awaiting payment
          </p>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="flex gap-1.5 bg-stone-100 p-1.5 rounded-2xl w-fit overflow-x-auto max-w-full">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.value
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white text-kala-brown shadow-xs'
                    : 'text-stone-500 hover:text-stone-800',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, topic, booking ID, or payment ref..."
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-kala-amber/40 focus:border-kala-amber transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPage(1)
              }}
              aria-label="From date"
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-kala-amber/40"
            />
            <span className="text-xs text-stone-400">to</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => {
                setToDate(e.target.value)
                setPage(1)
              }}
              aria-label="To date"
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-kala-amber/40"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white border border-stone-200/60 rounded-2xl p-5 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-stone-200 rounded-full" />
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-stone-200 rounded" />
                  <div className="w-56 h-3 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="w-24 h-6 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center space-y-3 border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <p className="text-stone-800 font-semibold">
            Failed to load earnings
          </p>
          <p className="text-stone-500 text-sm">
            An error occurred while fetching your payment records.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-dashed border-stone-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
            <IndianRupee size={22} />
          </div>
          <h3 className="text-base font-semibold text-stone-800">
            No payment records found
          </h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try clearing or adjusting your active status, search, or date filters.'
              : 'Session payments from student bookings will appear here.'}
          </p>
          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={handleClearFilters}>
              Reset filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const netAmount = getNetDisplayAmount(item)
            const timestamp = item.paidAt ?? item.refundedAt ?? item.createdAt

            return (
              <Link
                key={item.id}
                to={`/instructor/sessions/${item.bookingId}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/80 rounded-2xl px-5 py-4 shadow-xs hover:border-kala-amber/50 hover:shadow-md transition-all group"
              >
                {/* Left: Student + Session Context */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <Avatar
                    name={item.student.name}
                    src={item.student.imageUrl ?? undefined}
                    size="md"
                    className="ring-1 ring-stone-200 shrink-0"
                  />

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-stone-900 text-sm sm:text-base truncate">
                        {item.student.name}
                      </p>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
                          getBookingStatusColor(item.bookingStatus),
                        )}
                      >
                        {getBookingStatusLabel(item.bookingStatus)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 font-medium truncate">
                      {item.offeringTitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-kala-amber" />
                        {formatDate(item.slotStartTime)} ·{' '}
                        {formatTime(item.slotStartTime)} –{' '}
                        {formatTime(item.slotEndTime)}
                      </span>
                      <span className="text-stone-300 hidden sm:inline">•</span>
                      <span>{item.durationMinutes} min</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400">
                      <span>{formatDateTime(timestamp)}</span>
                      {item.gatewayId && (
                        <span className="font-mono truncate max-w-[220px]">
                          Ref: {item.gatewayId}
                        </span>
                      )}
                      {item.refundId && (
                        <span className="font-mono text-blue-600 truncate max-w-[220px]">
                          Refund: {item.refundId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Payment Status */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="sm:text-right">
                    <div className="flex items-center gap-1.5 sm:justify-end mb-1">
                      <StatusIcon status={item.status} />
                      <p
                        className={cn(
                          'text-base font-bold',
                          item.status === 'SUCCEEDED' ||
                            item.status === 'PARTIALLY_REFUNDED'
                            ? 'text-stone-900'
                            : item.status === 'REFUNDED'
                              ? 'text-blue-600'
                              : item.status === 'FAILED'
                                ? 'text-red-500'
                                : 'text-stone-500',
                        )}
                      >
                        {formatPrice(netAmount)}
                      </p>
                    </div>

                    {item.status === 'PARTIALLY_REFUNDED' &&
                      item.refundAmount != null && (
                        <p className="text-[11px] text-stone-500 mb-1">
                          Gross {formatPrice(item.amount)} · Refunded{' '}
                          {formatPrice(item.refundAmount)}
                        </p>
                      )}

                    <Badge variant={paymentStatusBadgeVariant(item.status)}>
                      {formatPaymentStatusLabel(item.status)}
                    </Badge>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-stone-300 group-hover:text-kala-amber transition-colors hidden sm:block"
                  />
                </div>
              </Link>
            )
          })}

          {meta && meta.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                page={page}
                limit={limit}
                total={meta.total}
                hasNextPage={meta.page < meta.totalPages}
                hasPrevPage={meta.page > 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
