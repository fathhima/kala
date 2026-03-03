import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, MessageSquare, ChevronRight } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { useInstructorStore } from '../../stores/instructorStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { cn, formatDateTime, formatPrice, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'
import type { BookingStatus } from '../../types'

const tabs: { label: string; statuses: BookingStatus[] }[] = [
  { label: 'Upcoming', statuses: ['CONFIRMED', 'INITIATED'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
  { label: 'Cancelled', statuses: ['CANCELLED'] },
]

export function MySessions() {
  const { bookings } = useBookingStore()
  const { profile } = useInstructorStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const myBookings = bookings.filter((b) => b.instructorId === profile?.id)
  const filtered = myBookings.filter((b) => tabs[activeTab].statuses.includes(b.status))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-kala-brown">My Sessions</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {tabs.map((tab, i) => {
          const count = myBookings.filter((b) => tabs[i].statuses.includes(b.status)).length
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === i ? 'bg-white text-kala-brown shadow-sm' : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                activeTab === i ? 'bg-kala-amber/10 text-kala-terracotta' : 'bg-stone-200 text-stone-500'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              onClick={() => navigate(`/instructor/sessions/${booking.id}`)}
              className="flex items-center gap-4 bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm cursor-pointer hover:border-kala-amber/40 hover:shadow-md transition-all group"
            >
              <Avatar name={booking.studentName} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-stone-800 truncate">{booking.studentName}</p>
                  <span className={cn(
                    'flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
                    getBookingStatusColor(booking.status)
                  )}>
                    {getBookingStatusLabel(booking.status)}
                  </span>
                </div>
                <p className="text-sm text-stone-500">{formatDateTime(booking.slot.startTime)}</p>
                {booking.slot.title && (
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{booking.slot.title}</p>
                )}
              </div>

              {booking.payment && (
                <p className="flex-shrink-0 text-sm font-semibold text-kala-terracotta hidden sm:block">
                  {formatPrice(booking.payment.amount)}
                </p>
              )}

              {/* Quick inline action buttons (stop propagation so clicking doesn't open detail) */}
              <div
                className="flex items-center gap-2 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {booking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      size="sm"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => navigate(`/session/${booking.id}`)}
                    >
                      <Video size={13} /> Join
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 hidden sm:flex"
                      onClick={() => navigate(`/instructor/sessions/${booking.id}/chat`)}
                    >
                      <MessageSquare size={13} /> Chat
                    </Button>
                  </>
                )}
              </div>

              <ChevronRight size={16} className="text-stone-300 group-hover:text-kala-amber transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-stone-500">No {tabs[activeTab].label.toLowerCase()} sessions.</p>
        </div>
      )}
    </div>
  )
}
