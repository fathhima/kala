import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, MapPin, Video } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, formatTime } from '@/lib/utils'
import { usePublicInstructorQuery } from '@/features/public-catelog/hooks'
import { usePublicAvailabilityQuery } from '@/features/slots/hooks'

function todayInIndia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function InstructorProfile() {
  const { profileId } = useParams()
  const query = usePublicInstructorQuery(profileId ?? '')
  const [bookingOfferingId, setBookingOfferingId] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const availability = usePublicAvailabilityQuery({
    profileId: profileId ?? '',
    offeringId: bookingOfferingId ?? '',
    date,
    enabled: Boolean(profileId && bookingOfferingId && date),
  })

  if (!profileId) return <Navigate to="/instructors" replace />

  if (query.isLoading) {
    return <div className="page-container py-12 text-sm text-stone-500">Loading instructor…</div>
  }

  if (query.isError || !query.data) {
    return (
      <div className="page-container py-16 text-center">
        <h1 className="text-xl font-semibold text-stone-800">Instructor not found</h1>
        <Link to="/instructors" className="mt-5 inline-block text-sm text-kala-terracotta">
          Back to instructors
        </Link>
      </div>
    )
  }

  const instructor = query.data

  function openBooking(offeringId: string) {
    setBookingOfferingId((current) => current === offeringId ? null : offeringId)
    setDate('')
    setSelectedSlotId(null)
  }

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
          <Avatar name={instructor.name} src={instructor.imageUrl ?? undefined} size="xl" />
          <div>
            <h1 className="text-3xl font-bold text-kala-brown">{instructor.name}</h1>
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
            const images = offering.media.filter((media) => media.type === 'IMAGE')
            const videos = offering.media.filter((media) => media.type === 'VIDEO')
            const isBookingOpen = bookingOfferingId === offering.id

            return (
              <Card key={offering.id} className="p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <Badge variant="warning">
                      {offering.subcategory.category.name} · {offering.subcategory.name}
                    </Badge>

                    <h3 className="mt-3 text-xl font-semibold text-stone-800">
                      {offering.title || offering.subcategory.name}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                      {offering.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <p className="text-lg font-bold text-kala-terracotta">
                      ₹{Number(offering.hourlyRate).toLocaleString('en-IN')} / hour
                    </p>
                    <Button onClick={() => openBooking(offering.id)}>
                      <CalendarDays size={16} />
                      {isBookingOpen ? 'Close availability' : 'Book'}
                    </Button>
                  </div>
                </div>

                {isBookingOpen && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                    <h4 className="font-semibold text-stone-800">Choose a date and time</h4>

                    <div className="mt-4 max-w-xs">
                      <label className="mb-1.5 block text-sm font-medium text-stone-600">
                        Date
                      </label>
                      <input
                        type="date"
                        min={todayInIndia()}
                        value={date}
                        onChange={(event) => {
                          setDate(event.target.value)
                          setSelectedSlotId(null)
                        }}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
                      />
                    </div>

                    {!date && (
                      <p className="mt-4 text-sm text-stone-500">
                        Select a date to view available slots.
                      </p>
                    )}

                    {availability.isLoading && (
                      <p className="mt-4 text-sm text-stone-500">Loading available slots…</p>
                    )}

                    {availability.isError && (
                      <p className="mt-4 text-sm text-red-600">
                        Could not load availability. Please try another date.
                      </p>
                    )}

                    {date && !availability.isLoading && availability.data?.length === 0 && (
                      <p className="mt-4 text-sm text-stone-500">
                        No available slots for this date.
                      </p>
                    )}

                    {!!availability.data?.length && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availability.data.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={cn(
                              'rounded-xl border bg-white px-4 py-3 text-left text-sm transition-colors',
                              selectedSlotId === slot.id
                                ? 'border-kala-amber bg-amber-100 text-kala-brown'
                                : 'border-stone-200 text-stone-700 hover:border-kala-amber',
                            )}
                          >
                            {slot.title && (
                              <span className="mb-1 block font-medium">{slot.title}</span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedSlotId && (
                      <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-stone-600">
                        Slot selected. Booking confirmation and payment will be added with the
                        booking module.
                      </p>
                    )}
                  </div>
                )}

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
                        <video controls src={media.viewUrl} className="aspect-video w-full rounded-xl bg-black" />
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