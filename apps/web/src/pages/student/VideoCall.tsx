import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MonitorUp, Hand, MessageSquare, Users, MoreVertical,
  Star, CheckCircle2,
} from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

/* ── Elapsed timer ─────────────────────────────────────────── */
function useElapsed() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

/* ── Control button ────────────────────────────────────────── */
function CtrlBtn({
  icon, label, active = true, danger = false, onClick, size = 'md',
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  danger?: boolean
  onClick?: () => void
  size?: 'md' | 'lg'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-1.5 group transition-all focus:outline-none"
    >
      <div className={cn(
        'flex items-center justify-center rounded-full transition-colors',
        size === 'lg' ? 'w-14 h-14' : 'w-12 h-12',
        danger
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : active
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-stone-700 hover:bg-stone-600 text-stone-300',
      )}>
        {icon}
      </div>
      <span className="text-[10px] text-stone-400 group-hover:text-stone-300 transition-colors leading-none">
        {label}
      </span>
    </button>
  )
}

/* ── Component ─────────────────────────────────────────────── */

export function VideoCall() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookings, setBookingReview } = useBookingStore()
  const { user } = useAuthStore()

  const booking = bookings.find((b) => b.id === id)

  // Call controls
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [handRaised, setHandRaised] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  // Post-session review
  const [showReview, setShowReview] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const elapsed = useElapsed()

  if (!booking) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-stone-400">Session not found.</p>
          <Link to="/dashboard/bookings" className="text-sm text-kala-amber hover:underline">
            Back to Bookings
          </Link>
        </div>
      </div>
    )
  }

  const instructor = booking.instructor
  const sessionTitle = booking.slot.title || `${instructor.skills[0]?.name ?? 'Creative'} Session`

  const handleEndCall = () => setShowReview(true)

  const handleSubmitReview = async () => {
    if (!user || rating === 0) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setBookingReview(booking.id, {
      id: `rev-${Date.now()}`,
      bookingId: booking.id,
      studentId: user.id,
      studentName: user.name,
      instructorId: instructor.id,
      rating,
      comment: comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => navigate('/dashboard/bookings'), 1800)
  }

  const handleSkip = () => navigate('/dashboard/bookings')

  /* ── Post-session review overlay ─────────────────────────── */
  if (showReview) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        {/* Blurred background hint of the video */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black opacity-90" />

        <div className="relative z-10 w-full max-w-md">
          {submitted ? (
            /* ── Thank-you state ── */
            <div className="bg-white rounded-3xl p-8 text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-kala-brown">Thank you!</h2>
                <p className="text-stone-500 text-sm mt-1">Your feedback has been submitted.</p>
              </div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    className={i < rating ? 'text-kala-amber fill-kala-amber' : 'text-stone-200 fill-stone-200'}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-400">Redirecting to your bookings…</p>
            </div>
          ) : (
            /* ── Review form ── */
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-br from-kala-cream to-amber-50 px-6 pt-6 pb-5 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-kala-amber/30">
                    {instructor.user.avatarUrl ? (
                      <img src={instructor.user.avatarUrl} alt={instructor.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-kala-amber flex items-center justify-center text-white font-bold">
                        {instructor.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-kala-brown">{instructor.user.name}</p>
                    <p className="text-xs text-stone-500">{sessionTitle} · {elapsed}</p>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-kala-brown">How was your session?</h2>
                <p className="text-stone-500 text-sm mt-0.5">Your feedback helps the instructor improve</p>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Star rating */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const val = i + 1
                      const filled = val <= (hoveredStar || rating)
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(val)}
                          onMouseEnter={() => setHoveredStar(val)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            size={36}
                            className={cn(
                              'transition-colors',
                              filled
                                ? 'text-kala-amber fill-kala-amber'
                                : 'text-stone-200 fill-stone-200'
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className={cn(
                    'text-sm font-medium transition-colors h-5',
                    (hoveredStar || rating) > 0 ? 'text-kala-amber' : 'text-transparent'
                  )}>
                    {STAR_LABELS[(hoveredStar || rating) - 1] ?? ''}
                  </span>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Leave a note <span className="text-stone-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Share what you learned or how ${instructor.user.name} helped you…`}
                    rows={3}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-kala-amber focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    disabled={rating === 0 || submitting}
                    onClick={handleSubmitReview}
                    className={cn(
                      'w-full py-3 rounded-2xl text-sm font-semibold transition-all',
                      rating > 0 && !submitting
                        ? 'bg-kala-amber text-white hover:bg-amber-500'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    )}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full py-2.5 rounded-2xl text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Active call ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col select-none overflow-hidden">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-medium">{sessionTitle}</span>
          <span className="text-stone-400 text-sm font-mono">{elapsed}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowParticipants((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs transition-colors"
          >
            <Users size={13} /> 2
          </button>
          <button
            type="button"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 transition-colors"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative flex">
        <div className="flex-1 relative flex items-center justify-center bg-stone-800">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl">
              {instructor.user.avatarUrl ? (
                <img src={instructor.user.avatarUrl} alt={instructor.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-kala-amber flex items-center justify-center text-white text-2xl font-bold">
                  {instructor.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{instructor.user.name}</p>
              <p className="text-stone-400 text-sm">{instructor.skills[0]?.name ?? 'Instructor'}</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white text-xs font-medium">{instructor.user.name}</span>
            <Mic size={11} className="text-stone-300 ml-0.5" />
          </div>
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-56 bg-stone-900 border-l border-stone-700 flex flex-col p-4 gap-3 flex-shrink-0">
            <p className="text-stone-400 text-xs font-semibold uppercase tracking-wide">Participants (2)</p>
            {[
              { name: instructor.user.name, avatarUrl: instructor.user.avatarUrl, role: 'Instructor', mic: true },
              { name: user?.name ?? 'You', avatarUrl: user?.avatarUrl, role: 'You', mic: micOn },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-kala-amber flex items-center justify-center text-white text-xs font-bold">
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.name}</p>
                  <p className="text-stone-500 text-[10px]">{p.role}</p>
                </div>
                {p.mic ? <Mic size={12} className="text-stone-400 flex-shrink-0" /> : <MicOff size={12} className="text-red-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Self-view PiP */}
        <div className="absolute bottom-4 right-4 w-36 h-24 rounded-2xl overflow-hidden border-2 border-stone-600 shadow-2xl bg-stone-700 flex items-center justify-center">
          {camOn ? (
            <div className="w-full h-full bg-gradient-to-br from-kala-amber/20 to-stone-700 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-kala-amber flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0) ?? 'Y'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-stone-500">
              <VideoOff size={18} />
              <span className="text-[10px]">Camera off</span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[10px] text-white/70">You</div>
        </div>

        {handRaised && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-2xl shadow-lg animate-bounce">
            ✋ Hand raised
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 bg-black/40 backdrop-blur-sm py-4 px-6">
        <div className="flex items-center justify-center gap-4">
          <CtrlBtn
            icon={micOn ? <Mic size={20} /> : <MicOff size={20} />}
            label={micOn ? 'Mute' : 'Unmute'}
            active={micOn}
            onClick={() => setMicOn((v) => !v)}
          />
          <CtrlBtn
            icon={camOn ? <Video size={20} /> : <VideoOff size={20} />}
            label={camOn ? 'Stop video' : 'Start video'}
            active={camOn}
            onClick={() => setCamOn((v) => !v)}
          />
          {/* <CtrlBtn icon={<MonitorUp size={20} />} label="Share screen" />
          <CtrlBtn
            icon={<Hand size={20} />}
            label={handRaised ? 'Lower hand' : 'Raise hand'}
            active={!handRaised}
            onClick={() => setHandRaised((v) => !v)}
          />
          <CtrlBtn
            icon={<MessageSquare size={20} />}
            label="Chat"
            onClick={() => navigate(`/dashboard/bookings/${booking.id}/chat`)}
          /> */}
          <CtrlBtn
            icon={<PhoneOff size={22} />}
            label="End call"
            danger
            size="lg"
            onClick={handleEndCall}
          />
        </div>
      </div>

    </div>
  )
}
