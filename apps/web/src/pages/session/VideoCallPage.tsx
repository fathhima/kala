import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Loader2,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useVideoSessionQuery } from '@/features/video-call';
import { useWebRTC } from '@/features/video-call';
import { useCompleteBookingMutation } from '@/features/booking/hooks';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function CtrlBtn({
  icon,
  label,
  active = true,
  danger = false,
  highlight = false,
  onClick,
  size = 'md',
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  size?: 'md' | 'lg';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-1.5 group transition-all focus:outline-none"
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-all shadow-md',
          size === 'lg' ? 'w-14 h-14' : 'w-12 h-12',
          highlight
            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-lg shadow-amber-500/30'
            : danger
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : active
            ? 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-[11px] font-medium transition-colors leading-none',
          highlight
            ? 'text-amber-400 font-semibold'
            : 'text-stone-400 group-hover:text-stone-300',
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const bookingId = id || '';

  const {
    data: sessionAccess,
    isLoading: isAccessLoading,
    error: accessError,
    refetch: refetchAccess,
  } = useVideoSessionQuery(bookingId);

  const completeBookingMutation = useCompleteBookingMutation();

  // Modals & Panels
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Student Review Form state
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Instructor Complete Modal state
  const [isCompleting, setIsCompleting] = useState(false);

  // WebRTC Hook
  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isPeerPresent,
    connectionState,
    micOn,
    camOn,
    isScreenSharing,
    peerMediaState,
    elapsedSeconds,
    mediaError,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    endCall,
  } = useWebRTC({
    bookingId,
    iceServers: sessionAccess?.iceServers,
    enabled: Boolean(sessionAccess?.canJoin),
    currentUserRole: sessionAccess?.currentUserRole,
    onSessionEnded: () => {
      setShowEndModal(true);
    },
  });

  const isInstructor = sessionAccess?.currentUserRole === 'INSTRUCTOR';
  const partnerImageUrl =
    typeof sessionAccess?.partner?.imageUrl === 'string'
      ? sessionAccess.partner.imageUrl
      : undefined;

  const chatRoute = isInstructor
    ? `/instructor/sessions/${bookingId}/chat`
    : `/dashboard/bookings/${bookingId}/chat`;
  const dashboardRoute = isInstructor ? '/instructor/sessions' : '/dashboard/bookings';

  const handleEndCallClick = () => {
    endCall();
    setShowEndModal(true);
  };

  const handleInstructorComplete = async () => {
    setIsCompleting(true);
    try {
      await completeBookingMutation.mutateAsync(bookingId);
      navigate('/instructor/sessions');
    } catch (err) {
      console.error('Failed to mark session as complete:', err);
      setIsCompleting(false);
    }
  };

  const handleStudentSubmitReview = async () => {
    if (rating === 0) return;
    setReviewSubmitting(true);
    // Short delay for natural feel before redirecting
    await new Promise((r) => setTimeout(r, 600));
    setReviewSubmitting(false);
    setReviewSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard/bookings');
    }, 1500);
  };

  // 1. Loading State
  if (isAccessLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-kala-amber" />
        <p className="text-stone-400 text-sm">Preparing secure video session...</p>
      </div>
    );
  }

  // 2. Error or Not Found
  if (accessError || !sessionAccess) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Session Unavailable</h2>
          <p className="text-stone-400 text-sm">
            {accessError instanceof Error
              ? accessError.message
              : 'Could not retrieve video session details or you are not authorized to join.'}
          </p>
          <div className="pt-2">
            <Link to={dashboardRoute}>
              <Button variant="outline" className="w-full border-stone-700 text-stone-300 hover:bg-stone-800">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Early Waiting Lobby (Room not yet open)
  if (!sessionAccess.canJoin && sessionAccess.status === 'UPCOMING') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-kala-amber/10 flex items-center justify-center mx-auto text-kala-amber">
            <Clock size={28} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Session Scheduled</h2>
            <p className="text-stone-400 text-sm font-medium">{sessionAccess.sessionTitle}</p>
          </div>

          <div className="bg-stone-950/60 rounded-2xl p-4 border border-stone-800 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Avatar
                name={sessionAccess.partner.name}
                src={partnerImageUrl}
                size="md"
              />
              <div>
                <p className="text-xs text-stone-500 uppercase font-semibold">
                  {sessionAccess.partner.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                </p>
                <p className="text-white text-sm font-semibold">{sessionAccess.partner.name}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-stone-800/80 text-xs text-stone-400 space-y-1">
              <p>
                <span className="text-stone-500">Scheduled:</span>{' '}
                {new Date(sessionAccess.slotStartTime).toLocaleString()}
              </p>
              <p className="text-amber-400">
                • Room opens 10 minutes prior to session start.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => refetchAccess()}
              className="w-full bg-kala-amber hover:bg-amber-500 text-white font-medium"
            >
              Check Room Status
            </Button>
            <Link to={dashboardRoute}>
              <Button
                variant="outline"
                className="w-full border-stone-700 text-stone-300 hover:bg-stone-800"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Inactive or Expired Room
  if (!sessionAccess.canJoin) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              {sessionAccess.status === 'COMPLETED' ? 'Session Completed' : 'Session Closed'}
            </h2>
            <p className="text-stone-400 text-sm">
              {sessionAccess.reason || 'This video room is no longer active.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link to={chatRoute}>
              <Button className="w-full gap-2 bg-kala-amber hover:bg-amber-500 text-white">
                <MessageSquare size={16} /> Open Session Chat
              </Button>
            </Link>
            <Link to={dashboardRoute}>
              <Button
                variant="outline"
                className="w-full border-stone-700 text-stone-300 hover:bg-stone-800"
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Post-Call Modal / Review Overlay
  if (showEndModal) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          {/* Student Flow: Review Form */}
          {!isInstructor ? (
            reviewSubmitted ? (
              <div className="bg-white rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Thank you!</h2>
                  <p className="text-stone-500 text-sm mt-1">Your feedback has been recorded.</p>
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
                <p className="text-xs text-stone-400">Returning to your bookings…</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-6 pt-6 pb-5 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Avatar
                      name={sessionAccess.partner.name}
                      src={partnerImageUrl}
                      size="md"
                    />
                    <div className="text-left">
                      <p className="font-semibold text-stone-900">{sessionAccess.partner.name}</p>
                      <p className="text-xs text-stone-500">
                        {sessionAccess.sessionTitle} · {formatElapsed(elapsedSeconds)}
                      </p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">How was your session?</h2>
                  <p className="text-stone-500 text-sm mt-0.5">Your feedback helps your instructor grow</p>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const val = i + 1;
                        const filled = val <= (hoveredStar || rating);
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
                              size={34}
                              className={cn(
                                'transition-colors',
                                filled
                                  ? 'text-kala-amber fill-kala-amber'
                                  : 'text-stone-200 fill-stone-200',
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-medium text-kala-amber h-4">
                      {STAR_LABELS[(hoveredStar || rating) - 1] ?? ''}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                      Feedback Note <span className="text-stone-400 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share what you learned or how the instructor helped..."
                      rows={3}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-kala-amber focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      disabled={rating === 0 || reviewSubmitting}
                      onClick={handleStudentSubmitReview}
                      className={cn(
                        'w-full py-3 rounded-2xl text-sm font-semibold transition-all',
                        rating > 0 && !reviewSubmitting
                          ? 'bg-kala-amber text-white hover:bg-amber-500 shadow-md'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed',
                      )}
                    >
                      {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/bookings')}
                      className="w-full py-2.5 rounded-2xl text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      Skip and return to bookings
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Instructor Flow: Complete Session Modal */
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={30} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Call Ended</h2>
                <p className="text-stone-400 text-sm">
                  You spent <strong className="text-white">{formatElapsed(elapsedSeconds)}</strong> with{' '}
                  <strong className="text-white">{sessionAccess.partner.name}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <Button
                  onClick={handleInstructorComplete}
                  disabled={isCompleting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl gap-2 shadow-lg"
                >
                  {isCompleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Mark Session as Completed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/instructor/sessions')}
                  className="w-full border-stone-700 text-stone-300 hover:bg-stone-800 rounded-2xl"
                >
                  Leave without completing
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. Active WebRTC Call Room
  return (
    <div className="h-screen h-[100dvh] bg-stone-950 flex flex-col select-none overflow-hidden text-white font-sans">
      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 bg-black/50 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <Link
            to={dashboardRoute}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="Leave room"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-white text-sm font-semibold leading-tight">
              {sessionAccess.sessionTitle}
            </h1>
            <p className="text-stone-400 text-xs">
              with {sessionAccess.partner.name} ({sessionAccess.partner.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'})
            </p>
          </div>
          <span className="ml-2 px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono text-xs border border-stone-700">
            {formatElapsed(elapsedSeconds)}
          </span>
          {sessionAccess.isOvertime && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30">
              <Clock size={11} /> 15m wrap-up buffer active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={chatRoute}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-medium transition-colors"
          >
            <MessageSquare size={13} className="text-kala-amber" />
            <span className="hidden sm:inline">Session Chat</span>
            <ExternalLink size={10} className="text-stone-500" />
          </Link>

          <button
            type="button"
            onClick={() => setShowParticipants((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
              showParticipants
                ? 'bg-kala-amber text-white'
                : 'bg-white/5 hover:bg-white/10 text-stone-300',
            )}
          >
            <Users size={13} /> {isPeerPresent ? '2' : '1'}
          </button>
        </div>
      </div>

      {/* ── Media Warning Banner (if camera or mic blocked) ── */}
      {mediaError && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-300 z-20">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Device Notice: {mediaError}. Check your browser permissions.</span>
        </div>
      )}

      {/* ── Main Video Area ── */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Remote Participant View */}
        <div className="flex-1 relative flex items-center justify-center bg-stone-900 overflow-hidden">
          {/* Remote Video Stream Element - Always kept mounted so audio stream is never cut off */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={cn(
              'w-full h-full transition-all duration-300',
              peerMediaState.isScreenSharing
                ? 'object-contain bg-black'
                : 'object-cover',
              (!isPeerPresent || (peerMediaState.isCameraOff && !peerMediaState.isScreenSharing))
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100',
            )}
          />

          {/* Remote Peer Screen Sharing Badge */}
          {isPeerPresent && peerMediaState.isScreenSharing && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs shadow-xl backdrop-blur-md">
              <MonitorUp size={14} className="stroke-[2.5]" />
              <span>{sessionAccess.partner.name} is sharing screen</span>
            </div>
          )}

          {/* Local User Screen Sharing Overlay Banner */}
          {isScreenSharing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500 text-stone-950 shadow-2xl font-medium text-xs">
              <MonitorUp size={16} className="animate-pulse" />
              <span>You are sharing your screen</span>
              <button
                type="button"
                onClick={toggleScreenShare}
                className="px-2.5 py-1 rounded-xl bg-stone-950 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
              >
                Stop Sharing
              </button>
            </div>
          )}

          {/* Fallback View: Remote peer not present or camera off (and not screen sharing) */}
          {(!isPeerPresent || (peerMediaState.isCameraOff && !peerMediaState.isScreenSharing)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center max-w-sm mx-auto z-10 pointer-events-auto">
              <div className="relative">
                <Avatar
                  name={sessionAccess.partner.name}
                  src={partnerImageUrl}
                  size="xl"
                  className="w-24 h-24 ring-4 ring-white/10 shadow-2xl text-2xl"
                />
                {isPeerPresent && peerMediaState.isMuted && (
                  <div className="absolute bottom-0 right-0 p-1.5 bg-red-500 rounded-full text-white shadow-md">
                    <MicOff size={14} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-white font-semibold text-lg">{sessionAccess.partner.name}</p>
                <p className="text-stone-400 text-xs">
                  {!isPeerPresent
                    ? 'Waiting for partner to join the room...'
                    : 'Camera is currently turned off'}
                </p>
              </div>
              {!isPeerPresent && (
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Room is open and ready. They will connect automatically.
                </div>
              )}
            </div>
          )}

          {/* Remote Indicators Overlay (Bottom Left) */}
          {isPeerPresent && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white text-xs font-medium">{sessionAccess.partner.name}</span>
              {peerMediaState.isMuted ? (
                <MicOff size={12} className="text-red-400 ml-1" />
              ) : (
                <Mic size={12} className="text-stone-300 ml-1" />
              )}
              {peerMediaState.isScreenSharing && (
                <span title="Sharing screen">
                  <MonitorUp size={12} className="text-kala-amber ml-1" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Participants Side Panel */}
        {showParticipants && (
          <div className="w-64 bg-stone-900 border-l border-white/10 flex flex-col p-4 gap-3 flex-shrink-0 z-20">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">
                In Session ({isPeerPresent ? '2' : '1'})
              </span>
            </div>

            <div className="space-y-3">
              {/* Local User */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
                <Avatar
                  name={user?.name || 'You'}
                  src={user?.imageUrl || undefined}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{user?.name || 'You'} (You)</p>
                  <p className="text-stone-500 text-[10px] uppercase font-semibold">
                    {sessionAccess.currentUserRole}
                  </p>
                </div>
                {micOn ? <Mic size={13} className="text-stone-400" /> : <MicOff size={13} className="text-red-400" />}
              </div>

              {/* Partner */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5">
                <Avatar
                  name={sessionAccess.partner.name}
                  src={partnerImageUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{sessionAccess.partner.name}</p>
                  <p className="text-stone-500 text-[10px] uppercase font-semibold">
                    {sessionAccess.partner.role}
                  </p>
                </div>
                {isPeerPresent ? (
                  peerMediaState.isMuted ? (
                    <MicOff size={13} className="text-red-400" />
                  ) : (
                    <Mic size={13} className="text-stone-400" />
                  )
                ) : (
                  <span className="text-[10px] text-amber-500 font-medium">Waiting...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Self-View PiP Floating Window ── */}
        <div className="absolute bottom-4 right-4 w-40 sm:w-48 h-28 sm:h-32 rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 shadow-2xl z-10 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={cn('w-full h-full object-cover -scale-x-100', !camOn && 'hidden')}
          />
          {!camOn && (
            <div className="flex flex-col items-center gap-1 text-stone-500">
              <VideoOff size={20} />
              <span className="text-[10px] font-medium">Camera off</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white flex items-center gap-1.5">
            <span>You</span>
            {isScreenSharing && (
              <span className="text-[9px] text-amber-400 font-semibold uppercase bg-amber-400/20 px-1 py-0.2 rounded">
                Sharing
              </span>
            )}
            {!micOn && <MicOff size={10} className="text-red-400" />}
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar ── */}
      <div className="flex-shrink-0 bg-black/60 backdrop-blur-md py-4 px-6 border-t border-white/5 z-20">
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <CtrlBtn
            icon={micOn ? <Mic size={20} /> : <MicOff size={20} />}
            label={micOn ? 'Mute' : 'Unmute'}
            active={micOn}
            onClick={toggleMic}
          />

          <CtrlBtn
            icon={camOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            label={camOn ? 'Stop Video' : 'Start Video'}
            active={camOn}
            onClick={toggleCam}
          />

          <CtrlBtn
            icon={<MonitorUp size={20} />}
            label={isScreenSharing ? 'Stop Share' : 'Share Screen'}
            highlight={isScreenSharing}
            onClick={toggleScreenShare}
          />

          <CtrlBtn
            icon={<MessageSquare size={20} />}
            label="Chat"
            onClick={() => window.open(chatRoute, '_blank')}
          />

          <CtrlBtn
            icon={<PhoneOff size={22} />}
            label="End Call"
            danger
            size="lg"
            onClick={handleEndCallClick}
          />
        </div>
      </div>
    </div>
  );
}
