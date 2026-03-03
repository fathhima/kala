import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { cn, formatDate } from '../../lib/utils'

type Message = {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = []
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString()
    const last = groups[groups.length - 1]
    if (last && last.date === date) {
      last.messages.push(msg)
    } else {
      groups.push({ date, messages: [msg] })
    }
  }
  return groups
}

export function BookingChat() {
  const { id } = useParams()
  const { bookings } = useBookingStore()
  const { user } = useAuthStore()

  const booking = bookings.find((b) => b.id === id)

  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allMessages: Message[] = booking
    ? [...booking.messages, ...localMessages]
    : localMessages

  const grouped = groupByDate(allMessages)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 mb-4">Booking not found.</p>
        <Link to="/dashboard/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>
    )
  }

  const send = () => {
    const text = input.trim()
    if (!text || !user) return
    setLocalMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        content: text,
        createdAt: new Date().toISOString(),
      },
    ])
    setInput('')
    inputRef.current?.focus()
  }

  const instructor = booking.instructor

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)]">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-stone-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/dashboard/bookings/${booking.id}`}
            className="p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
          >
            <ArrowLeft size={18} />
          </Link>

          <Avatar
            name={instructor.user.name}
            src={instructor.user.avatarUrl}
            size="sm"
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-stone-800 text-sm truncate">
              {instructor.user.name}
            </p>
            <p className="text-xs text-stone-400 truncate">
              {instructor.skills[0]?.name} · {formatDate(booking.slot.startTime)}
            </p>
          </div>

          <span
            className={cn(
              'flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium',
              booking.status === 'CONFIRMED'
                ? 'bg-green-100 text-green-700'
                : booking.status === 'COMPLETED'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-stone-100 text-stone-500'
            )}
          >
            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 bg-stone-50">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2 pt-10">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
              <Send size={20} className="text-stone-300" />
            </div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}

        {grouped.map(({ date, messages }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 flex-shrink-0">
                {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === user?.id
                return (
                  <div
                    key={msg.id}
                    className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : '')}
                  >
                    {!isMine && (
                      <Avatar name={msg.senderName} size="sm" className="flex-shrink-0 mb-0.5" />
                    )}
                    <div className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
                      {!isMine && (
                        <span className="text-xs text-stone-400 px-1">{msg.senderName}</span>
                      )}
                      <div
                        className={cn(
                          'max-w-xs sm:max-w-sm px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          isMine
                            ? 'bg-kala-amber text-white rounded-tr-sm'
                            : 'bg-white text-stone-700 rounded-tl-sm shadow-sm border border-stone-100'
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-stone-400 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="flex-shrink-0 bg-white border-t border-stone-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message…"
            className="flex-1 text-sm px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-kala-amber focus:bg-white transition-colors"
          />
          <Button
            size="sm"
            onClick={send}
            disabled={!input.trim()}
            className="rounded-2xl px-3.5 py-2.5 flex-shrink-0"
          >
            <Send size={15} />
          </Button>
        </div>
      </div>

    </div>
  )
}
