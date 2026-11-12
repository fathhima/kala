import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Loader2,
  Lock,
  MessageSquare,
  Search,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/store';
import { cn, formatDate } from '@/lib/utils';
import type { ChatRoomListItem } from '../api';
import { useChatRoomsQuery } from '../hooks/useChatQueries';
import { SessionChatPanel } from './SessionChatPanel';

type InboxFilter = 'ALL' | 'ACTIVE' | 'ARCHIVED';

function formatRelativeTime(isoDate?: string | null): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface ConversationRowProps {
  room: ChatRoomListItem;
  role: 'STUDENT' | 'INSTRUCTOR';
  currentUserId?: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ConversationRow({
  room,
  role,
  currentUserId,
  isSelected,
  onSelect,
}: ConversationRowProps) {
  const counterpart = role === 'STUDENT' ? room.instructor : room.student;
  const counterpartName =
    counterpart?.name || (role === 'STUDENT' ? 'Instructor' : 'Learner');
  const counterpartImage =
    typeof counterpart?.imageUrl === 'string' ? counterpart.imageUrl : undefined;
  const offeringTitle = room.offeringTitle || 'Creative Session';
  const timestamp = formatRelativeTime(room.lastMessageAt ?? room.createdAt);

  let preview = 'No messages yet · Start chatting';
  if (room.lastMessage) {
    if (room.lastMessage.type === 'SYSTEM') {
      preview = room.lastMessage.content;
    } else if (room.lastMessage.senderId === currentUserId) {
      preview = `You: ${room.lastMessage.content}`;
    } else {
      preview = room.lastMessage.content;
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left px-4 py-3.5 border-b border-stone-100 transition-colors flex items-start gap-3 hover:bg-stone-50',
        isSelected &&
          'bg-kala-amber/10 hover:bg-kala-amber/10 border-l-4 border-l-kala-amber pl-3',
      )}
    >
      <div className="relative shrink-0 mt-0.5">
        <Avatar name={counterpartName} src={counterpartImage} size="md" />
        {room.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-kala-amber text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {room.unreadCount > 99 ? '99+' : room.unreadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm truncate',
              room.unreadCount > 0
                ? 'font-bold text-stone-900'
                : 'font-semibold text-stone-800',
            )}
          >
            {counterpartName}
          </p>
          {timestamp && (
            <span
              className={cn(
                'text-[11px] shrink-0',
                room.unreadCount > 0
                  ? 'text-kala-terracotta font-semibold'
                  : 'text-stone-400',
              )}
            >
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 min-w-0">
          <span className="truncate font-medium text-stone-600">
            {offeringTitle}
          </span>
          <span className="text-stone-300">·</span>
          <span className="shrink-0">{formatDate(room.slotStartTime)}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-xs truncate',
              room.unreadCount > 0
                ? 'text-stone-800 font-medium'
                : 'text-stone-400',
            )}
          >
            {preview}
          </p>

          {!room.canWrite && (
            <span
              className="inline-flex items-center gap-0.5 text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full shrink-0"
              title="Read-only"
            >
              <Lock size={9} />
              Archived
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function MessagesInbox({ role }: { role: 'STUDENT' | 'INSTRUCTOR' }) {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedBookingId = searchParams.get('bookingId');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InboxFilter>('ALL');

  const {
    data: roomsData,
    isLoading,
    isError,
    refetch,
  } = useChatRoomsQuery(role);
  const rooms: ChatRoomListItem[] = roomsData ?? [];

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rooms.filter((room) => {
      if (filter === 'ACTIVE' && !room.canWrite) return false;
      if (filter === 'ARCHIVED' && room.canWrite) return false;

      if (!query) return true;
      const counterpart = role === 'STUDENT' ? room.instructor : room.student;
      const nameMatch = counterpart?.name?.toLowerCase().includes(query);
      const offeringMatch = room.offeringTitle?.toLowerCase().includes(query);
      return Boolean(nameMatch || offeringMatch);
    });
  }, [rooms, filter, search, role]);

  const activeBookingId = useMemo(() => {
    if (requestedBookingId && rooms.some((r) => r.bookingId === requestedBookingId)) {
      return requestedBookingId;
    }
    return null;
  }, [requestedBookingId, rooms]);

  // On desktop, auto-select the first room when none is explicitly chosen
  const desktopSelectedBookingId =
    activeBookingId ?? filteredRooms[0]?.bookingId ?? null;

  useEffect(() => {
    if (
      requestedBookingId &&
      !isLoading &&
      rooms.length > 0 &&
      !rooms.some((r) => r.bookingId === requestedBookingId)
    ) {
      setSearchParams({}, { replace: true });
    }
  }, [requestedBookingId, isLoading, rooms, setSearchParams]);

  const handleSelectRoom = (bookingId: string) => {
    setSearchParams({ bookingId });
  };

  const handleClearSelection = () => {
    setSearchParams({});
  };

  const activeCount = rooms.filter((r) => r.canWrite).length;
  const archivedCount = rooms.length - activeCount;

  const selectedRoomForDesktop = rooms.find(
    (r) => r.bookingId === desktopSelectedBookingId,
  );
  const selectedRoomForMobile = rooms.find(
    (r) => r.bookingId === activeBookingId,
  );

  const getDetailsPath = (bookingId: string) =>
    role === 'STUDENT'
      ? `/dashboard/bookings/${bookingId}`
      : `/instructor/sessions/${bookingId}`;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-kala-amber" />
        <p className="text-sm text-stone-500 font-medium">
          Loading your conversations...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white border border-red-100 rounded-2xl p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle size={20} />
        </div>
        <p className="font-semibold text-stone-800">Failed to load messages</p>
        <p className="text-sm text-stone-500">
          Something went wrong while fetching your session chats.
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-white border border-dashed border-stone-200 rounded-2xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-kala-amber flex items-center justify-center mx-auto">
          <MessageSquare size={22} />
        </div>
        <h2 className="text-lg font-bold text-kala-brown">No chats yet</h2>
        <p className="text-sm text-stone-500">
          {role === 'STUDENT'
            ? 'Once you have a confirmed booking, a conversation with your instructor will appear here.'
            : 'Once a student completes a booking with you, their conversation will appear here.'}
        </p>
        <div className="pt-2">
          <Link to={role === 'STUDENT' ? '/instructors' : '/instructor/slots'}>
            <Button size="sm" className="gap-1.5">
              <Calendar size={14} />
              {role === 'STUDENT' ? 'Browse Instructors' : 'Manage Slots'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
      {/* Left pane: Conversation List */}
      <aside
        className={cn(
          'w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col bg-white shrink-0',
          activeBookingId ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-kala-brown">Messages</h1>
            <span className="text-xs font-medium text-stone-400">
              {rooms.length} {rooms.length === 1 ? 'session' : 'sessions'}
            </span>
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                role === 'STUDENT'
                  ? 'Search instructor or topic...'
                  : 'Search student or topic...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-kala-amber/40 focus:border-kala-amber transition-colors"
            />
          </div>

          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {(
              [
                { key: 'ALL', label: 'All', count: rooms.length },
                { key: 'ACTIVE', label: 'Active', count: activeCount },
                { key: 'ARCHIVED', label: 'Archived', count: archivedCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1',
                  filter === tab.key
                    ? 'bg-white text-kala-brown shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800',
                )}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-stone-400">
              <MessageSquare size={22} className="mx-auto opacity-50" />
              <p className="text-xs font-medium">
                No matching conversations found.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected =
                room.bookingId ===
                (activeBookingId ?? desktopSelectedBookingId);
              return (
                <ConversationRow
                  key={room.id}
                  room={room}
                  role={role}
                  currentUserId={user?.id}
                  isSelected={isSelected}
                  onSelect={() => handleSelectRoom(room.bookingId)}
                />
              );
            })
          )}
        </div>
      </aside>

      {/* Right pane (Desktop): Active chat thread */}
      <section className="hidden md:flex flex-1 flex-col min-w-0">
        {desktopSelectedBookingId ? (
          <SessionChatPanel
            key={desktopSelectedBookingId}
            bookingId={desktopSelectedBookingId}
            role={role}
            roomHint={selectedRoomForDesktop}
            detailsTo={getDetailsPath(desktopSelectedBookingId)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 text-stone-400 gap-2 p-6">
            <MessageSquare size={28} className="opacity-40" />
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs">
              Choose a session from the left to view or send messages.
            </p>
          </div>
        )}
      </section>

      {/* Mobile active thread */}
      {activeBookingId && (
        <section className="flex md:hidden flex-1 flex-col min-w-0">
          <SessionChatPanel
            key={activeBookingId}
            bookingId={activeBookingId}
            role={role}
            roomHint={selectedRoomForMobile}
            detailsTo={getDetailsPath(activeBookingId)}
            onBack={handleClearSelection}
          />
        </section>
      )}
    </div>
  );
}
