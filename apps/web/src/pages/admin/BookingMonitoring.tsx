import { Link } from 'react-router-dom'
import { mockBookings } from '../../lib/mock'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { cn, formatDate, getBookingStatusColor, getBookingStatusLabel } from '../../lib/utils'

export function BookingMonitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Booking Monitoring</h1>
        <p className="text-stone-500 text-sm mt-1">{mockBookings.length} bookings (demo data)</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Booking ID</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Student</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Instructor</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Amount</th>
                <th className="text-right px-5 py-3 font-semibold text-stone-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3 text-stone-400 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                  <td className="px-5 py-3 font-medium text-stone-800">{booking.studentName}</td>
                  <td className="px-5 py-3 text-stone-600">{booking.instructor.user.name}</td>
                  <td className="px-5 py-3 text-stone-500">{formatDate(booking.slot.startTime)}</td>
                  <td className="px-5 py-3">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getBookingStatusColor(booking.status))}>
                      {getBookingStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    {booking.payment ? `₹${booking.payment.amount}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Link to={`/admin/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
