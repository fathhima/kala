import { Link } from 'react-router-dom'
import { CheckCircle2, Plus, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useOnboardingWorkspaceQuery } from '@/features/instructor/hooks'

export function InstructorSkills() {
  const { data: workspace, isLoading, isError } = useOnboardingWorkspaceQuery()

  if (isLoading) return <p className="text-sm text-stone-500">Loading skills…</p>
  if (isError) return <p className="text-sm text-red-500">Could not load skills.</p>

  const approvedOfferings = (workspace?.offerings ?? []).filter(
    (offering) => offering.status === 'APPROVED',
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">My Skills</h1>
          <p className="mt-1 text-sm text-stone-500">
            Skills become active after their complete offering is approved.
          </p>
        </div>

        <Link to="/instructor/offerings">
          <Button>
            <Plus size={16} />
            Request another skill
          </Button>
        </Link>
      </div>

      {approvedOfferings.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="mx-auto mb-3 text-stone-300" size={36} />
          <h2 className="font-semibold text-stone-800">No approved skills yet</h2>
          <p className="mt-1 text-sm text-stone-500">
            Create an offering with its category, details, rate, and portfolio media.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {approvedOfferings.map((offering) => (
            <Card key={offering.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-stone-800">{offering.title}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {offering.subcategory.category.name} · {offering.subcategory.name}
                  </p>
                </div>
                <Badge variant="success">
                  <CheckCircle2 size={13} />
                  Approved
                </Badge>
              </div>

              <p className="mt-3 text-sm text-stone-600">{offering.description}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-400">Rate</dt>
                  <dd className="font-medium text-stone-800">
                    ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} / hour
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-400">Experience</dt>
                  <dd className="font-medium text-stone-800">
                    {offering.experienceYears ?? 0} years
                  </dd>
                </div>
              </dl>

              <Link to="/instructor/portfolio" className="mt-5 inline-block">
                <Button size="sm" variant="outline">Manage portfolio</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}