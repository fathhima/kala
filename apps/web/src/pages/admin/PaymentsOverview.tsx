import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import { useAdminPaymentsQuery } from '@/features/payment/hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
} from '@/lib/utils'
import type { PaymentDto, PaymentControllerListAdminPaymentsStatusEnum } from '@/api'

const statusOptions: { label: string; value?: PaymentControllerListAdminPaymentsStatusEnum }[] = [
  { label: 'All Statuses', value: undefined },
  { label: 'Succeeded', value: 'SUCCEEDED' as PaymentControllerListAdminPaymentsStatusEnum },
  { label: 'Initiated (Pending)', value: 'INITIATED' as PaymentControllerListAdminPaymentsStatusEnum },
  { label: 'Refunded', value: 'REFUNDED' as PaymentControllerListAdminPaymentsStatusEnum },
  { label: 'Refund Pending', value: 'REFUND_PENDING' as PaymentControllerListAdminPaymentsStatusEnum },
  { label: 'Failed', value: 'FAILED' as PaymentControllerListAdminPaymentsStatusEnum },
]

export function PaymentsOverview() {
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [selectedStatus, setSelectedStatus] = useState<PaymentControllerListAdminPaymentsStatusEnum | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, refetch, isFetching } = useAdminPaymentsQuery({
    page,
    limit,
    status: selectedStatus,
  })

  const payments: PaymentDto[] = data?.items ?? []
  const meta = data?.meta

  // Client-side search filtering by payment ID, booking ID, student ID, gateway reference
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments
    const q = searchQuery.toLowerCase().trim()
    return payments.filter((p) => {
      const matchId = p.id.toLowerCase().includes(q)
      const matchBooking = p.bookingId?.toLowerCase().includes(q)
      const matchStudent = p.studentId?.toLowerCase().includes(q)
      const matchGateway = p.gatewayId?.toLowerCase().includes(q)
      return matchId || matchBooking || matchStudent || matchGateway
    })
  }, [payments, searchQuery])

  // Aggregate stats
  const totalVolume = payments
    .filter((p) => p.status === 'SUCCEEDED' || p.status === 'REFUNDED')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const succeededCount = payments.filter((p) => p.status === 'SUCCEEDED').length
  const pendingCount = payments.filter((p) => p.status === 'PENDING' || (p.status as any) === 'INITIATED').length
  const refundedCount = payments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED' || p.status === 'REFUND_PENDING').length
  const failedCount = payments.filter((p) => p.status === 'FAILED').length

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Payments Overview</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Audit all financial transactions, checkout sessions, and refunds handled through Razorpay.
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

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <TrendingUp size={13} className="text-kala-amber" /> Gross Volume
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-stone-800 mt-1">
            {formatPrice(totalVolume)}
          </p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} /> Succeeded
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{succeededCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock size={13} /> Initiated
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <RotateCcw size={13} /> Refunded
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{refundedCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <XCircle size={13} /> Failed
          </div>
          <p className="text-2xl font-bold text-red-700 mt-1">{failedCount}</p>
        </Card>
      </div>

      {/* ── Search & Filter Controls ── */}
      <Card className="p-4 border-stone-200/80">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Payment ID, booking ID, student ID, or gateway ref..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kala-amber/40 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus((e.target.value as PaymentControllerListAdminPaymentsStatusEnum) || undefined)
                setPage(1)
              }}
              className="w-full sm:w-48 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kala-amber/40 text-stone-700 font-medium"
            >
              {statusOptions.map((opt) => (
                <option key={opt.label} value={opt.value || ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* ── Payments Data Table ── */}
      <Card className="overflow-hidden border-stone-200/80 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-8 w-8 border-3 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-stone-500">Loading payment records...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle size={20} />
            </div>
            <p className="text-stone-800 font-semibold">Failed to load payments</p>
            <p className="text-stone-500 text-xs">An error occurred while communicating with the server.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
              <CreditCard size={24} />
            </div>
            <p className="text-stone-700 font-semibold">No payments found</p>
            <p className="text-stone-400 text-xs max-w-sm mx-auto">
              {searchQuery || selectedStatus
                ? 'Try adjusting your search query or status filter.'
                : 'No payment transactions recorded yet.'}
            </p>
            {(searchQuery || selectedStatus) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedStatus(undefined)
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/70 text-xs font-bold text-stone-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Payment ID</th>
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Gateway Reference</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Payment ID */}
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/payments/${p.id}`}
                        className="font-mono text-xs font-semibold text-kala-terracotta hover:underline"
                        title={p.id}
                      >
                        {p.id.slice(0, 8)}...{p.id.slice(-4)}
                      </Link>
                      <span className="block text-[10px] text-stone-400 mt-0.5">
                        {formatDate(p.createdAt)} · {formatTime(p.createdAt)}
                      </span>
                    </td>

                    {/* Booking ID */}
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/bookings/${p.bookingId}`}
                        className="font-mono text-xs text-stone-600 hover:text-stone-900 hover:underline"
                        title={p.bookingId}
                      >
                        {p.bookingId.slice(0, 8)}...
                      </Link>
                    </td>

                    {/* Student ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-stone-500">
                        {p.studentId ? `${p.studentId.slice(0, 8)}...` : '—'}
                      </span>
                    </td>

                    {/* Gateway Ref */}
                    <td className="px-5 py-3.5">
                      <div className="text-xs">
                        <span className="font-medium text-stone-700 block">
                          {p.gateway || 'RAZORPAY'}
                        </span>
                        <span className="font-mono text-[10px] text-stone-400 block truncate max-w-[120px]">
                          {p.gatewayId || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right font-bold text-stone-800 text-xs">
                      {formatPrice(p.amount)}
                      <span className="block text-[10px] text-stone-400 font-normal">
                        {p.currency || 'INR'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/admin/payments/${p.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs py-1 px-2.5 h-8">
                          <Eye size={13} /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <Pagination
            page={page}
            limit={limit}
            total={meta.total}
            hasNextPage={meta.page < meta.totalPages}
            hasPrevPage={meta.page > 1}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </Card>
    </div>
  )
}
