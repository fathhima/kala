import { ArrowLeftRight, CheckCircle, Clock3, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/features/auth/store'
import { useOnboardingWorkspaceQuery } from '@/features/instructor/hooks'

const statusVariant = (
  status: string,
): 'default' | 'success' | 'warning' | 'error' => {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'error'
  if (status === 'PENDING' || status === 'CHANGES_REQUESTED') return 'warning'
  return 'default'
}

export function InstructorDashboard() {
  const user = useAuthStore((state) => state.user)
  const { data: workspace, isLoading, isError } = useOnboardingWorkspaceQuery()

  const offerings = workspace?.offerings ?? []
  const approvedOfferings = offerings.filter(
    (offering) => offering.status === 'APPROVED',
  )
  const pendingOfferings = offerings.filter(
    (offering) => offering.status === 'PENDING',
  )
  const returnedOfferings = offerings.filter(
    (offering) =>
      offering.status === 'REJECTED' ||
      offering.status === 'CHANGES_REQUESTED',
  )

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading instructor dashboard…</div>
  }

  if (isError) {
    return (
      <div className="text-sm text-red-500">
        Could not load instructor workspace.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Welcome, {user?.name ?? 'Instructor'}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <CheckCircle className="mb-3 text-green-600" size={22} />
          <p className="text-2xl font-bold text-stone-800">
            {approvedOfferings.length}
          </p>
          <p className="text-sm text-stone-500">Approved offerings</p>
        </Card>

        <Card className="p-5">
          <Clock3 className="mb-3 text-amber-600" size={22} />
          <p className="text-2xl font-bold text-stone-800">
            {pendingOfferings.length}
          </p>
          <p className="text-sm text-stone-500">Offerings under review</p>
        </Card>

        <Card className="p-5">
          <Sparkles className="mb-3 text-red-500" size={22} />
          <p className="text-2xl font-bold text-stone-800">
            {returnedOfferings.length}
          </p>
          <p className="text-sm text-stone-500">Need your attention</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">
              Add another teaching skill
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Create a new offering or improve one that was returned by an admin.
            </p>
          </div>

          <Link to="/instructor/offerings">
            <Button>
              <Plus size={16} /> Manage offerings
            </Button>
          </Link>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-stone-800">
          Approved offerings
        </h2>

        {approvedOfferings.length === 0 ? (
          <Card className="p-6 text-sm text-stone-500">
            No approved offerings yet.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {approvedOfferings.map((offering) => (
              <Card key={offering.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-stone-800">
                      {offering.title}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {offering.subcategory.category.name} ·{' '}
                      {offering.subcategory.name}
                    </p>
                  </div>

                  <Badge variant={statusVariant(offering.status)}>
                    {offering.status}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-3 text-sm text-stone-600">
                  {offering.description}
                </p>

                <p className="mt-4 font-semibold text-kala-terracotta">
                  ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} / hour
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Teaching operations
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Slots, bookings, payments, and reviews belong here after their backend APIs
          are connected.
        </p>
      </Card>
    </div>
  )
}