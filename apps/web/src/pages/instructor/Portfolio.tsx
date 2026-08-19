import { useState } from 'react'
import { ImageIcon, Plus, Trash2, VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  useOfferingMediaUrlQuery,
  useOnboardingWorkspaceQuery,
  useRemoveOfferingMediaMutation,
  useUploadOfferingMediaMutation,
} from '@/features/instructor/hooks'
import { getApiErrorResponse } from '@/lib/api-error'

function MediaItem({
  offeringId,
  media,
  editable,
  onRemove,
}: {
  offeringId: string
  media: { id: string; type: 'IMAGE' | 'VIDEO' }
  editable: boolean
  onRemove: () => void
}) {
  const { data: url, isLoading } = useOfferingMediaUrlQuery(offeringId, media.id)

  if (isLoading || !url) {
    return <div className="aspect-square rounded-xl bg-stone-100" />
  }

  return (
    <div className="group relative overflow-hidden rounded-xl bg-stone-100">
      {media.type === 'VIDEO' ? (
        <video controls src={url} className="aspect-square w-full object-cover" />
      ) : (
        <img src={url} alt="Portfolio work" className="aspect-square w-full object-cover" />
      )}

      {editable && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100"
          aria-label="Remove portfolio item"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

export function Portfolio() {
  const { data: workspace, isLoading, isError } = useOnboardingWorkspaceQuery()
  const uploadMutation = useUploadOfferingMediaMutation()
  const removeMutation = useRemoveOfferingMediaMutation()
  const [error, setError] = useState('')

  const offerings = (workspace?.offerings ?? []).filter(
    (offering) => offering.status === 'APPROVED',
  )

  const upload = async (offeringId: string, files: FileList | null, currentCount: number) => {
    if (!files) return
    setError('')

    try {
      for (const [index, file] of Array.from(files).entries()) {
        await uploadMutation.mutateAsync({
          offeringId,
          file,
          sortOrder: currentCount + index,
        })
      }
    } catch (requestError) {
      setError(getApiErrorResponse(requestError, 'Could not upload portfolio media.'))
    }
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading portfolio…</p>
  if (isError) return <p className="text-sm text-red-500">Could not load portfolio.</p>

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Portfolio</h1>
        <p className="mt-1 text-sm text-stone-500">
          Add or remove work samples for your approved offerings.
        </p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {offerings.length === 0 ? (
        <Card className="p-8 text-center text-sm text-stone-500">
          You need an approved offering before you can manage a public portfolio.
        </Card>
      ) : (
        offerings.map((offering) => (
          <Card key={offering.id} className="space-y-5 p-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-800">{offering.title}</h2>
              <p className="text-sm text-stone-500">
                {offering.subcategory.category.name} · {offering.subcategory.name}
              </p>
            </div>

            {offering.media.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {offering.media.map((media) => (
                  <MediaItem
                    key={media.id}
                    offeringId={offering.id}
                    media={media}
                    editable
                    onRemove={() =>
                      void removeMutation.mutateAsync({
                        offeringId: offering.id,
                        mediaId: media.id,
                      })
                    }
                  />
                ))}
              </div>
            )}

            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                className="hidden"
                disabled={uploadMutation.isPending}
                onChange={(event) => {
                  void upload(offering.id, event.target.files, offering.media.length)
                  event.target.value = ''
                }}
              />
              <span>
                <Button type="button" disabled={uploadMutation.isPending}>
                  <Plus size={16} />
                  Add images or videos
                </Button>
              </span>
            </label>

            <p className="text-xs text-stone-400">
              Up to 10 images and 3 videos per offering. Images: 5 MB; videos: 100 MB.
            </p>
          </Card>
        ))
      )}
    </div>
  )
}