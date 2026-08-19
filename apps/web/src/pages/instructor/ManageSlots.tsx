import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronUp,
  Clock,
  Pencil,
  Plus,
  Repeat2,
  Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatTime } from '@/lib/utils'
import { useOnboardingWorkspaceQuery } from '@/features/instructor/hooks'
import {
  useCreateSlotsMutation,
  useInstructorSlotsQuery,
  useRemoveSlotMutation,
  useUpdateSlotMutation,
} from '@/features/slots/hooks'
import type { Slot } from '@/features/slots/api'

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
]

function dateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const value = (type: string) => parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

function upcomingDates(count = 21) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)

    return {
      key: dateKey(date),
      weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: date.toLocaleDateString('en-IN', { day: 'numeric' }),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      today: index === 0,
    }
  })
}

function slotDateLabel(slot: Slot) {
  return new Date(slot.startTime).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function statusVariant(status: Slot['status']) {
  if (status === 'AVAILABLE') return 'success'
  if (status === 'BOOKED') return 'error'
  return 'warning'
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  return 'Something went wrong. Please try again.'
}

export function ManageSlots() {
  const workspace = useOnboardingWorkspaceQuery()
  const slotsQuery = useInstructorSlotsQuery()
  const createMutation = useCreateSlotsMutation()
  const updateMutation = useUpdateSlotMutation()
  const removeMutation = useRemoveSlotMutation()

  const offerings = (workspace.data?.offerings ?? []).filter(
    (offering) => offering.status === 'APPROVED',
  )

  const [showForm, setShowForm] = useState(false)
  const [offeringId, setOfferingId] = useState('')
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(60)
  const [dates, setDates] = useState<Set<string>>(new Set())
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [repeatCount, setRepeatCount] = useState(4)
  const [error, setError] = useState('')
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  const days = useMemo(() => upcomingDates(), [])
  const slots = slotsQuery.data ?? []

  const groupedSlots = useMemo(() => {
    const map = new Map<string, Slot[]>()

    for (const slot of slots) {
      const label = slotDateLabel(slot)
      map.set(label, [...(map.get(label) ?? []), slot])
    }

    return [...map.entries()]
  }, [slots])

  function toggleDate(value: string) {
    setDates((current) => {
      const next = new Set(current)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  function createPayloadDates() {
    const sourceDates = [...dates].sort()
    const result = new Set(sourceDates)

    if (repeatWeekly) {
      sourceDates.forEach((value) => {
        const base = new Date(`${value}T00:00:00+05:30`)

        for (let week = 1; week < repeatCount; week += 1) {
          const repeated = new Date(base)
          repeated.setUTCDate(repeated.getUTCDate() + week * 7)
          result.add(dateKey(repeated))
        }
      })
    }

    return [...result].sort()
  }

  async function handleCreate() {
    setError('')

    if (!offeringId) {
      setError('Select an offering first.')
      return
    }

    const selectedDates = createPayloadDates()

    if (!selectedDates.length) {
      setError('Select at least one date.')
      return
    }

    if (selectedDates.length > 100) {
      setError('You can create at most 100 slots at once.')
      return
    }

    try {
      await createMutation.mutateAsync({
        offeringId,
        timezone: 'Asia/Kolkata',
        slots: selectedDates.map((date) => {
          const start = new Date(`${date}T${time}:00+05:30`)
          const end = new Date(start.getTime() + duration * 60_000)

          return {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            title: title.trim() || undefined,
          }
        }),
      })

      setDates(new Set())
      setTitle('')
      setRepeatWeekly(false)
      setShowForm(false)
    } catch (mutationError) {
      setError(getErrorMessage(mutationError))
    }
  }

  async function handleDelete(slotId: string) {
    if (!window.confirm('Remove this available slot?')) return

    try {
      await removeMutation.mutateAsync(slotId)
    } catch (mutationError) {
      setError(getErrorMessage(mutationError))
    }
  }

  if (workspace.isLoading || slotsQuery.isLoading) {
    return <div className="py-12 text-sm text-stone-500">Loading slots…</div>
  }

  if (!offerings.length) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold text-kala-brown">Manage Slots</h1>
        <Card className="mt-6 p-6 text-sm text-stone-600">
          You need at least one approved offering before you can create slots.
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Slots</h1>
          <p className="mt-1 text-sm text-stone-500">
            {slots.length} total slot{slots.length === 1 ? '' : 's'}
          </p>
        </div>

        <Button
          variant={showForm ? 'outline' : 'primary'}
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showForm ? 'Close' : 'Add slots'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="space-y-5 border-amber-200 bg-amber-50/40 p-6">
          <h2 className="font-semibold text-stone-800">Create availability</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-600">
              Offering
            </label>
            <select
              value={offeringId}
              onChange={(event) => setOfferingId(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
            >
              <option value="">Select an offering</option>
              {offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.title || offering.subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-600">
                Start time
              </label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-600">
                Session label
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-600">Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDuration(item.value)}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-sm',
                    duration === item.value
                      ? 'border-kala-amber bg-kala-amber text-white'
                      : 'border-stone-200 bg-white text-stone-600',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-600">Select dates</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map((day) => {
                const selected = dates.has(day.key)

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDate(day.key)}
                    className={cn(
                      'min-w-16 rounded-xl border px-3 py-2 text-center',
                      selected
                        ? 'border-kala-amber bg-kala-amber text-white'
                        : 'border-stone-200 bg-white text-stone-600',
                    )}
                  >
                    <span className="block text-[10px] uppercase">
                      {day.today ? 'Today' : day.weekday}
                    </span>
                    <span className="block text-base font-bold">{day.day}</span>
                    <span className="block text-[10px]">{day.month}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={repeatWeekly}
              onChange={(event) => setRepeatWeekly(event.target.checked)}
            />
            <Repeat2 size={15} />
            Repeat weekly
          </label>

          {repeatWeekly && (
            <div className="max-w-xs">
              <label className="mb-1.5 block text-sm font-medium text-stone-600">
                Number of weekly occurrences
              </label>
              <input
                type="number"
                min={2}
                max={20}
                value={repeatCount}
                onChange={(event) =>
                  setRepeatCount(Math.max(2, Math.min(20, Number(event.target.value))))
                }
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
              />
            </div>
          )}

          <Button
            onClick={handleCreate}
            loading={createMutation.isPending}
            disabled={!dates.size || !offeringId}
          >
            <CalendarDays size={16} />
            Create slots
          </Button>
        </Card>
      )}

      {!groupedSlots.length ? (
        <Card className="border-dashed p-10 text-center text-sm text-stone-500">
          No slots yet. Add availability above.
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedSlots.map(([label, dateSlots]) => (
            <section key={label}>
              <div className="mb-3 flex items-center gap-3">
                <CalendarDays size={15} className="text-stone-400" />
                <h2 className="text-sm font-semibold text-stone-700">{label}</h2>
                <div className="h-px flex-1 bg-stone-100" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dateSlots.map((slot) => (
                  <Card key={slot.id} className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {slot.title || slot.offering?.title || slot.offering?.subcategory.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <Clock size={12} />
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </p>
                    </div>

                    <Badge variant={statusVariant(slot.status)}>{slot.status}</Badge>

                    {slot.status === 'AVAILABLE' && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingSlot(slot)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                          aria-label="Edit slot"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(slot.id)}
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <EditSlotModal
        slot={editingSlot}
        loading={updateMutation.isPending}
        onClose={() => setEditingSlot(null)}
        onSave={async (payload) => {
          try {
            await updateMutation.mutateAsync(payload)
            setEditingSlot(null)
          } catch (mutationError) {
            setError(getErrorMessage(mutationError))
          }
        }}
      />
    </div>
  )
}

function EditSlotModal({
  slot,
  loading,
  onClose,
  onSave,
}: {
  slot: Slot | null
  loading: boolean
  onClose: () => void
  onSave: (payload: {
    slotId: string
    startTime: string
    endTime: string
    title?: string
  }) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  if (slot && date !== dateKey(new Date(slot.startTime))) {
    const startDate = new Date(slot.startTime)
    const endDate = new Date(slot.endTime)
    setDate(dateKey(startDate))
    setStart(startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    setEnd(endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    setTitle(slot.title ?? '')
  }

  return (
    <Modal open={Boolean(slot)} onClose={onClose} title="Edit slot">
      {slot && (
        <div className="space-y-4">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
            />
            <input
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
            />
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Session label"
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          />

          <Button
            className="w-full"
            loading={loading}
            onClick={() =>
              onSave({
                slotId: slot.id,
                startTime: new Date(`${date}T${start}:00+05:30`).toISOString(),
                endTime: new Date(`${date}T${end}:00+05:30`).toISOString(),
                title: title.trim() || undefined,
              })
            }
          >
            Save changes
          </Button>
        </div>
      )}
    </Modal>
  )
}