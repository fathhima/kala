import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Video } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { usePublicInstructorQuery } from '@/features/public-catelog/hooks'

export function InstructorProfile() {
  const { profileId } = useParams()
  const query = usePublicInstructorQuery(profileId ?? '')

  if (!profileId) {
    return <Navigate to="/instructors" replace />
  }

  if (query.isLoading) {
    return (
      <div className="page-container py-12 text-sm text-stone-500">
        Loading instructor…
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="page-container py-16 text-center">
        <h1 className="text-xl font-semibold text-stone-800">
          Instructor not found
        </h1>
        <Link
          to="/instructors"
          className="mt-5 inline-block text-sm text-kala-terracotta"
        >
          Back to instructors
        </Link>
      </div>
    )
  }

  const instructor = query.data

  return (
    <div className="page-container py-10">
      <Link
        to="/instructors"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft size={15} /> Back to instructors
      </Link>

      <section className="rounded-2xl border border-stone-100 bg-amber-50 p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar
            name={instructor.name}
            src={instructor.imageUrl ?? undefined}
            size="xl"
          />

          <div>
            <h1 className="text-3xl font-bold text-kala-brown">
              {instructor.name}
            </h1>

            {instructor.location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
                <MapPin size={14} /> {instructor.location}
              </p>
            )}

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
              {instructor.bio || 'Creative instructor on Kala.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-kala-brown">Offerings</h2>

        <div className="mt-5 space-y-6">
          {instructor.offerings.map((offering) => {
            const images = offering.media.filter(
              (media) => media.type === 'IMAGE',
            )
            const videos = offering.media.filter(
              (media) => media.type === 'VIDEO',
            )

            return (
              <Card key={offering.id} className="p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <Badge variant="warning">
                      {offering.subcategory.category.name} ·{' '}
                      {offering.subcategory.name}
                    </Badge>

                    <h3 className="mt-3 text-xl font-semibold text-stone-800">
                      {offering.title || offering.subcategory.name}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                      {offering.description || 'No description provided.'}
                    </p>
                  </div>

                  <p className="shrink-0 text-lg font-bold text-kala-terracotta">
                    ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} /
                    hour
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((media) => (
                      <img
                        key={media.id}
                        src={media.viewUrl}
                        alt={`${offering.title || offering.subcategory.name} portfolio`}
                        className="aspect-square w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                {videos.length > 0 && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {videos.map((media) => (
                      <div key={media.id}>
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-stone-700">
                          <Video size={15} /> Demo video
                        </p>
                        <video
                          controls
                          src={media.viewUrl}
                          className="aspect-video w-full rounded-xl bg-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}