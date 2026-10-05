import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import { useAdminBookingsQuery } from '@/features/booking/hooks'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Pagination } from '@/components/ui/Pagination'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'
import type { BookingDto, BookingControllerListAdminStatusEnum } from '@/api'

const statusOptions: { label: string; value?: BookingControllerListAdminStatusEnum }[] = [
  { label: 'All Statuses', value: undefined },
  { label: 'Confirmed', value: 'CONFIRMED' as BookingControllerListAdminStatusEnum },
  { label: 'Payment Pending', value: 'PAYMENT_PENDING' as BookingControllerListAdminStatusEnum },
  { label: 'Completed', value: 'COMPLETED' as BookingControllerListAdminStatusEnum },
  { label: 'Cancelled', value: 'CANCELLED' as BookingControllerListAdminStatusEnum },
  { label: 'Expired', value: 'EXPIRED' as BookingControllerListAdminStatusEnum },
]

export function BookingMonitoring() {
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [selectedStatus, setSelectedStatus] = useState<BookingControllerListAdminStatusEnum | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, refetch, isFetching } = useAdminBookingsQuery({
    page,
    limit,
    status: selectedStatus,
  })

  const bookings: BookingDto[] = data?.items ?? []
  const meta = data?.meta

  // Client-side search filtering by student name, instructor name, offering title, booking ID
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings
    const q = searchQuery.toLowerCase().trim()
    return bookings.filter((b) => {
      const matchId = b.id.toLowerCase().includes(q)
      const matchStudent = b.student?.name?.toLowerCase().includes(q) || b.student?.email?.toLowerCase().includes(q)
      const matchInstructor = b.instructor?.name?.toLowerCase().includes(q)
      const rawTitle = (b.offering as any)?.title
      const title = typeof rawTitle === 'string' ? rawTitle.toLowerCase() : ''
      const rawSub = (b.offering as any)?.subcategory?.name
      const subName = typeof rawSub === 'string' ? rawSub.toLowerCase() : ''
      const matchOffering = title.includes(q) || subName.includes(q)
      return matchId || matchStudent || matchInstructor || matchOffering
    })
  }, [bookings, searchQuery])

  // Aggregate stats
  const totalCount = meta?.total ?? bookings.length
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length
  const pendingCount = bookings.filter((b) => b.status === 'PAYMENT_PENDING').length
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Booking Monitoring</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Monitor and audit all student bookings and instructor scheduled sessions across the platform.
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

      {/* ── Metric Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4 border-stone-200/80">
          <p className="text-xs text-stone-500 font-medium">Total Bookings</p>
          <p className="text-2xl font-bold text-stone-800 mt-1">{totalCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} /> Confirmed
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{confirmedCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Clock size={13} /> Pending Hold
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <CalendarDays size={13} /> Completed
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{completedCount}</p>
        </Card>

        <Card className="p-4 border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <XCircle size={13} /> Cancelled / Exp
          </div>
          <p className="text-2xl font-bold text-red-700 mt-1">{cancelledCount}</p>
        </Card>
      </div>

      {/* ── Search & Filters Bar ── */}
      <Card className="p-4 border-stone-200/80">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Booking ID, student, instructor, or offering..."
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

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={selectedStatus || ''}
              onChange={(e) => {
                setSelectedStatus((e.target.value as BookingControllerListAdminStatusEnum) || undefined)
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

      {/* ── Bookings Table ── */}
      <Card className="overflow-hidden border-stone-200/80 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-8 w-8 border-3 border-kala-amber border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-stone-500">Loading bookings data...</p>
          </div>
        ) : isError ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle size={20} />
            </div>
            <p className="text-stone-800 font-semibold">Failed to load bookings</p>
            <p className="text-stone-500 text-xs">An error occurred while communicating with the server.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
              <CalendarDays size={24} />
            </div>
            <p className="text-stone-700 font-semibold">No bookings found</p>
            <p className="text-stone-400 text-xs max-w-sm mx-auto">
              {searchQuery || selectedStatus
                ? 'Try adjusting your search query or status filter.'
                : 'No bookings have been made on the platform yet.'}
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
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-5 py-3.5">Session Schedule</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Booking ID */}
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        className="font-mono text-xs font-semibold text-kala-terracotta hover:underline"
                        title={b.id}
                      >
                        {b.id.slice(0, 8)}...{b.id.slice(-4)}
                      </Link>
                      <span className="block text-[10px] text-stone-400 mt-0.5">
                        {formatDate(b.createdAt)}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={b.student?.name || 'Student'}
                          src={typeof b.student?.imageUrl === 'string' ? b.student.imageUrl : undefined}
                          size="sm"
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-800 text-xs truncate max-w-[140px]">
                            {b.student?.name || 'Student'}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate max-w-[140px]">
                            {b.student?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Instructor */}
                    <td className="px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 text-xs truncate max-w-[140px]">
                          {b.instructor?.name || 'Instructor'}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate max-w-[140px]">
                          {b.offering?.title || (b.offering as any)?.subcategory?.name || 'Session'}
                        </p>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-3.5">
                      <div className="text-xs">
                        <p className="font-medium text-stone-700">
                          {formatDate(b.slot.startTime)}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {formatTime(b.slot.startTime)} – {formatTime(b.slot.endTime)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                          getBookingStatusColor(b.status),
                        )}
                      >
                        {getBookingStatusLabel(b.status)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right font-bold text-stone-800 text-xs">
                      {formatPrice(b.amount)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/admin/bookings/${b.id}`}>
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
