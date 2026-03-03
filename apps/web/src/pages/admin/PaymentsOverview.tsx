import { Link } from 'react-router-dom'
import { mockBookings } from '../../lib/mock'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatDate, formatPrice } from '../../lib/utils'

const payments = mockBookings
  .filter((b) => b.payment)
  .map((b) => ({ ...b.payment!, student: b.studentName, instructor: b.instructor.user.name, date: b.slot.startTime }))

export function PaymentsOverview() {
  const total = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Payments Overview</h1>
        <p className="text-stone-500 text-sm mt-1">{payments.length} transactions shown</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(total), variant: 'success' },
          { label: 'Successful', value: payments.filter((p) => p.status === 'SUCCESS').length, variant: 'success' },
          { label: 'Pending', value: payments.filter((p) => p.status === 'PENDING').length, variant: 'warning' },
          { label: 'Failed/Refunded', value: payments.filter((p) => p.status === 'FAILED' || p.status === 'REFUNDED').length, variant: 'error' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
            <div className="text-sm text-stone-500 mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Transaction ID</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Student</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Instructor</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Provider</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-stone-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-5 py-3 font-mono text-xs text-stone-400">
                    <Link to={`/admin/payments/${payment.id}`} className="hover:underline text-kala-terracotta">
                      {payment.transactionId || payment.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-stone-700">{payment.student}</td>
                  <td className="px-5 py-3 text-stone-600">{payment.instructor}</td>
                  <td className="px-5 py-3">
                    {payment.provider && (
                      <Badge variant={payment.provider === 'STRIPE' ? 'info' : 'warning'}>{payment.provider}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 font-semibold text-stone-800">{formatPrice(payment.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={payment.status === 'SUCCESS' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'error'}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-stone-500">{formatDate(payment.date)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <Link to={`/admin/payments/${payment.id}`}>
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
