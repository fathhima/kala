import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useInstructorBookingsQuery } from '@/features/booking/hooks'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import {
  cn,
  formatDate,
  formatTime,
  formatPrice,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/lib/utils'
import type { BookingDto } from '@/api'

const tabFilters = [
  { label: 'All', statuses: [] as string[] },
  { label: 'Upcoming', statuses: ['CONFIRMED', 'PAYMENT_PENDING'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
  { label: 'Cancelled & Expired', statuses: ['CANCELLED', 'EXPIRED'] },
]

export function MySessions() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, refetch, isFetching } = useInstructorBookingsQuery({
    page,
    limit,
  })

  const allBookings: BookingDto[] = data?.items ?? []
  const meta = data?.meta

  const filteredBookings = useMemo(() => {
    const filter = tabFilters[activeTab]
    if (!filter || filter.statuses.length === 0) return allBookings
    return allBookings.filter((b) => filter.statuses.includes(b.status))
  }, [allBookings, activeTab])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">My Sessions</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            View and manage all booked sessions with your students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-stone-500 hover:text-stone-800"
            title="Refresh sessions"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </Button>

          <Link to="/instructor/slots">
            <Button size="sm" variant="outline" className="gap-1.5">
              <CalendarDays size={15} /> Manage Slots
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 bg-stone-100 p-1.5 rounded-2xl w-fit overflow-x-auto max-w-full">
        {tabFilters.map((tab, i) => {
          const count =
            tab.statuses.length === 0
              ? allBookings.length
              : allBookings.filter((b) => tab.statuses.includes(b.status)).length

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === i
                  ? 'bg-white text-kala-brown shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === i
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-stone-200/70 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-stone-200/60 rounded-2xl p-5 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-200 rounded-full" />
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-stone-200 rounded" />
                  <div className="w-24 h-3 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="w-20 h-6 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center space-y-3 border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={20} />
          </div>
          <p className="text-stone-800 font-semibold">Failed to load instructor sessions</p>
          <p className="text-stone-500 text-sm">
            An error occurred while fetching your sessions list.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-dashed border-stone-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
            <Calendar size={24} />
          </div>
          <h3 className="text-base font-semibold text-stone-800">
            No {tabFilters[activeTab].label.toLowerCase()} sessions
          </h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            {activeTab === 1
              ? 'You do not have any upcoming booked sessions. Make sure you have open slots published so learners can discover and book your classes.'
              : 'Sessions booked by learners will appear here.'}
          </p>
          <div className="pt-2">
            <Link to="/instructor/slots">
              <Button size="sm" className="gap-1.5">
                <CalendarDays size={15} /> Publish Available Slots
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const subcategoryName = (booking.offering as any)?.subcategory?.name || ''
            const offeringTitle =
              booking.offering.title || subcategoryName || 'One-on-One Session'
            const isConfirmed = booking.status === 'CONFIRMED'
            const isCompleted = booking.status === 'COMPLETED'
            const isCancelled = booking.status === 'CANCELLED'

            return (
              <Card
                key={booking.id}
                hover
                onClick={() => navigate(`/instructor/sessions/${booking.id}`)}
                className="p-5 transition-all cursor-pointer border-stone-200/80 hover:border-kala-amber/40 hover:shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Student info & session details */}
                  <div className="flex items-start gap-4 min-w-0">
                    <Avatar
                      name={booking.student?.name || 'Student'}
                      src={
                        typeof booking.student?.imageUrl === 'string'
                          ? booking.student.imageUrl
                          : undefined
                      }
                      size="md"
                      className="ring-1 ring-stone-200 shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-stone-900 text-base truncate">
                          {booking.student?.name || 'Learner'}
                        </p>
                        {subcategoryName && (
                          <Badge variant="default" className="text-[10px] py-0 px-2">
                            {subcategoryName}
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 font-medium truncate">
                        {offeringTitle}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-500 pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-kala-amber" />
                          {formatDate(booking.slot.startTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-kala-amber" />
                          {formatTime(booking.slot.startTime)} – {formatTime(booking.slot.endTime)}
                        </span>
                        {booking.student?.email && (
                          <span className="hidden md:inline-flex items-center gap-1 text-stone-400">
                            <Mail size={12} />
                            {booking.student.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status, earnings & action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                          getBookingStatusColor(booking.status),
                        )}
                      >
                        {getBookingStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-bold text-kala-terracotta">
                        {formatPrice(booking.amount)}
                      </p>
                      <span className="text-[10px] text-stone-400 font-medium">Session Fee</span>
                    </div>

                    <div
                      className="flex items-center gap-2 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => navigate(`/instructor/sessions/${booking.id}`)}
                      >
                        Session Details <ChevronRight size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
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
