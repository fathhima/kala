import { useEffect, useState } from 'react'
import { CheckCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { CategoryDto, InstructorOfferingDto } from '@/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { useSelectableCategoriesQuery } from '@/features/categories/hooks'
import {
  useCancelInstructorApplicationMutation,
  useCreateOfferingMutation,
  useOnboardingWorkspaceQuery,
  useOfferingMediaUrlQuery,
  useRemoveOfferingMediaMutation,
  useRemoveOfferingMutation,
  useSaveInstructorProfileMutation,
  useSubmitInstructorApplicationMutation,
  useUpdateOfferingMutation,
  useUploadOfferingMediaMutation,
} from '@/features/instructor/hooks'
import { getApiErrorResponse } from '@/lib/api-error'

type OfferingForm = {
  categoryId: string
  subcategoryId: string
  title: string
  description: string
  hourlyRate: string
  experienceYears: string
}

const emptyOffering: OfferingForm = {
  categoryId: '',
  subcategoryId: '',
  title: '',
  description: '',
  hourlyRate: '',
  experienceYears: '',
}

const editableStatuses = new Set([
  'DRAFT',
  'REJECTED',
  'CHANGES_REQUESTED',
])

type ProfileFormErrors = {
  bio?: string
  location?: string
  portfolioUrl?: string
}

const statusVariant = (status: string,): 'default' | 'success' | 'warning' | 'error' => {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'error'
  if (status === 'PENDING' || status === 'CHANGES_REQUESTED') return 'warning'
  return 'default'
}

function MediaPreview({
  offeringId,
  mediaId,
  type,
}: {
  offeringId: string
  mediaId: string
  type: 'IMAGE' | 'VIDEO'
}) {
  const { data: viewUrl, isLoading } = useOfferingMediaUrlQuery(
    offeringId,
    mediaId,
  )

  if (isLoading) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
        Loading…
      </div>
    )
  }

  if (!viewUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400">
        Unavailable
      </div>
    )
  }

  if (type === 'VIDEO') {
    return (
      <video
        controls
        src={viewUrl}
        className="aspect-square w-full rounded-xl object-cover"
      />
    )
  }

  return (
    <img
      src={viewUrl}
      alt="Offering portfolio"
      className="aspect-square w-full rounded-xl object-cover"
    />
  )
}

function OfferingEditor({
  categories,
  initialValue,
  saving,
  onSave,
  onCancel,
}: {
  categories: CategoryDto[]
  initialValue: OfferingForm
  saving: boolean
  onSave: (form: OfferingForm) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(initialValue)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(initialValue)
  }, [initialValue])

  const selectedCategory = categories.find(
    (category) => category.id === form.categoryId,
  )

  const subcategories =
    selectedCategory?.subcategories.filter((item) => item.isActive) ?? []

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (
      !form.subcategoryId ||
      !form.title.trim() ||
      !form.description.trim() ||
      Number(form.hourlyRate) <= 0
    ) {
      setError('Complete all required offering fields.')
      return
    }

    try {
      await onSave(form)
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not save offering.'))
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-800">Offering</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X size={15} /> Cancel
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-700">Category</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  categoryId: event.target.value,
                  subcategoryId: '',
                }))
              }
              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-700">
              Subcategory
            </span>
            <select
              value={form.subcategoryId}
              disabled={!form.categoryId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subcategoryId: event.target.value,
                }))
              }
              className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm disabled:bg-stone-100"
            >
              <option value="">Select subcategory</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Input
          label="Title"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
        />

        <Textarea
          label="Description"
          rows={4}
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Hourly rate (₹)"
            type="number"
            min={1}
            value={form.hourlyRate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                hourlyRate: event.target.value,
              }))
            }
          />

          <Input
            label="Experience (years)"
            type="number"
            min={0}
            max={80}
            value={form.experienceYears}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                experienceYears: event.target.value,
              }))
            }
          />
        </div>

        <Button type="submit" loading={saving}>
          Save offering
        </Button>
      </form>
    </Card>
  )
}

