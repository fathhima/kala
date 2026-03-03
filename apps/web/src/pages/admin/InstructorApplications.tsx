import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, MapPin } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatPrice } from '../../lib/utils'
import { useAdminStore } from '../../stores/adminStore'
import { cn } from '../../lib/utils'

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED'

export function InstructorApplications() {
  const {
    applications,
    approvedApplicationIds,
    rejectedApplicationIds,
    approveApplication,
    rejectApplication,
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState<Tab>('PENDING')

  const pendingApplications = applications.filter(
    (app) => !approvedApplicationIds.includes(app.id) && !rejectedApplicationIds.includes(app.id),
  )
  const approvedApplications = applications.filter((app) => approvedApplicationIds.includes(app.id))
  const rejectedApplications = applications.filter((app) => rejectedApplicationIds.includes(app.id))

  const tabItems: { key: Tab; label: string; count: number; dot: string }[] = [
    { key: 'PENDING',  label: 'Pending',  count: pendingApplications.length,  dot: 'bg-amber-400' },
    { key: 'APPROVED', label: 'Approved', count: approvedApplications.length, dot: 'bg-green-500' },
    { key: 'REJECTED', label: 'Rejected', count: rejectedApplications.length, dot: 'bg-red-500'   },
  ]

  const visible =
    activeTab === 'PENDING'  ? pendingApplications :
    activeTab === 'APPROVED' ? approvedApplications :
                               rejectedApplications

  const getStatus = (applicationId: string): Tab => {
    if (approvedApplicationIds.includes(applicationId)) return 'APPROVED'
    if (rejectedApplicationIds.includes(applicationId)) return 'REJECTED'
    return 'PENDING'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Instructor Applications</h1>
        <p className="text-stone-500 text-sm mt-1">
          {pendingApplications.length} pending · {approvedApplications.length} approved · {rejectedApplications.length} rejected
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-stone-200">
        {tabItems.map(({ key, label, count, dot }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === key
                ? 'border-kala-brown text-kala-brown'
                : 'border-transparent text-stone-500 hover:text-stone-700',
            )}
          >
            <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
            {label}
            <span className={cn(
              'ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
              activeTab === key ? 'bg-kala-brown text-white' : 'bg-stone-100 text-stone-600',
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {visible.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-stone-500">No {activeTab.toLowerCase()} applications.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((app) => (
            (() => {
              const status = getStatus(app.id)
              const isApproved = status === 'APPROVED'
              const isRejected = status === 'REJECTED'

              return (
            <Card key={app.id} className="p-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <Avatar name={app.user.name} src={app.user.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-stone-800">{app.user.name}</h3>
                    <p className="text-sm text-stone-500">{app.user.email}</p>
                    {app.location && (
                      <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                        <MapPin size={11} /> {app.location}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.skills.map((skill) => <Badge key={skill.id}>{skill.name}</Badge>)}
                    </div>
                    <p className="text-sm font-semibold text-kala-terracotta mt-2">{formatPrice(app.pricing)}/session</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-stone-100">
                <Link to={`/admin/applications/${app.id}`}>
                  <Button variant="outline" className="gap-2">Details</Button>
                </Link>
                <Button
                  onClick={() => approveApplication(app.id)}
                  disabled={isApproved}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={15} /> {isApproved ? 'Approved' : 'Approve'}
                </Button>
                <Button
                  onClick={() => rejectApplication(app.id)}
                  disabled={isRejected}
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle size={15} /> {isRejected ? 'Rejected' : 'Reject'}
                </Button>
              </div>
            </Card>
              )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
