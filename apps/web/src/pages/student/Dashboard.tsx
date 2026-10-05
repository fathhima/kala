import { BookOpen, CalendarDays, ChevronRight, Heart, Search, CalendarCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/features/auth/store'
import { useStudentBookingsQuery } from '@/features/booking/hooks'
import { BookingCard } from '@/components/shared/BookingCard'

export function StudentDashboard() {
  const user = useAuthStore((state) => state.user)
  const { data, isLoading } = useStudentBookingsQuery({ page: 1, limit: 10 })

  const bookings = data?.items ?? []
  const upcomingCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PAYMENT_PENDING',
  ).length
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Discover classes, manage bookings, and track your creative learning.
          </p>
        </div>

        <Link to="/instructors">
          <Button className="gap-2">
            <Search size={16} />
            Browse Instructors
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/bookings">
          <Card hover className="p-5 transition-all">
            <CalendarDays className="mb-3 text-kala-amber" size={22} />
            <p className="text-2xl font-bold text-stone-800">{upcomingCount}</p>
            <p className="text-sm text-stone-500 font-medium">Upcoming bookings</p>
          </Card>
        </Link>

        <Link to="/dashboard/bookings">
          <Card hover className="p-5 transition-all">
            <BookOpen className="mb-3 text-blue-600" size={22} />
            <p className="text-2xl font-bold text-stone-800">{completedCount}</p>
            <p className="text-sm text-stone-500 font-medium">Completed sessions</p>
          </Card>
        </Link>

        <Card className="p-5">
          <Heart className="mb-3 text-red-500" size={22} />
          <p className="text-2xl font-bold text-stone-800">0</p>
          <p className="text-sm text-stone-500 font-medium">Saved classes</p>
        </Card>
      </div>

      {/* ── Recent Bookings Section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-kala-brown">Recent Bookings</h2>
          <Link
            to="/dashboard/bookings"
            className="text-xs font-semibold text-kala-terracotta hover:underline flex items-center gap-1"
          >
            View all bookings <ChevronRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-stone-100 text-center text-sm text-stone-400">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto text-stone-400">
              <CalendarCheck size={22} />
            </div>
            <p className="text-stone-800 font-semibold">No bookings yet</p>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              Explore instructors and book a personalized 1-on-1 session to start your learning journey.
            </p>
            <div className="pt-2">
              <Link to="/instructors">
                <Button size="sm">Find an Instructor</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}