export function BecomeInstructor({
  instructorMode = false,
}: {
  instructorMode?: boolean
}) {
  const workspaceQuery = useOnboardingWorkspaceQuery()
  const categoriesQuery = useSelectableCategoriesQuery()

  const saveProfileMutation = useSaveInstructorProfileMutation()
  const createOfferingMutation = useCreateOfferingMutation()
  const updateOfferingMutation = useUpdateOfferingMutation()
  const removeOfferingMutation = useRemoveOfferingMutation()
  const uploadMediaMutation = useUploadOfferingMediaMutation()
  const removeMediaMutation = useRemoveOfferingMediaMutation()
  const submitMutation = useSubmitInstructorApplicationMutation()
  const cancelMutation = useCancelInstructorApplicationMutation()

  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const workspace = workspaceQuery.data
  const offerings = workspace?.offerings ?? []
  const categories = categoriesQuery.data ?? []
  const latestApplication = workspace?.latestApplication
  const isPending = latestApplication?.status === 'PENDING'
  useEffect(() => {
    setBio(workspace?.bio ?? '')
    setLocation(workspace?.location ?? '')
    setPortfolioUrl(workspace?.portfolioUrl ?? '')
  }, [workspace?.bio, workspace?.location, workspace?.portfolioUrl])

  if (workspaceQuery.isLoading || categoriesQuery.isLoading) {
    return <div className="text-sm text-stone-500">Loading onboarding…</div>
  }

  if (workspaceQuery.isError || categoriesQuery.isError) {
    return (
      <div className="text-sm text-red-500">
        {getApiErrorResponse(
          workspaceQuery.error ?? categoriesQuery.error,
          'Could not load onboarding.',
        )}
      </div>
    )
  }

  const toForm = (offering?: InstructorOfferingDto): OfferingForm => {
    if (!offering) return emptyOffering

    return {
      categoryId: offering.subcategory.category.id,
      subcategoryId: offering.subcategoryId,
      title: offering.title ?? '',
      description: offering.description ?? '',
      hourlyRate: offering.hourlyRate,
      experienceYears: offering.experienceYears?.toString() ?? '',
    }
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitError('')

    const errors: ProfileFormErrors = {}

    if (!bio.trim()) {
      errors.bio = 'Bio is required.'
    }

    if (!location.trim()) {
      errors.location = 'Location is required.'
    }

    if (!portfolioUrl.trim()) {
      errors.portfolioUrl = 'Portfolio URL is required.'
    } else {
      try {
        new URL(portfolioUrl.trim())
      } catch {
        errors.portfolioUrl = 'Enter a valid portfolio URL.'
      }
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    setProfileErrors({})

    try {
      await saveProfileMutation.mutateAsync({
        bio: bio.trim(),
        location: location.trim(),
        portfolioUrl: portfolioUrl.trim(),
      })
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not save profile.'))
    }
  }

  const saveOffering = async (form: OfferingForm) => {
    setSubmitError('')

    const payload = {
      subcategoryId: form.subcategoryId,
      title: form.title.trim(),
      description: form.description.trim(),
      hourlyRate: Number(form.hourlyRate),
      experienceYears: form.experienceYears
        ? Number(form.experienceYears)
        : undefined,
      currency: 'INR',
    }

    if (editingId) {
      await updateOfferingMutation.mutateAsync({
        offeringId: editingId,
        payload,
      })
    } else {
      await createOfferingMutation.mutateAsync(payload)
    }

    setEditingId(null)
    setAdding(false)
  }

  const uploadMedia = async (offeringId: string, files: FileList | null,) => {
    if (!files) return

    setError('')
    setSubmitError('')

    try {
      for (const [index, file] of Array.from(files).entries()) {
        await uploadMediaMutation.mutateAsync({
          offeringId,
          file,
          sortOrder: index,
        })
      }
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not upload media.'))
    }
  }

  const cancelApplication = async () => {
    if (!latestApplication) return

    setError('')

    try {
      await cancelMutation.mutateAsync(latestApplication.id)
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not cancel application.'))
    }
  }

  const submitApplication = async () => {
    setSubmitError('')

    try {
      await submitMutation.mutateAsync()
    } catch (requestError) {
      setSubmitError(
        getApiErrorResponse(requestError, 'Could not submit application.'),
      )
    }
  }

  if (isPending && latestApplication) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 text-amber-600" size={22} />
            <div>
              <h1 className="text-2xl font-bold text-kala-brown">
                {instructorMode ? 'Offerings management' : 'Become an Instructor'}
              </h1>

              <p className="mt-1 text-sm text-stone-500">
                {instructorMode
                  ? 'Create a new offering, respond to admin feedback, and track every offering status.'
                  : 'Build your profile, add teaching offerings, then submit them for review.'}
              </p>
            </div>
          </div>

          <Button
            className="mt-5"
            variant="destructive"
            loading={cancelMutation.isPending}
            onClick={() => void cancelApplication()}
          >
            Withdraw application
          </Button>
        </Card>

        {latestApplication.offerings.map((offering) => (
          <Card key={offering.id} className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-800">
                {offering.title}
              </h2>
              <Badge variant={statusVariant(offering.status)}>
                {offering.status}
              </Badge>
            </div>

            <p className="text-sm text-stone-500">
              {offering.subcategory.category.name} · {offering.subcategory.name}
            </p>

            <p className="text-sm text-stone-700">{offering.description}</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {offering.media.map((media) => (
                <MediaPreview
                  key={media.id}
                  offeringId={offering.id}
                  mediaId={media.id}
                  type={media.type}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const editingOffering = offerings.find((item) => item.id === editingId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">
          Become an Instructor
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Build your profile, add teaching offerings, then submit them for review.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {!instructorMode && (
        <Card className="p-6">
          <form onSubmit={saveProfile} className="space-y-4">
            <h2 className="text-lg font-semibold text-stone-800">Profile</h2>

            <Textarea
              label="Bio"
              rows={4}
              value={bio}
              onChange={(event) => {
                setBio(event.target.value)
                setProfileErrors((prev) => ({ ...prev, bio: undefined }))
              }}
              error={profileErrors.bio}
            />

            <Input
              label="Location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value)
                setProfileErrors((prev) => ({ ...prev, location: undefined }))
              }}
              error={profileErrors.location}

            />

            <Input
              label="Portfolio URL"
              type="url"
              value={portfolioUrl}
              onChange={(event) => {
                setPortfolioUrl(event.target.value)
                setProfileErrors((prev) => ({ ...prev, portfolioUrl: undefined }))
              }}
              error={profileErrors.portfolioUrl}
            />

            <Button type="submit" loading={saveProfileMutation.isPending}>
              Save profile
            </Button>
          </form>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Offerings</h2>
          <p className="text-sm text-stone-500">
            Add each skill you want to teach as a separate offering.
          </p>
        </div>

        {!adding && !editingId && (
          <Button onClick={() => {
            setSubmitError('')
            setAdding(true)
          }}>
            <Plus size={16} /> Add offering
          </Button>
        )}
      </div>

      {(adding || editingId) && (
        <OfferingEditor
          categories={categories}
          initialValue={toForm(editingOffering)}
          saving={
            createOfferingMutation.isPending || updateOfferingMutation.isPending
          }
          onSave={saveOffering}
          onCancel={() => {
            setAdding(false)
            setEditingId(null)
          }}
        />
      )}

      {offerings.map((offering) => {
        const editable = editableStatuses.has(offering.status)

        return (
          <Card key={offering.id} className="space-y-4 p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-stone-800">
                    {offering.title}
                  </h3>
                  <Badge variant={statusVariant(offering.status)}>
                    {offering.status}
                  </Badge>
                </div>

                <p className="mt-1 text-sm text-stone-500">
                  {offering.subcategory.category.name} ·{' '}
                  {offering.subcategory.name}
                </p>

                <p className="mt-2 text-sm text-stone-700">
                  {offering.description}
                </p>

                <p className="mt-2 font-medium text-kala-terracotta">
                  ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} / hour
                </p>
              </div>

              {editable && (
                <div className="flex h-fit gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(offering.id)}
                  >
                    <Pencil size={14} /> Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    loading={removeOfferingMutation.isPending}
                    onClick={() =>
                      void removeOfferingMutation.mutateAsync(offering.id)
                    }
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              )}
            </div>

            {offering.reviewNote && (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                <span className="font-semibold">Admin feedback:</span>{' '}
                {offering.reviewNote}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {offering.media.map((media) => (
                <div key={media.id} className="relative">
                  <MediaPreview
                    offeringId={offering.id}
                    mediaId={media.id}
                    type={media.type}
                  />

                  {editable && (
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                      onClick={() =>
                        void removeMediaMutation.mutateAsync({
                          offeringId: offering.id,
                          mediaId: media.id,
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editable && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-stone-700">
                  Upload images or videos
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={(event) => {
                    void uploadMedia(offering.id, event.target.files)
                    event.target.value = ''
                  }}
                />
              </label>
            )}
          </Card>
        )
      })}

      {submitError && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        loading={submitMutation.isPending}
        disabled={offerings.length === 0}
        onClick={() => void submitApplication()}
      >
        Submit application
      </Button>
    </div>
  )
}