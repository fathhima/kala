import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Star, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { useBookingStore } from '../../stores/bookingStore'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { SlotCard } from '../../components/shared/SlotCard'
import { formatPrice } from '../../lib/utils'

export function InstructorDashboard() {
  const { profile, slots } = useInstructorStore()
  const { bookings } = useBookingStore()

  const myBookings = bookings.filter((b) => b.instructorId === profile?.id)
  const upcoming = myBookings.filter((b) => b.status === 'CONFIRMED')
  const completed = myBookings.filter((b) => b.status === 'COMPLETED')
  const earnings = completed.reduce((sum, b) => sum + (b.payment?.amount || 0), 0)
  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar name={profile?.user.name || ''} src={profile?.user.avatarUrl} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">{profile?.user.name}</h1>
          <p className="text-stone-500 text-sm">{profile?.skills.map((s) => s.name).join(' · ')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: myBookings.length, icon: <Calendar size={20} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Earnings', value: formatPrice(earnings), icon: <DollarSign size={20} />, color: 'text-green-600 bg-green-50' },
          { label: 'Average Rating', value: profile?.avgRating.toFixed(1) || '—', icon: <Star size={20} />, color: 'text-kala-amber bg-amber-50' },
          { label: 'Upcoming', value: upcoming.length, icon: <TrendingUp size={20} />, color: 'text-purple-600 bg-purple-50' },
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
            <Link to="/instructor/sessions"><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800 text-sm">{b.studentName}</p>
                      <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {b.slot.title}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-stone-300" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Calendar size={28} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500">No upcoming sessions</p>
            </Card>
          )}
        </div>

        {/* Available Slots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-kala-brown">Your Slots</h2>
            <Link to="/instructor/slots"><Button variant="ghost" size="sm">Manage</Button></Link>
          </div>
          {availableSlots.length > 0 ? (
            <div className="space-y-3">
              {availableSlots.slice(0, 3).map((slot) => <SlotCard key={slot.id} slot={slot} />)}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Calendar size={28} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-500 mb-3">No available slots</p>
              <Link to="/instructor/slots"><Button size="sm">Add Slots</Button></Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
