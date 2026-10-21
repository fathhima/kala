import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Lock, Loader2, Circle, Video } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { useBookingQuery } from '@/features/booking/hooks';
import { useChatRoom } from '@/features/chat';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import type { ChatMessageDto } from '@/api';

function groupByDate(messages: ChatMessageDto[]) {
  const groups: { date: string; messages: ChatMessageDto[] }[] = [];
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
}

export function BookingChat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data: booking, isLoading: isBookingLoading } = useBookingQuery(id ?? '');
  const {
    messages,
    isLoading: isChatLoading,
    isConnected,
    canWrite,
    readOnlyReason,
    isOtherTyping,
    sendMessage,
    sendTyping,
    markAsRead,
  } = useChatRoom(id ?? '');

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const grouped = groupByDate(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOtherTyping]);

  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !canWrite) return;
    setInput('');
    sendTyping(false);
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  if (isBookingLoading || isChatLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-kala-amber" />
        <p className="text-sm text-stone-500 font-medium">Loading session conversation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Booking not found.</p>
        <Link to="/dashboard/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const instructorName = typeof booking.instructor?.name === 'string' ? booking.instructor.name : 'Instructor';
  const instructorImage = typeof booking.instructor?.imageUrl === 'string' ? booking.instructor.imageUrl : undefined;
  const offeringTitle = typeof booking.offering?.title === 'string' ? booking.offering.title : 'Session';

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)] bg-stone-50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/bookings/${booking.id}`}
            className="p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
            title="Back to details"
          >
            <ArrowLeft size={18} />
          </Link>

          <Avatar
            name={instructorName}
            src={instructorImage}
            size="sm"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900 text-sm truncate">
                {instructorName}
              </p>
              <span
                className="flex items-center gap-1 text-[11px] font-medium"
                title={isConnected ? 'Real-time connected' : 'Connecting...'}
              >
                <Circle
                  size={7}
                  className={cn(
                    'fill-current',
                    isConnected ? 'text-emerald-500' : 'text-amber-500 animate-pulse',
                  )}
                />
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate">
              {offeringTitle} · {formatDate(booking.slot.startTime)}
            </p>
          </div>

          {booking.status === 'CONFIRMED' && (
            <Link
              to={`/session/${booking.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kala-amber hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Join live video room"
            >
              <Video size={14} />
              <span className="hidden sm:inline">Join Call</span>
            </Link>
          )}

          <span
            className={cn(
              'flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium',
              booking.status === 'CONFIRMED'
                ? 'bg-green-100 text-green-700'
                : booking.status === 'COMPLETED'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-stone-100 text-stone-500',
            )}
          >
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* ── Read-Only Notice Banner ── */}
      {!canWrite && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-800">
          <Lock size={13} className="shrink-0 text-amber-600" />
          <span>{readOnlyReason ?? 'This conversation is currently archived in read-only mode.'}</span>
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2 pt-16">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs border border-stone-100">
              <Send size={20} className="text-stone-300" />
            </div>
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs text-stone-400">Ask questions or share preparation details with your instructor.</p>
          </div>
        )}

        {grouped.map(({ date, messages: dayMessages }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium px-2 py-0.5 bg-stone-100 rounded-full">
                {new Date(date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="space-y-3">
              {dayMessages.map((msg) => {
                if (msg.type === 'SYSTEM') {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="bg-stone-200/70 text-stone-600 text-xs px-3.5 py-1.5 rounded-full max-w-md text-center leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                const isMine = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : '')}
                  >
                    {!isMine && (
                      <Avatar
                        name={typeof msg.sender?.name === 'string' ? msg.sender.name : instructorName}
                        src={typeof msg.sender?.imageUrl === 'string' ? msg.sender.imageUrl : undefined}
                        size="sm"
                        className="flex-shrink-0 mb-0.5"
                      />
                    )}

                    <div className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
                      {!isMine && (
                        <span className="text-xs text-stone-400 px-1">{msg.sender?.name}</span>
                      )}

                      <div
                        className={cn(
                          'max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-2xs',
                          isMine
                            ? 'bg-kala-amber text-white rounded-tr-xs'
                            : 'bg-white text-stone-800 rounded-tl-xs border border-stone-200/70',
                        )}
                      >
                        {msg.content}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-stone-400 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                        {isMine && msg.isRead && (
                          <span className="text-emerald-600 font-bold ml-1">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs text-stone-400 italic px-2">
            <span className="inline-flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{instructorName} is typing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-stone-200 px-4 py-3">
        {canWrite ? (
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message to instructor…"
              className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-kala-amber focus:bg-white transition-colors"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim()}
              className="rounded-2xl px-4 py-2.5 flex-shrink-0 shadow-xs"
            >
              <Send size={15} />
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-stone-400 flex items-center justify-center gap-2">
            <Lock size={13} />
            <span>Chat is closed for new messages.</span>
          </div>
        )}
      </div>

    </div>
  );
}
