import { Users, Palette, CalendarDays, TrendingUp } from 'lucide-react'
import { mockAdminStats } from '../../lib/mock'
import { Card } from '../../components/ui/Card'
import { formatPrice } from '../../lib/utils'

export function AdminDashboard() {
  const stats = mockAdminStats

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Admin Overview</h1>
        <p className="text-stone-500 text-sm mt-1">Platform summary and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: <Users size={22} />, color: 'text-blue-600 bg-blue-50', change: '+12% this month' },
          { label: 'Instructors', value: stats.totalInstructors.toLocaleString(), icon: <Palette size={22} />, color: 'text-kala-amber bg-amber-50', change: '+5 pending approval' },
          { label: 'Total Bookings', value: stats.totalBookings.toLocaleString(), icon: <CalendarDays size={22} />, color: 'text-green-600 bg-green-50', change: '+8% this month' },
          { label: 'Revenue', value: formatPrice(stats.revenue), icon: <TrendingUp size={22} />, color: 'text-purple-600 bg-purple-50', change: 'All time' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-4 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-stone-800 mb-0.5">{stat.value}</div>
            <div className="text-sm text-stone-500">{stat.label}</div>
            <div className="text-xs text-stone-400 mt-1">{stat.change}</div>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending Applications', desc: '2 instructor applications awaiting review', href: '/admin/applications', urgent: true },
          { label: 'Manage Skills', desc: '6 skills in catalog', href: '/admin/skills', urgent: false },
          { label: 'User Management', desc: '1,240 registered users', href: '/admin/users', urgent: false },
        ].map((item) => (
          <a key={item.label} href={item.href}>
            <Card hover className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1">{item.label}</h3>
                  <p className="text-xs text-stone-500">{item.desc}</p>
                </div>
                {item.urgent && <span className="h-2 w-2 bg-kala-rose rounded-full mt-1" />}
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  )
}
