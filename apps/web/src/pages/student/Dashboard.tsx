import { BookOpen, CalendarDays, Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/features/auth/store'

export function StudentDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Discover classes, manage bookings, and track your learning.
          </p>
        </div>

        <Link to="/">
          <Button>
            <Search size={16} />
            Browse classes
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <CalendarDays className="mb-3 text-kala-amber" size={22} />
          <p className="text-2xl font-bold text-stone-800">0</p>
          <p className="text-sm text-stone-500">Upcoming bookings</p>
        </Card>

        <Card className="p-5">
          <BookOpen className="mb-3 text-blue-600" size={22} />
          <p className="text-2xl font-bold text-stone-800">0</p>
          <p className="text-sm text-stone-500">Completed sessions</p>
        </Card>

        <Card className="p-5">
          <Heart className="mb-3 text-red-500" size={22} />
          <p className="text-2xl font-bold text-stone-800">0</p>
          <p className="text-sm text-stone-500">Saved classes</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Student activity
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Your bookings, enrolled classes, saved instructors, and completed sessions will appear here.
        </p>
      </Card>
    </div>
  )
}