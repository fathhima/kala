import { Link } from 'react-router-dom'
import { Calendar, Clock, Star, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useBookingStore } from '../../stores/bookingStore'
import { mockInstructors } from '../../lib/mock'
import { BookingCard } from '../../components/shared/BookingCard'
import { InstructorCard } from '../../components/shared/InstructorCard'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatDateTime } from '../../lib/utils'

export function StudentDashboard() {
  const { user } = useAuthStore()
  const { bookings } = useBookingStore()

  const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'INITIATED')
  const recent = bookings.slice(0, 3)
  const recommended = mockInstructors.filter((i) => i.isApproved).slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-stone-500 text-sm mt-1">Here's what's happening with your creative journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Sessions', value: upcoming.length, icon: <Calendar size={20} />, color: 'text-green-600 bg-green-50' },
          { label: 'Total Bookings', value: bookings.length, icon: <Clock size={20} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', value: bookings.filter((b) => b.status === 'COMPLETED').length, icon: <Star size={20} />, color: 'text-kala-amber bg-amber-50' },
          { label: 'Cancelled', value: bookings.filter((b) => b.status === 'CANCELLED').length, icon: <ArrowRight size={20} />, color: 'text-red-500 bg-red-50' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kala-brown">Upcoming Sessions</h2>
            <Link to="/dashboard/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <Card key={booking.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{booking.instructor.user.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{booking.instructor.skills[0]?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-stone-600">{formatDateTime(booking.slot.startTime)}</p>
                      {booking.status === 'CONFIRMED' && (
                        <Link to={`/dashboard/bookings/${booking.id}`}>
                          <Button size="sm" className="mt-2">Join Session</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar size={32} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500 mb-3">No upcoming sessions</p>
              <Link to="/instructors"><Button size="sm">Browse Instructors</Button></Link>
            </Card>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kala-brown">Recent Bookings</h2>
            <Link to="/dashboard/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <div className="space-y-3">
            {recent.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Instructors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-kala-brown">Instructors</h2>
          <Link to="/instructors"><Button variant="ghost" size="sm">View All</Button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {recommended.map((inst) => (
            <InstructorCard key={inst.id} instructor={inst} />
          ))}
        </div>
      </div>
    </div>
  )
}
