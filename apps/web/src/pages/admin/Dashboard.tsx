import { Users, Palette, CalendarDays, TrendingUp, CreditCard, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { formatPrice } from '../../lib/utils'
import { useAdminBookingsQuery } from '@/features/booking/hooks'
import { useAdminPaymentsQuery } from '@/features/payment/hooks'

export function AdminDashboard() {
  const { data: bookingsData } = useAdminBookingsQuery({ page: 1, limit: 10 })
  const { data: paymentsData } = useAdminPaymentsQuery({ page: 1, limit: 10 })

  const totalBookings = bookingsData?.meta?.total ?? bookingsData?.items?.length ?? 0
  const payments = paymentsData?.items ?? []
  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCEEDED' || p.status === 'REFUNDED')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Admin Overview</h1>
        <p className="text-stone-500 text-sm mt-1">Platform operational summary and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <Card hover className="p-5 transition-all">
            <div className="inline-flex p-2.5 rounded-xl mb-4 text-blue-600 bg-blue-50">
              <Users size={22} />
            </div>
            <div className="text-2xl font-bold text-stone-800 mb-0.5">Active</div>
            <div className="text-sm text-stone-500">User Management</div>
          </Card>
        </Link>

        <Link to="/admin/applications">
          <Card hover className="p-5 transition-all">
            <div className="inline-flex p-2.5 rounded-xl mb-4 text-kala-amber bg-amber-50">
              <Palette size={22} />
            </div>
            <div className="text-2xl font-bold text-stone-800 mb-0.5">Applications</div>
            <div className="text-sm text-stone-500">Instructor Review</div>
          </Card>
        </Link>

        <Link to="/admin/bookings">
          <Card hover className="p-5 transition-all">
            <div className="inline-flex p-2.5 rounded-xl mb-4 text-green-600 bg-green-50">
              <CalendarDays size={22} />
            </div>
            <div className="text-2xl font-bold text-stone-800 mb-0.5">{totalBookings}</div>
            <div className="text-sm text-stone-500">Total Bookings</div>
          </Card>
        </Link>

        <Link to="/admin/payments">
          <Card hover className="p-5 transition-all">
            <div className="inline-flex p-2.5 rounded-xl mb-4 text-purple-600 bg-purple-50">
              <TrendingUp size={22} />
            </div>
            <div className="text-2xl font-bold text-stone-800 mb-0.5">{formatPrice(totalRevenue)}</div>
            <div className="text-sm text-stone-500">Gross Volume</div>
          </Card>
        </Link>
      </div>

      {/* Quick operational links */}
      <div>
        <h2 className="text-base font-bold text-stone-800 mb-3">Management Consoles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/bookings">
            <Card hover className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <CalendarDays size={16} className="text-kala-amber" /> Booking Monitoring
                  </h3>
                  <p className="text-xs text-stone-500">
                    Audit sessions, monitor reservation statuses, and manage holds.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/payments">
            <Card hover className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-purple-600" /> Payments Overview
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track Razorpay settlements, review transactions, and issue refunds.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/applications">
            <Card hover className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <Palette size={16} className="text-emerald-600" /> Applications
                  </h3>
                  <p className="text-xs text-stone-500">
                    Review and approve incoming instructor profiles and offerings.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>

          <Link to="/admin/skills">
            <Card hover className="p-5 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1 flex items-center gap-1.5">
                    <Users size={16} className="text-blue-600" /> Skills Catalog
                  </h3>
                  <p className="text-xs text-stone-500">
                    Manage categories and creative subcategories for instructor offerings.
                  </p>
                </div>
                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
