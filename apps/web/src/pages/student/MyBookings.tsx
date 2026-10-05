import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, RefreshCw } from 'lucide-react'
import { useStudentBookingsQuery } from '@/features/booking/hooks'
import { BookingCard } from '@/components/shared/BookingCard'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import type { BookingDto } from '@/api'

const tabFilters = [
  { label: 'All', statuses: [] as string[] },
  { label: 'Upcoming', statuses: ['CONFIRMED', 'PAYMENT_PENDING', 'INITIATED'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
  { label: 'Cancelled & Expired', statuses: ['CANCELLED', 'EXPIRED'] },
]

export function MyBookings() {
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, refetch, isFetching } = useStudentBookingsQuery({
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">My Bookings</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Manage your one-on-one sessions and reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-stone-500 hover:text-stone-800"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </Button>

          <Link to="/instructors">
            <Button size="sm" className="gap-1.5">
              <Plus size={15} /> Book a Session
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

      {/* ── List Content ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-stone-200/60 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-stone-100 rounded w-1/3" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
          <p className="text-stone-700 font-semibold">Failed to load bookings</p>
          <p className="text-stone-500 text-sm">Please check your connection and try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {meta && meta.totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-stone-200 mt-4 overflow-hidden">
              <Pagination
                page={page}
                limit={limit}
                total={meta.total}
                hasPrevPage={page > 1}
                hasNextPage={page < meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/80 p-8">
          <Calendar size={44} className="text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base mb-1">
            No {tabFilters[activeTab].label.toLowerCase()} bookings
          </h3>
          <p className="text-stone-500 text-sm mb-5 max-w-sm mx-auto">
            {activeTab === 0
              ? "You haven't booked any sessions yet. Connect with our skilled instructors to learn something new!"
              : `You have no sessions in the ${tabFilters[activeTab].label.toLowerCase()} category.`}
          </p>
          <Link to="/instructors">
            <Button>Explore Instructors</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
