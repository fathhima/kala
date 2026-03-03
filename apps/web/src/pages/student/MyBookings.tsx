import { useState } from 'react'
import { useBookingStore } from '../../stores/bookingStore'
import { BookingCard } from '../../components/shared/BookingCard'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Calendar } from 'lucide-react'
import type { BookingStatus } from '../../types'

const tabs: { label: string; statuses: BookingStatus[] }[] = [
  { label: 'Upcoming', statuses: ['CONFIRMED', 'INITIATED', 'PAYMENT_PENDING'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
  { label: 'Cancelled', statuses: ['CANCELLED'] },
]

export function MyBookings() {
  const { bookings } = useBookingStore()
  const [activeTab, setActiveTab] = useState(0)

  const filtered = bookings.filter((b) => tabs[activeTab].statuses.includes(b.status))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-kala-brown">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i ? 'bg-white text-kala-brown shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === i ? 'bg-kala-amber/10 text-kala-terracotta' : 'bg-stone-200 text-stone-500'}`}>
              {bookings.filter((b) => tabs[i].statuses.includes(b.status)).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => <BookingCard key={booking.id} booking={booking} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">No {tabs[activeTab].label.toLowerCase()} bookings</p>
          {activeTab === 0 && (
            <Link to="/instructors"><Button>Book a Session</Button></Link>
          )}
        </div>
      )}
    </div>
  )
}
