import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Circle,
  ExternalLink,
  Loader2,
  Lock,
  Send,
  Video,
} from 'lucide-react';
import type { ChatMessageDto } from '@/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { cn, formatDate } from '@/lib/utils';
import type { ChatRoomListItem } from '../api';
import { useChatRoom } from '../hooks/useChatRoom';

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

export interface SessionChatPanelProps {
  bookingId: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  roomHint?: ChatRoomListItem;
  backTo?: string;
  detailsTo?: string;
  onBack?: () => void;
  className?: string;
}

export function SessionChatPanel({
  bookingId,
  role,
  roomHint,
  backTo,
  detailsTo,
  onBack,
  className,
}: SessionChatPanelProps) {
  const { user } = useAuthStore();
  const {
    messages,
    isLoading,
    isConnected,
    canWrite,
    readOnlyReason,
    isOtherTyping,
    room,
    sendMessage,
    sendTyping,
    markAsRead,
  } = useChatRoom(bookingId);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoom = room ?? roomHint;
  const grouped = groupByDate(messages);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (isLoading && !activeRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-3 bg-stone-50">
        <Loader2 className="w-7 h-7 animate-spin text-kala-amber" />
        <p className="text-sm text-stone-500 font-medium">
          Loading session conversation...
        </p>
      </div>
    );
  }

  if (!activeRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-3 bg-stone-50 px-4 text-center">
        <p className="text-sm text-stone-500">Conversation not found.</p>
        {backTo && (
          <Link to={backTo}>
            <Button variant="outline" size="sm">
              Go Back
            </Button>
          </Link>
        )}
      </div>
    );
  }

  const counterpart =
    role === 'STUDENT' ? activeRoom.instructor : activeRoom.student;
  const counterpartName =
    counterpart?.name || (role === 'STUDENT' ? 'Instructor' : 'Learner');
  const counterpartImage =
    typeof counterpart?.imageUrl === 'string' ? counterpart.imageUrl : undefined;
  const offeringTitle = activeRoom.offeringTitle || 'Session';
  const statusLabel =
    activeRoom.bookingStatus.charAt(0) +
    activeRoom.bookingStatus.slice(1).toLowerCase();

  return (
    <div className={cn('flex flex-col h-full bg-stone-50', className)}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 px-4 sm:px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} />
            </button>
          ) : backTo ? (
            <Link
              to={backTo}
              className="p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
              title="Back to details"
            >
              <ArrowLeft size={18} />
            </Link>
          ) : null}

          <Avatar name={counterpartName} src={counterpartImage} size="sm" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-stone-900 text-sm truncate">
                {counterpartName}
              </p>
              <span
                className="flex items-center gap-1 text-[11px] font-medium"
                title={isConnected ? 'Real-time connected' : 'Connecting...'}
              >
                <Circle
                  size={7}
                  className={cn(
                    'fill-current',
                    isConnected
                      ? 'text-emerald-500'
                      : 'text-amber-500 animate-pulse',
                  )}
                />
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate">
              {offeringTitle} · {formatDate(activeRoom.slotStartTime)}
            </p>
          </div>

          {detailsTo && (
            <Link
              to={detailsTo}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 text-xs font-medium transition-colors"
              title="View booking details"
            >
              <span>Details</span>
              <ExternalLink size={12} />
            </Link>
          )}

          {activeRoom.bookingStatus === 'CONFIRMED' && (
            <Link
              to={`/session/${activeRoom.bookingId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-kala-amber hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Join live video room"
            >
              <Video size={14} />
              <span className="hidden sm:inline">Join Call</span>
            </Link>
          )}

          <span
            className={cn(
              'hidden sm:inline-flex flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium',
              activeRoom.bookingStatus === 'CONFIRMED'
                ? 'bg-green-100 text-green-700'
                : activeRoom.bookingStatus === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-stone-100 text-stone-500',
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Read-only banner */}
      {!canWrite && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-800">
          <Lock size={13} className="shrink-0 text-amber-600" />
          <span>
            {readOnlyReason ??
              'This conversation is currently archived in read-only mode.'}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-kala-amber" />
            <p className="text-xs">Loading messages...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2 pt-12">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs border border-stone-100">
              <Send size={20} className="text-stone-300" />
            </div>
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xs text-stone-400 text-center max-w-xs">
              {role === 'STUDENT'
                ? 'Ask questions or share preparation details with your instructor.'
                : 'Send welcome notes, preparation tips, or session instructions to your student.'}
            </p>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMessages }) => (
            <div key={date}>
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
                      className={cn(
                        'flex items-end gap-2',
                        isMine ? 'flex-row-reverse' : '',
                      )}
                    >
                      {!isMine && (
                        <Avatar
                          name={
                            typeof msg.sender?.name === 'string'
                              ? msg.sender.name
                              : counterpartName
                          }
                          src={
                            typeof msg.sender?.imageUrl === 'string'
                              ? msg.sender.imageUrl
                              : undefined
                          }
                          size="sm"
                          className="flex-shrink-0 mb-0.5"
                        />
                      )}

                      <div
                        className={cn(
                          'flex flex-col gap-0.5',
                          isMine ? 'items-end' : 'items-start',
                        )}
                      >
                        {!isMine && (
                          <span className="text-xs text-stone-400 px-1">
                            {msg.sender?.name}
                          </span>
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
                            {new Date(msg.createdAt).toLocaleTimeString(
                              'en-IN',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              },
                            )}
                          </span>
                          {isMine && msg.isRead && (
                            <span className="text-emerald-600 font-bold ml-1">
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs text-stone-400 italic px-2">
            <span className="inline-flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{counterpartName} is typing...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-stone-200 px-4 py-3">
        {canWrite ? (
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                role === 'STUDENT'
                  ? 'Type your message to instructor…'
                  : 'Type your message to student…'
              }
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
