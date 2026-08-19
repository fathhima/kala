import { useState } from 'react'
import { ArrowLeft, CheckCircle, MapPin, XCircle } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ReviewOfferingDtoDecisionEnum,
  type InstructorOfferingDto,
} from '@/api'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  useAdminOfferingMediaUrlQuery,
  useInstructorApplicationQuery,
  useReviewInstructorOfferingMutation,
} from '@/features/admin/instructor-applications/hooks'
import { getApiErrorResponse } from '@/lib/api-error'
import { Textarea } from '@/components/ui/Input'

const statusVariant = (
  status: string,
): 'default' | 'success' | 'warning' | 'error' => {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'error'
  if (status === 'PENDING' || status === 'CHANGES_REQUESTED') return 'warning'
  return 'default'
}

function AdminMediaPreview({
  applicationId,
  offeringId,
  mediaId,
  type,
}: {
  applicationId: string
  offeringId: string
  mediaId: string
  type: 'IMAGE' | 'VIDEO'
}) {
  const { data: viewUrl, isLoading } = useAdminOfferingMediaUrlQuery(
    applicationId,
    offeringId,
    mediaId,
  )

  if (isLoading) {
    return <div className="aspect-square rounded-xl bg-stone-100" />
  }

  if (!viewUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
        Media unavailable
      </div>
    )
  }

  return type === 'VIDEO' ? (
    <video controls src={viewUrl} className="aspect-square w-full rounded-xl object-cover" />
  ) : (
    <img
      src={viewUrl}
      alt="Applicant portfolio"
      className="aspect-square w-full rounded-xl object-cover"
    />
  )
}

function OfferingReview({
  applicationId,
  offering,
}: {
  applicationId: string
  offering: InstructorOfferingDto
}) {
  const reviewMutation = useReviewInstructorOfferingMutation()
  const [decision, setDecision] = useState<
    'REJECTED' | 'CHANGES_REQUESTED' | null
  >(null)
  const [reviewNote, setReviewNote] = useState('')
  const [error, setError] = useState('')

  const submitReview = async (
    reviewDecision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
  ) => {
    setError('')

    if (
      (reviewDecision === 'REJECTED' ||
        reviewDecision === 'CHANGES_REQUESTED') &&
      !reviewNote.trim()
    ) {
      setError('A reason is required for this decision.')
      return
    }

    try {
      await reviewMutation.mutateAsync({
        applicationId,
        offeringId: offering.id,
        decision: reviewDecision,
        reviewNote: reviewNote.trim() || undefined,
      })

      setDecision(null)
      setReviewNote('')
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not save review.'))
    }
  }

  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-stone-800">
              {offering.title}
            </h2>
            <Badge variant={statusVariant(offering.status)}>
              {offering.status}
            </Badge>
          </div>

          <p className="mt-1 text-sm text-stone-500">
            {offering.subcategory.category.name} · {offering.subcategory.name}
          </p>
        </div>

        <p className="font-semibold text-kala-terracotta">
          ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} / hour
        </p>
      </div>

      <p className="text-sm text-stone-700">{offering.description}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {offering.media.map((media) => (
          <AdminMediaPreview
            key={media.id}
            applicationId={applicationId}
            offeringId={offering.id}
            mediaId={media.id}
            type={media.type}
          />
        ))}
      </div>

      {offering.reviewNote && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <span className="font-semibold">Review note:</span> {offering.reviewNote}
        </div>
      )}

      {offering.status === 'PENDING' && (
        <div className="border-t border-stone-100 pt-4">
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          {!decision ? (
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                loading={reviewMutation.isPending}
                onClick={() => void submitReview('APPROVED')}
              >
                <CheckCircle size={15} /> Approve
              </Button>

              <Button
                variant="destructive"
                onClick={() => setDecision('REJECTED')}
              >
                <XCircle size={15} /> Reject
              </Button>

              <Button
                variant="outline"
                onClick={() => setDecision('CHANGES_REQUESTED')}
              >
                Request changes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                label="Reason"
                rows={4}
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Tell the applicant what must be improved."
              />

              <div className="flex gap-2">
                <Button
                  variant={decision === 'REJECTED' ? 'destructive' : 'primary'}
                  loading={reviewMutation.isPending}
                  onClick={() => void submitReview(decision)}
                >
                  Confirm
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setDecision(null)
                    setReviewNote('')
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to="/admin/applications" replace />
  }

  const { data: application, isLoading, isError, error } =
    useInstructorApplicationQuery(id)

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading application…</div>
  }

  if (isError || !application) {
    return (
      <div className="space-y-4">
        <Link to="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-stone-500">
          <ArrowLeft size={15} /> Back to applications
        </Link>
        <p className="text-sm text-red-500">
          {getApiErrorResponse(error, 'Could not load application.')}
        </p>
      </div>
    )
  }

  const applicant = application.profile?.user

  return (
    <div className="space-y-6">
      <Link
        to="/admin/applications"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft size={15} /> Back to applications
      </Link>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            name={applicant?.name ?? 'Applicant'}
            src={applicant?.imageUrl ?? undefined}
            size="lg"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-kala-brown">
                {applicant?.name}
              </h1>
              <Badge variant={statusVariant(application.status)}>
                {application.status}
              </Badge>
            </div>

            <p className="text-sm text-stone-500">{applicant?.email}</p>

            {application.profile?.location && (
              <p className="mt-2 inline-flex items-center gap-1 text-sm text-stone-500">
                <MapPin size={14} /> {application.profile.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-stone-100 pt-5">
          <p className="text-sm font-medium text-stone-700">Bio</p>
          <p className="mt-1 text-sm text-stone-600">
            {application.profile?.bio || 'No bio supplied.'}
          </p>
        </div>
      </Card>

      {application.offerings.map((offering) => (
        <OfferingReview
          key={offering.id}
          applicationId={application.id}
          offering={offering}
        />
      ))}
    </div>
  )
}