import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Star,
  CheckCircle,
  Image as ImageIcon,
  ChevronRight,
  BookOpen,
  LogIn,
  Briefcase,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn, formatTime } from '@/lib/utils'
import { usePublicInstructorQuery } from '@/features/instructor/hooks'
import { usePublicAvailabilityQuery } from '@/features/slots/hooks'
import { useAuthStore } from '@/features/auth/store'

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
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const query = usePublicInstructorQuery(profileId ?? '')
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [date, setDate] = useState('')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [mediaTab, setMediaTab] = useState<'images' | 'videos'>('images')

  const from = date ? `${date}T00:00:00.000Z` : ''
  const nextDay = date ? new Date(new Date(date).getTime() + 86400000) : null
  const to = nextDay ? `${nextDay.toISOString().split('T')[0]}T00:00:00.000Z` : ''

  const availability = usePublicAvailabilityQuery({
    profileId: profileId ?? '',
    offeringId: selectedOfferingId ?? '',
    from,
    to,
    enabled: Boolean(profileId && selectedOfferingId && date && bookingOpen),
  })

  if (!profileId) return <Navigate to="/instructors" replace />

  if (query.isLoading) {
    return (
      <div className="page-container py-20 flex flex-col items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-amber-100 animate-pulse" />
        <div className="h-4 w-48 rounded bg-stone-100 animate-pulse" />
        <div className="h-3 w-64 rounded bg-stone-100 animate-pulse" />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="page-container py-24 text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">Instructor not found</h1>
        <p className="text-sm text-stone-500 mb-6">This profile may have been removed or the link is invalid.</p>
        <Link to="/instructors">
          <Button variant="outline" size="sm">
            <ArrowLeft size={15} /> Back to instructors
          </Button>
        </Link>
      </div>
    )
  }

  const instructor = query.data
  const selectedOffering = instructor.offerings.find((o) => o.id === selectedOfferingId) ?? instructor.offerings[0] ?? null

  function selectOffering(id: string) {
    setSelectedOfferingId(id)
    setBookingOpen(false)
    setDate('')
    setSelectedSlotId(null)
    setMediaTab('images')
  }

  function handleBookClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setBookingOpen(true)
    setDate('')
    setSelectedSlotId(null)
  }

  const images = selectedOffering?.media.filter((m) => m.type === 'IMAGE') ?? []
  const videos = selectedOffering?.media.filter((m) => m.type === 'VIDEO') ?? []

  return (
    <div className="bg-kala-cream min-h-screen">
      {/* ── Top bar ── */}
      <div className="page-container pt-8 pb-2">
        <Link
          to="/instructors"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-kala-brown transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Back to instructors
        </Link>
      </div>

      <div className="page-container py-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ══════════════════════════════════════════
            LEFT COLUMN: Instructor hero + offerings
        ══════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* ── Hero card ── */}
          <Card className="overflow-hidden">
            {/* Decorative gradient strip */}
            <div className="h-24 bg-gradient-to-r from-kala-brown via-amber-700 to-kala-amber" />
            <div className="px-6 pb-6">
              {/* Avatar overlapping the strip */}
              <div className="-mt-10 mb-4 flex items-end justify-between gap-4 flex-wrap">
                <Avatar
                  name={instructor.name}
                  src={instructor.imageUrl ?? undefined}
                  size="xl"
                  className="ring-4 ring-white shadow-lg h-20 w-20 text-xl"
                />
                {instructor.offerings.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <CheckCircle size={12} /> Available to book
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-kala-brown">{instructor.name}</h1>

              <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
                {instructor.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {instructor.location}
                  </span>
                )}
                {instructor.offerings.length > 0 && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> {instructor.offerings.length} offering{instructor.offerings.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {instructor.bio && (
                <p className="mt-4 text-sm leading-relaxed text-stone-600 max-w-2xl">
                  {instructor.bio}
                </p>
              )}
            </div>
          </Card>

          {/* ── Offerings picker ── */}
          {instructor.offerings.length === 0 ? (
            <Card className="p-8 text-center text-sm text-stone-500">
              This instructor has no active offerings yet.
            </Card>
          ) : (
            <>
              <div>
                <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-kala-amber" /> Offerings
                </h2>
                <div className="flex flex-wrap gap-2">
                  {instructor.offerings.map((offering) => {
                    const active = (selectedOfferingId ?? instructor.offerings[0]?.id) === offering.id
                    return (
                      <button
                        key={offering.id}
                        type="button"
                        onClick={() => selectOffering(offering.id)}
                        className={cn(
                          'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150',
                          active
                            ? 'bg-kala-brown text-white border-kala-brown shadow-sm'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber hover:text-kala-brown',
                        )}
                      >
                        {offering.title || offering.subcategory.name}
                        <ChevronRight size={13} className={cn('shrink-0', active ? 'text-amber-300' : 'text-stone-400')} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Selected offering details ── */}
              {selectedOffering && (
                <Card className="p-6 space-y-5">
                  {/* Title + category + price */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="warning">
                          {selectedOffering.subcategory.category.name}
                        </Badge>
                        <Badge variant="default">
                          {selectedOffering.subcategory.name}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-stone-800 mb-1">
                        {selectedOffering.title || selectedOffering.subcategory.name}
                      </h3>
                      {selectedOffering.experienceYears != null && (
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <Star size={11} className="text-kala-amber fill-kala-amber" />
                          {selectedOffering.experienceYears}+ years experience
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-extrabold text-kala-terracotta">
                        ₹{Number(selectedOffering.hourlyRate).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">per hour</p>
                    </div>
                  </div>

                  <hr className="border-stone-100" />

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-stone-600">
                    {selectedOffering.description || 'No description provided for this offering.'}
                  </p>

                  {/* Media gallery */}
                  {(images.length > 0 || videos.length > 0) && (
                    <div>
                      <div className="flex gap-1 mb-3">
                        {images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMediaTab('images')}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              mediaTab === 'images'
                                ? 'bg-stone-800 text-white'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                            )}
                          >
                            <ImageIcon size={12} /> Images ({images.length})
                          </button>
                        )}
                        {videos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setMediaTab('videos')}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                              mediaTab === 'videos'
                                ? 'bg-stone-800 text-white'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200',
                            )}
                          >
                            <Video size={12} /> Videos ({videos.length})
                          </button>
                        )}
                      </div>

                      {mediaTab === 'images' && images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {images.map((media) => (
                            <img
                              key={media.id}
                              src={media.viewUrl}
                              alt={selectedOffering.title || selectedOffering.subcategory.name}
                              className="aspect-square w-full rounded-xl object-cover bg-stone-100"
                            />
                          ))}
                        </div>
                      )}

                      {mediaTab === 'videos' && videos.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {videos.map((media) => (
                            <div key={media.id}>
                              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500">
                                <Video size={12} /> Demo video
                              </p>
                              <video
                                controls
                                src={media.viewUrl}
                                className="aspect-video w-full rounded-xl bg-stone-900"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════
            RIGHT COLUMN: Booking panel (sticky)
        ══════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {selectedOffering ? (
            <Card className="overflow-hidden">
              {/* Booking header */}
              <div className="bg-gradient-to-br from-kala-brown to-amber-800 px-6 py-5 text-white">
                <p className="text-xs text-amber-200 font-medium uppercase tracking-wider mb-1">Book a session</p>
                <h3 className="text-lg font-bold leading-snug">
                  {selectedOffering.title || selectedOffering.subcategory.name}
                </h3>
                <p className="mt-2 text-2xl font-extrabold">
                  ₹{Number(selectedOffering.hourlyRate).toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-amber-200 ml-1">/ hr</span>
                </p>
              </div>

              <div className="p-5 space-y-4">
                {!bookingOpen ? (
                  /* ── Pre-book state ── */
                  <div className="space-y-3">
                    <ul className="space-y-2 text-sm text-stone-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        Live one-on-one session
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        Book any available slot
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        Secure payment
                      </li>
                    </ul>

                    {isAuthenticated ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleBookClick}
                      >
                        <CalendarDays size={17} /> Check Availability
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleBookClick}
                        >
                          <LogIn size={17} /> Log in to Book
                        </Button>
                        <p className="text-center text-xs text-stone-400">
                          Don't have an account?{' '}
                          <Link to="/register" className="text-kala-terracotta hover:underline font-medium">
                            Sign up free
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Date + slot picker ── */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                        Select date
                      </label>
                      <input
                        type="date"
                        min={todayInIndia()}
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value)
                          setSelectedSlotId(null)
                        }}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-kala-amber/40 focus:border-kala-amber"
                      />
                    </div>

                    {!date && (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-stone-400">
                        <CalendarDays size={18} className="text-stone-300" />
                        Pick a date to see slots
                      </div>
                    )}

                    {availability.isLoading && date && (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-12 rounded-xl bg-stone-100 animate-pulse" />
                        ))}
                      </div>
                    )}

                    {availability.isError && (
                      <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
                        Could not load availability. Try another date.
                      </p>
                    )}

                    {date && !availability.isLoading && availability.data?.length === 0 && (
                      <div className="text-center py-6 text-sm text-stone-400">
                        No available slots on this date.
                      </div>
                    )}

                    {!!availability.data?.length && (
                      <div>
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                          Available slots
                        </p>
                        <div className="grid gap-2">
                          {availability.data.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={cn(
                                'flex items-center justify-between w-full rounded-xl border px-4 py-3 text-sm transition-all duration-150',
                                selectedSlotId === slot.id
                                  ? 'border-kala-amber bg-amber-50 text-kala-brown shadow-sm'
                                  : 'border-stone-200 bg-white text-stone-700 hover:border-kala-amber hover:bg-amber-50/50',
                              )}
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <Clock size={14} className="text-kala-amber" />
                                {formatTime(slot.startTime)}
                              </span>
                              <span className="text-stone-400 text-xs">
                                until {formatTime(slot.endTime)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confirm CTA */}
                    {selectedSlotId && (
                      <div className="pt-1 space-y-2">
                        <Button className="w-full" size="lg">
                          <CalendarDays size={16} /> Confirm Booking
                        </Button>
                        <p className="text-center text-xs text-stone-400">
                          You'll be redirected to payment.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setBookingOpen(false)
                        setDate('')
                        setSelectedSlotId(null)
                      }}
                      className="w-full text-xs text-stone-400 hover:text-stone-600 py-1 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-sm text-stone-500">
              Select an offering to book a session.
            </Card>
          )}

          {/* Quick-info strip */}
          {instructor.offerings.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 space-y-2 text-sm text-stone-500">
              <p className="font-semibold text-stone-700 text-xs uppercase tracking-wider">About sessions</p>
              <p className="flex items-start gap-2"><Video size={14} className="mt-0.5 shrink-0 text-kala-amber" /> Sessions are held live via video call.</p>
              <p className="flex items-start gap-2"><CalendarDays size={14} className="mt-0.5 shrink-0 text-kala-amber" /> Book any open slot that fits your schedule.</p>
              <p className="flex items-start gap-2"><Clock size={14} className="mt-0.5 shrink-0 text-kala-amber" /> Slots are in IST (India Standard Time).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}