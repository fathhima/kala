import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star, MapPin, BadgeCheck, ArrowLeft, Calendar,
  Clock, ChevronRight, Image as ImageIcon, VideoIcon,
} from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { mockSlots, mockReviews } from '../../lib/mock'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ReviewCard } from '../../components/shared/ReviewCard'
import { formatDate, formatTime, formatPrice, cn } from '../../lib/utils'

/* ─── helpers ──────────────────────────────────────────────── */

function uniqueDates(slots: ReturnType<typeof mockSlots.filter>) {
  const seen = new Set<string>()
  return slots
    .map((s) => {
      const d = new Date(s.startTime)
      return {
        key: d.toDateString(),
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      }
    })
    .filter(({ key }) => (seen.has(key) ? false : seen.add(key) && true))
}

/* ─── component ─────────────────────────────────────────────── */

export function InstructorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { instructors } = useInstructorStore()
  const instructor = instructors.find((i) => i.id === id)

  // Skill tab
  const [activeSkillId, setActiveSkillId] = useState<string>(() => instructor?.skills[0]?.id ?? '')

  // Booking state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  if (!instructor) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-stone-700 mb-2">Instructor not found</h2>
        <Link to="/instructors"><Button variant="outline">Back to Instructors</Button></Link>
      </div>
    )
  }

  const allSlots = mockSlots.filter((s) => s.instructorId === instructor.id && s.status === 'AVAILABLE')
  const allReviews = mockReviews.filter((r) => r.instructorId === instructor.id)

  const activeSkill = instructor.skills.find((s) => s.id === activeSkillId) ?? instructor.skills[0]

  // Per-skill data (mock: assign all portfolio/reviews to current active skill for demo)
  const skillReviews = allReviews
  const skillPortfolio = instructor.portfolioItems

  // Booking flow data
  const availableDates = useMemo(() => uniqueDates(allSlots), [allSlots])

  const timeSlotsForDate = useMemo(
    () => allSlots.filter((s) => new Date(s.startTime).toDateString() === selectedDate),
    [allSlots, selectedDate]
  )

  const selectedSlot = allSlots.find((s) => s.id === selectedSlotId)

  const handleProceed = () => {
    navigate('/dashboard/payment', {
      state: {
        instructorId: instructor.id,
        instructorName: instructor.user.name,
        slotId: selectedSlotId,
        skillId: activeSkillId,
        skillName: activeSkill?.name,
        price: instructor.pricing,
      },
    })
  }

  return (
    <div>
      {/* ── Banner ── */}
      <div className="bg-gradient-to-br from-kala-cream to-amber-50 border-b border-stone-100">
        <div className="page-container py-10">
          <Link
            to="/instructors"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6"
          >
            <ArrowLeft size={14} /> Back to Instructors
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar name={instructor.user.name} src={instructor.user.avatarUrl} size="xl" className="shrink-0" />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-kala-brown">{instructor.user.name}</h1>
                {instructor.isTopRated && (
                  <span className="flex items-center gap-1 text-xs bg-kala-amber/10 text-kala-terracotta px-2.5 py-1 rounded-full font-medium">
                    <BadgeCheck size={12} /> Top Rated
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-kala-amber fill-kala-amber" />
                  {instructor.avgRating.toFixed(1)}
                  <span className="text-stone-400">({allReviews.length} reviews)</span>
                </span>
                {instructor.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {instructor.location}
                  </span>
                )}
              </div>

              {/* Skill badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {instructor.skills.map((skill) => (
                  <Badge key={skill.id} variant="warning">{skill.name}</Badge>
                ))}
              </div>

              <p className="text-stone-600 leading-relaxed max-w-2xl">{instructor.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skill Tabs ── */}
      {instructor.skills.length > 1 && (
        <div className="sticky top-14 z-20 bg-white border-b border-stone-100 shadow-sm">
          <div className="page-container">
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
              {instructor.skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setActiveSkillId(skill.id)
                    setSelectedDate(null)
                    setSelectedSlotId(null)
                  }}
                  className={cn(
                    'flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    skill.id === activeSkillId
                      ? 'border-kala-amber text-kala-brown'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-200'
                  )}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content + sidebar ── */}
      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: per-skill content ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Rate card */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex-1">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-0.5">Session rate</p>
                <p className="text-2xl font-bold text-kala-brown">
                  {formatPrice(instructor.pricing)}
                  <span className="text-sm font-normal text-stone-400 ml-1">/ hour</span>
                </p>
              </div>
              {activeSkill && (
                <Badge variant="warning" className="text-sm px-3 py-1">{activeSkill.name}</Badge>
              )}
            </div>

            {/* Photos */}
            {skillPortfolio.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={18} className="text-kala-amber" />
                  <h2 className="text-lg font-bold text-kala-brown">Photos</h2>
                  <span className="text-sm text-stone-400">({skillPortfolio.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {skillPortfolio.map((item) => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square">
                      <img
                        src={item.imageUrl}
                        alt={item.caption || ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.caption && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-white text-xs font-medium">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Videos — placeholder until real video data exists */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <VideoIcon size={18} className="text-kala-amber" />
                <h2 className="text-lg font-bold text-kala-brown">Demo Videos</h2>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400">
                <VideoIcon size={28} />
                <p className="text-sm">No demo videos added yet</p>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Star size={18} className="text-kala-amber fill-kala-amber" />
                <h2 className="text-lg font-bold text-kala-brown">Reviews</h2>
                <span className="text-sm text-stone-400">({skillReviews.length})</span>
              </div>
              {skillReviews.length > 0 ? (
                <div className="space-y-3">
                  {skillReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-stone-400">
                  <Star size={28} className="mx-auto mb-2 text-stone-200" />
                  <p className="text-sm">No reviews yet for this skill</p>
                </Card>
              )}
            </section>
          </div>

          {/* ── Right: booking sidebar ── */}
          <div>
            <div className="sticky top-28 space-y-4">
              <h2 className="text-lg font-bold text-kala-brown">Book a Session</h2>

              {allSlots.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar size={32} className="text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">No available slots right now</p>
                </Card>
              ) : (
                <>
                  {/* Step 1: pick a date */}
                  <Card className="p-4">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Calendar size={13} /> Choose a Date
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableDates.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedDate(key)
                            setSelectedSlotId(null)
                          }}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
                            selectedDate === key
                              ? 'bg-kala-amber text-white border-kala-amber'
                              : 'border-stone-200 text-stone-600 hover:border-kala-amber hover:text-kala-brown'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Step 2: pick a time */}
                  {selectedDate && (
                    <Card className="p-4">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Clock size={13} /> Choose a Time
                      </p>
                      {timeSlotsForDate.length === 0 ? (
                        <p className="text-xs text-stone-400">No slots for this date.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {timeSlotsForDate.map((slot) => {
                            const isSelected = selectedSlotId === slot.id
                            return (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={cn(
                                  'flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors text-xs',
                                  isSelected
                                    ? 'bg-amber-50 border-kala-amber text-kala-brown'
                                    : 'border-stone-100 hover:border-stone-200 text-stone-600'
                                )}
                              >
                                <span className="font-medium">
                                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                </span>
                                {slot.title && (
                                  <span className="text-stone-400 truncate max-w-[100px] ml-2">{slot.title}</span>
                                )}
                                {isSelected && (
                                  <ChevronRight size={13} className="text-kala-amber flex-shrink-0 ml-1" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Step 3: summary + proceed */}
                  {selectedSlot && (
                    <Card className="p-4 space-y-3">
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between text-stone-600">
                          <span>Date</span>
                          <span className="font-medium text-stone-800">{formatDate(selectedSlot.startTime)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Time</span>
                          <span className="font-medium text-stone-800">
                            {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Skill</span>
                          <span className="font-medium text-stone-800">{activeSkill?.name}</span>
                        </div>
                        <div className="flex justify-between border-t border-stone-100 pt-2 mt-2">
                          <span className="font-semibold text-stone-700">Total</span>
                          <span className="font-bold text-kala-brown">{formatPrice(instructor.pricing)}</span>
                        </div>
                      </div>
                      <Button className="w-full gap-2" onClick={handleProceed}>
                        Proceed to Payment <ChevronRight size={15} />
                      </Button>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
