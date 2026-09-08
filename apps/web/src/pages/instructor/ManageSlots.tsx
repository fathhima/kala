import { useMemo, useState } from 'react'
import {
  Ban,
  CalendarDays,
  CalendarPlus,
  Clock,
  Plus,
  Repeat2,
  Trash2,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatTime } from '@/lib/utils'
import { useOnboardingWorkspaceQuery } from '@/features/instructor/hooks'
import {
  useInstructorAvailabilityQuery,
  useCreateSlotRuleMutation,
  useUpdateSlotRuleMutation,
  useDeleteSlotRuleMutation,
  useCreateSlotExceptionMutation,
} from '@/features/slots/hooks'
import type { SlotRule, SlotException, Slot } from '@/features/slots/api'
import type { InstructorOfferingDto } from '@/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMEZONE = 'Asia/Kolkata'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WEEKDAY_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

type Tab = 'rules' | 'extra' | 'block'

// ─── Time helpers ─────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function todayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// ─── Preview helpers ──────────────────────────────────────────────────────────

/** Generate a client-side preview of slots a weekly rule would produce (next 14 days) */
function previewRuleSlots(
  weekday: number,
  startMinute: number,
  endMinute: number,
  durationMinutes: number,
  effectiveFrom: string,
): Array<{ date: string; startMinute: number; endMinute: number }> {
  if (
    !effectiveFrom ||
    endMinute <= startMinute ||
    durationMinutes <= 0 ||
    (endMinute - startMinute) < durationMinutes
  ) {
    return []
  }

  const slots: Array<{ date: string; startMinute: number; endMinute: number }> = []
  const from = new Date(`${effectiveFrom}T00:00:00`)
  const limit = new Date()
  limit.setDate(limit.getDate() + 14)

  for (let d = new Date(from); d <= limit; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekday) {
      let cursor = startMinute
      while (cursor + durationMinutes <= endMinute) {
        slots.push({
          date: d.toISOString().slice(0, 10),
          startMinute: cursor,
          endMinute: cursor + durationMinutes,
        })
        cursor += durationMinutes
      }
    }
  }
  return slots
}

// ─── Error helper ─────────────────────────────────────────────────────────────

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message
  }
  return 'Something went wrong. Please try again.'
}

// ─── Slot status helpers ──────────────────────────────────────────────────────

function slotStatusVariant(status: Slot['status']) {
  if (status === 'AVAILABLE') return 'success' as const
  if (status === 'BOOKED') return 'error' as const
  return 'warning' as const
}

function slotOriginLabel(slot: Slot) {
  if (slot.ruleId) return 'Rule'
  if (slot.exceptionId) return 'Extra'
  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 block text-sm font-medium text-stone-600">{children}</p>
  )
}

function FieldGroup({ children, cols = 1 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div className={cn('gap-4', cols === 2 ? 'grid sm:grid-cols-2' : 'flex flex-col')}>
      {children}
    </div>
  )
}

function SelectInput({
  value,
  onChange,
  children,
  id,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  id?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
    >
      {children}
    </select>
  )
}

function TimeInput({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (v: string) => void
  id?: string
}) {
  return (
    <input
      id={id}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
    />
  )
}

function DateInput({
  value,
  onChange,
  min,
  id,
}: {
  value: string
  onChange: (v: string) => void
  min?: string
  id?: string
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
    />
  )
}

function DurationPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map((d) => (
        <button
          key={d.value}
          type="button"
          onClick={() => onChange(d.value)}
          className={cn(
            'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
            value === d.value
              ? 'border-kala-amber bg-kala-amber text-white'
              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

function OfferingSelect({
  value,
  onChange,
  offerings,
  id,
  includeAll,
}: {
  value: string
  onChange: (v: string) => void
  offerings: InstructorOfferingDto[]
  id?: string
  includeAll?: boolean
}) {
  return (
    <SelectInput id={id} value={value} onChange={onChange}>
      {includeAll ? <option value="">All offerings</option> : <option value="">Select an offering</option>}
      {offerings.map((o) => (
        <option key={o.id} value={o.id}>
          {o.title || o.subcategory.name}
        </option>
      ))}
    </SelectInput>
  )
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-sm text-stone-400">
      {label}
    </div>
  )
}

// ─── Weekly Rules Tab ─────────────────────────────────────────────────────────

function WeeklyRulesTab({
  offerings,
}: {
  offerings: InstructorOfferingDto[]
}) {
  const availabilityQuery = useInstructorAvailabilityQuery()
  const createRuleMutation = useCreateSlotRuleMutation()
  const deleteRuleMutation = useDeleteSlotRuleMutation()

  const [offeringId, setOfferingId] = useState('')
  const [weekday, setWeekday] = useState(1)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('13:00')
  const [duration, setDuration] = useState(60)
  const [effectiveFrom, setEffectiveFrom] = useState(todayISO())
  const [effectiveUntil, setEffectiveUntil] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const rules = availabilityQuery.data?.rules ?? []

  const startMinute = timeToMinutes(startTime)
  const endMinute = timeToMinutes(endTime)

  const previewSlots = useMemo(
    () =>
      showPreview && offeringId
        ? previewRuleSlots(weekday, startMinute, endMinute, duration, effectiveFrom)
        : [],
    [showPreview, offeringId, weekday, startMinute, endMinute, duration, effectiveFrom],
  )

  async function handleCreate() {
    setError('')
    if (!offeringId) { setError('Select an offering first.'); return }
    if (endMinute <= startMinute) { setError('End time must be after start time.'); return }
    if ((endMinute - startMinute) < duration) {
      setError('The time window is shorter than the slot duration.')
      return
    }
    if (!effectiveFrom) { setError('Set an effective from date.'); return }

    try {
      await createRuleMutation.mutateAsync({
        offeringId,
        weekday,
        startMinute,
        endMinute,
        slotDurationMinutes: duration,
        timezone: TIMEZONE,
        effectiveFrom,
        effectiveUntil: effectiveUntil || undefined,
        title: title.trim() || undefined,
      })
      setOfferingId('')
      setTitle('')
      setEffectiveUntil('')
      setShowPreview(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleDelete(ruleId: string) {
    if (!window.confirm('Remove this rule? Future available slots generated by it will be cancelled.')) return
    try {
      await deleteRuleMutation.mutateAsync(ruleId)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Create form ── */}
      <Card className="space-y-5 border-amber-100 bg-amber-50/30 p-6">
        <div className="flex items-center gap-2">
          <Repeat2 size={16} className="text-kala-amber" />
          <h2 className="font-semibold text-stone-800">New weekly rule</h2>
        </div>

        <ErrorBanner message={error} />

        <FieldGroup>
          <div>
            <SectionLabel>Offering</SectionLabel>
            <OfferingSelect value={offeringId} onChange={setOfferingId} offerings={offerings} id="rule-offering" />
          </div>
          <div>
            <SectionLabel>Session label (optional)</SectionLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning session"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
            />
          </div>
        </FieldGroup>

        <div>
          <SectionLabel>Day of the week</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setWeekday(idx)}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                  weekday === idx
                    ? 'border-kala-amber bg-kala-amber text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <FieldGroup cols={2}>
          <div>
            <SectionLabel>Start time</SectionLabel>
            <TimeInput id="rule-start" value={startTime} onChange={setStartTime} />
            <p className="mt-1 text-xs text-stone-400">{startMinute} min from midnight</p>
          </div>
          <div>
            <SectionLabel>End time</SectionLabel>
            <TimeInput id="rule-end" value={endTime} onChange={setEndTime} />
            <p className="mt-1 text-xs text-stone-400">{endMinute} min from midnight</p>
          </div>
        </FieldGroup>

        <div>
          <SectionLabel>Slot duration</SectionLabel>
          <DurationPicker value={duration} onChange={setDuration} />
          {endMinute > startMinute && (
            <p className="mt-2 text-xs text-stone-500">
              → generates {Math.floor((endMinute - startMinute) / duration)} slot{Math.floor((endMinute - startMinute) / duration) !== 1 ? 's' : ''} per {WEEKDAY_FULL[weekday]}
            </p>
          )}
        </div>

        <FieldGroup cols={2}>
          <div>
            <SectionLabel>Effective from</SectionLabel>
            <DateInput id="rule-from" value={effectiveFrom} onChange={setEffectiveFrom} min={todayISO()} />
          </div>
          <div>
            <SectionLabel>Effective until (optional)</SectionLabel>
            <DateInput id="rule-until" value={effectiveUntil} onChange={setEffectiveUntil} min={effectiveFrom || todayISO()} />
          </div>
        </FieldGroup>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleCreate}
            loading={createRuleMutation.isPending}
            disabled={!offeringId}
          >
            <CalendarPlus size={16} />
            Save rule
          </Button>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="text-sm text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
          >
            {showPreview ? 'Hide preview' : 'Preview slots →'}
          </button>
        </div>

        {/* ── Preview ── */}
        {showPreview && (
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-stone-700">
              Preview — next 14 days
            </p>
            {previewSlots.length === 0 ? (
              <p className="text-sm text-stone-400">
                {offeringId
                  ? 'No slots in the next 14 days based on current settings.'
                  : 'Select an offering to preview.'}
              </p>
            ) : (
              <div className="space-y-2">
                {previewSlots.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm"
                  >
                    <CalendarDays size={13} className="shrink-0 text-kala-amber" />
                    <span className="font-medium text-stone-700">{s.date}</span>
                    <span className="text-stone-500">
                      {minutesToTime(s.startMinute)} – {minutesToTime(s.endMinute)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Active rules list ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-600 uppercase tracking-wide">
          Active rules
        </h3>
        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : rules.length === 0 ? (
          <EmptyState label="No weekly rules yet. Create one above." />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onDelete={() => handleDelete(rule.id)} deleting={deleteRuleMutation.isPending} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RuleCard({
  rule,
  onDelete,
  deleting,
}: {
  rule: SlotRule
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-kala-amber">
        <Repeat2 size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-800">
          {rule.title || WEEKDAY_FULL[rule.weekday]}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          Every {WEEKDAY_FULL[rule.weekday]} · {minutesToTime(rule.startMinute)}–{minutesToTime(rule.endMinute)} · {rule.slotDurationMinutes} min slots
        </p>
        <p className="mt-0.5 text-xs text-stone-400">
          From {rule.effectiveFrom}{rule.effectiveUntil ? ` until ${rule.effectiveUntil}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={rule.status === 'ACTIVE' ? 'success' : 'warning'}>
          {rule.status}
        </Badge>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          aria-label="Delete rule"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}

// ─── Extra Time Tab ───────────────────────────────────────────────────────────

function ExtraTimeTab({
  offerings,
}: {
  offerings: InstructorOfferingDto[]
}) {
  const availabilityQuery = useInstructorAvailabilityQuery()
  const createExceptionMutation = useCreateSlotExceptionMutation()

  const [offeringId, setOfferingId] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [startTime, setStartTime] = useState('10:00')
  const [endDate, setEndDate] = useState(todayISO())
  const [endTime, setEndTime] = useState('12:00')
  const [duration, setDuration] = useState(60)
  const [error, setError] = useState('')

  const extraExceptions = (availabilityQuery.data?.exceptions ?? []).filter(
    (e) => e.type === 'EXTRA',
  )

  const upcomingExtraSlots = useMemo(() => {
    const now = new Date().toISOString()
    return (availabilityQuery.data?.slots ?? [])
      .filter((s) => s.exceptionId && s.status === 'AVAILABLE' && s.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [availabilityQuery.data?.slots])

  async function handleCreate() {
    setError('')
    if (!offeringId) { setError('Select an offering.'); return }
    if (!startDate || !endDate) { setError('Select start and end date/time.'); return }

    const startISO = new Date(`${startDate}T${startTime}:00+05:30`).toISOString()
    const endISO = new Date(`${endDate}T${endTime}:00+05:30`).toISOString()

    if (endISO <= startISO) { setError('End must be after start.'); return }

    try {
      await createExceptionMutation.mutateAsync({
        type: 'EXTRA',
        offeringId,
        title: title.trim() || undefined,
        startTime: startISO,
        endTime: endISO,
        timezone: TIMEZONE,
        slotDurationMinutes: duration,
      })
      setTitle('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 border-emerald-100 bg-emerald-50/20 p-6">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-stone-800">Add one-time availability</h2>
        </div>

        <ErrorBanner message={error} />

        <FieldGroup>
          <div>
            <SectionLabel>Offering</SectionLabel>
            <OfferingSelect value={offeringId} onChange={setOfferingId} offerings={offerings} id="extra-offering" />
          </div>
          <div>
            <SectionLabel>Session label (optional)</SectionLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Special workshop"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
            />
          </div>
        </FieldGroup>

        <FieldGroup cols={2}>
          <div>
            <SectionLabel>Start date &amp; time</SectionLabel>
            <div className="space-y-2">
              <DateInput id="extra-start-date" value={startDate} onChange={setStartDate} min={todayISO()} />
              <TimeInput id="extra-start-time" value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <div>
            <SectionLabel>End date &amp; time</SectionLabel>
            <div className="space-y-2">
              <DateInput id="extra-end-date" value={endDate} onChange={setEndDate} min={startDate} />
              <TimeInput id="extra-end-time" value={endTime} onChange={setEndTime} />
            </div>
          </div>
        </FieldGroup>

        <div>
          <SectionLabel>Slot duration</SectionLabel>
          <DurationPicker value={duration} onChange={setDuration} />
        </div>

        <Button
          onClick={handleCreate}
          loading={createExceptionMutation.isPending}
          disabled={!offeringId}
        >
          <Plus size={16} />
          Add availability
        </Button>
      </Card>

      {/* ── Upcoming extra slots ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-600 uppercase tracking-wide">
          Upcoming extra slots
        </h3>
        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : upcomingExtraSlots.length === 0 ? (
          <EmptyState label="No upcoming extra slots." />
        ) : (
          <UpcomingSlotsGrid slots={upcomingExtraSlots} />
        )}
      </div>

      {/* ── Extra exceptions list ── */}
      {extraExceptions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-stone-600 uppercase tracking-wide">
            Extra exceptions
          </h3>
          <div className="space-y-3">
            {extraExceptions.map((ex) => (
              <ExceptionCard key={ex.id} exception={ex} offerings={offerings} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Block Time Tab ───────────────────────────────────────────────────────────

function BlockTimeTab({
  offerings,
}: {
  offerings: InstructorOfferingDto[]
}) {
  const availabilityQuery = useInstructorAvailabilityQuery()
  const createExceptionMutation = useCreateSlotExceptionMutation()

  const [offeringId, setOfferingId] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(todayISO())
  const [endTime, setEndTime] = useState('18:00')
  const [error, setError] = useState('')

  const blockExceptions = (availabilityQuery.data?.exceptions ?? []).filter(
    (e) => e.type === 'BLOCK',
  )

  async function handleCreate() {
    setError('')
    if (!startDate || !endDate) { setError('Select a date/time range.'); return }

    const startISO = new Date(`${startDate}T${startTime}:00+05:30`).toISOString()
    const endISO = new Date(`${endDate}T${endTime}:00+05:30`).toISOString()

    if (endISO <= startISO) { setError('End must be after start.'); return }

    try {
      await createExceptionMutation.mutateAsync({
        type: 'BLOCK',
        offeringId: offeringId || undefined,
        title: title.trim() || undefined,
        startTime: startISO,
        endTime: endISO,
        timezone: TIMEZONE,
      })
      setTitle('')
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 border-red-100 bg-red-50/20 p-6">
        <div className="flex items-center gap-2">
          <Ban size={16} className="text-red-500" />
          <h2 className="font-semibold text-stone-800">Block a time range</h2>
        </div>
        <p className="text-xs text-stone-500">
          Blocks will cancel any AVAILABLE slots in the selected range. Leave offering empty to block all offerings.
        </p>

        <ErrorBanner message={error} />

        <FieldGroup>
          <div>
            <SectionLabel>Offering (optional — leave empty to block all)</SectionLabel>
            <OfferingSelect
              value={offeringId}
              onChange={setOfferingId}
              offerings={offerings}
              id="block-offering"
              includeAll
            />
          </div>
          <div>
            <SectionLabel>Block reason / label (optional)</SectionLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unavailable — travel"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-kala-amber focus:outline-none focus:ring-1 focus:ring-kala-amber/40"
            />
          </div>
        </FieldGroup>

        <FieldGroup cols={2}>
          <div>
            <SectionLabel>Block start</SectionLabel>
            <div className="space-y-2">
              <DateInput id="block-start-date" value={startDate} onChange={setStartDate} min={todayISO()} />
              <TimeInput id="block-start-time" value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <div>
            <SectionLabel>Block end</SectionLabel>
            <div className="space-y-2">
              <DateInput id="block-end-date" value={endDate} onChange={setEndDate} min={startDate} />
              <TimeInput id="block-end-time" value={endTime} onChange={setEndTime} />
            </div>
          </div>
        </FieldGroup>

        <Button
          variant="destructive"
          onClick={handleCreate}
          loading={createExceptionMutation.isPending}
        >
          <Ban size={16} />
          Block time
        </Button>
      </Card>

      {/* ── Active blocks ── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-stone-600 uppercase tracking-wide">
          Active blocks
        </h3>
        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : blockExceptions.length === 0 ? (
          <EmptyState label="No time blocks set." />
        ) : (
          <div className="space-y-3">
            {blockExceptions.map((ex) => (
              <ExceptionCard key={ex.id} exception={ex} offerings={offerings} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Upcoming Slots Grid ──────────────────────────────────────────────────────

function UpcomingSlotsGrid({ slots }: { slots: Slot[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const label = new Date(slot.startTime).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: TIMEZONE,
      })
      map.set(label, [...(map.get(label) ?? []), slot])
    }
    return [...map.entries()]
  }, [slots])

  return (
    <div className="space-y-5">
      {grouped.map(([label, daySlots]) => (
        <section key={label}>
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays size={14} className="text-stone-400" />
            <h4 className="text-sm font-semibold text-stone-700">{label}</h4>
            <div className="h-px flex-1 bg-stone-100" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {daySlots.map((slot) => {
              const origin = slotOriginLabel(slot)
              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Clock size={14} className="text-kala-amber" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {slot.title || slot.offering?.title || slot.offering?.subcategory.name || '—'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={slotStatusVariant(slot.status)}>{slot.status}</Badge>
                    {origin && (
                      <span className="text-[10px] text-stone-400">{origin}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

// ─── Exception Card ───────────────────────────────────────────────────────────

function ExceptionCard({
  exception,
  offerings,
}: {
  exception: SlotException
  offerings: InstructorOfferingDto[]
}) {
  const isBlock = exception.type === 'BLOCK'
  const offering = offerings.find((o) => o.id === exception.offeringId)

  return (
    <Card className="flex items-center gap-4 p-4">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isBlock ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600',
        )}
      >
        {isBlock ? <Ban size={16} /> : <Zap size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-800">
          {exception.title || (isBlock ? 'Time block' : 'Extra availability')}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {new Date(exception.startTime).toLocaleString('en-IN', { timeZone: TIMEZONE, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {' → '}
          {new Date(exception.endTime).toLocaleString('en-IN', { timeZone: TIMEZONE, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        {offering && (
          <p className="mt-0.5 text-xs text-stone-400">
            {offering.title || offering.subcategory.name}
          </p>
        )}
      </div>
      <Badge variant={isBlock ? 'error' : 'success'}>{exception.type}</Badge>
    </Card>
  )
}

// ─── Upcoming All Slots Panel ─────────────────────────────────────────────────

function UpcomingPanel({
  offerings,
}: {
  offerings: InstructorOfferingDto[]
}) {
  const [filterOfferingId, setFilterOfferingId] = useState('')
  const availabilityQuery = useInstructorAvailabilityQuery(
    filterOfferingId ? { offeringId: filterOfferingId } : undefined,
  )

  const now = new Date().toISOString()
  const upcomingSlots = useMemo(
    () =>
      (availabilityQuery.data?.slots ?? [])
        .filter((s) => s.status === 'AVAILABLE' && s.startTime > now)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 60),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availabilityQuery.data?.slots],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-600">
          Upcoming available slots
        </h3>
        <div className="w-48">
          <OfferingSelect
            value={filterOfferingId}
            onChange={setFilterOfferingId}
            offerings={offerings}
            includeAll
            id="panel-offering-filter"
          />
        </div>
      </div>

      {availabilityQuery.isLoading ? (
        <p className="text-sm text-stone-400">Loading slots…</p>
      ) : upcomingSlots.length === 0 ? (
        <EmptyState label="No upcoming available slots. Add a weekly rule or extra time." />
      ) : (
        <UpcomingSlotsGrid slots={upcomingSlots} />
      )}
    </div>
  )
}

// ─── Edit Rule Modal ──────────────────────────────────────────────────────────

function EditRuleModal({
  rule,
  onClose,
}: {
  rule: SlotRule | null
  onClose: () => void
}) {
  const updateRuleMutation = useUpdateSlotRuleMutation()
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [effectiveUntil, setEffectiveUntil] = useState('')
  const [error, setError] = useState('')

  if (rule && endTime === '') {
    setEndTime(minutesToTime(rule.endMinute))
    setDuration(rule.slotDurationMinutes)
    setEffectiveUntil(rule.effectiveUntil ?? '')
  }

  async function handleSave() {
    if (!rule) return
    setError('')
    const endMinute = timeToMinutes(endTime)
    if (endMinute <= rule.startMinute) {
      setError('End time must be after start time.')
      return
    }
    try {
      await updateRuleMutation.mutateAsync({
        ruleId: rule.id,
        endMinute,
        slotDurationMinutes: duration,
        effectiveUntil: effectiveUntil || undefined,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal open={Boolean(rule)} onClose={onClose} title="Edit rule">
      {rule && (
        <div className="space-y-4">
          <ErrorBanner message={error} />

          <div>
            <SectionLabel>End time</SectionLabel>
            <TimeInput id="edit-rule-end" value={endTime} onChange={(v) => { setEndTime(v); setError('') }} />
          </div>

          <div>
            <SectionLabel>Slot duration</SectionLabel>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>

          <div>
            <SectionLabel>Effective until (optional)</SectionLabel>
            <DateInput id="edit-rule-until" value={effectiveUntil} onChange={setEffectiveUntil} min={todayISO()} />
          </div>

          <Button className="w-full" loading={updateRuleMutation.isPending} onClick={handleSave}>
            Save changes
          </Button>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; Icon: typeof Repeat2 }[] = [
  { id: 'rules', label: 'Weekly rules', Icon: Repeat2 },
  { id: 'extra', label: 'Extra time', Icon: Zap },
  { id: 'block', label: 'Block time', Icon: Ban },
]

export function ManageSlots() {
  const workspace = useOnboardingWorkspaceQuery()
  const [activeTab, setActiveTab] = useState<Tab>('rules')
  const [editingRule, setEditingRule] = useState<SlotRule | null>(null)

  const offerings = (workspace.data?.offerings ?? []).filter(
    (o) => o.status === 'APPROVED',
  )

  if (workspace.isLoading) {
    return (
      <div className="py-12 text-sm text-stone-400 animate-pulse">
        Loading availability…
      </div>
    )
  }

  if (!offerings.length) {
    return (
      <div className="py-12">
        <h1 className="text-2xl font-bold text-kala-brown">Manage Availability</h1>
        <Card className="mt-6 p-8 text-center">
          <CalendarDays size={32} className="mx-auto mb-4 text-stone-300" />
          <p className="text-sm font-medium text-stone-600">No approved offerings</p>
          <p className="mt-1 text-sm text-stone-400">
            You need at least one approved offering before you can manage availability.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Manage Availability</h1>
        <p className="mt-1 text-sm text-stone-500">
          Set recurring weekly rules, add one-off extra time, or block time off.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-2xl border border-stone-100 bg-stone-50 p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
              activeTab === id
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-500 hover:text-stone-700',
            )}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab panels ── */}
      <div
        key={activeTab}
        style={{ animation: 'fadeSlideIn 200ms ease both' }}
      >
        {activeTab === 'rules' && (
          <WeeklyRulesTab offerings={offerings} />
        )}
        {activeTab === 'extra' && (
          <ExtraTimeTab offerings={offerings} />
        )}
        {activeTab === 'block' && (
          <BlockTimeTab offerings={offerings} />
        )}
      </div>

      {/* ── Upcoming slots panel (always visible) ── */}
      <div className="border-t border-stone-100 pt-6">
        <UpcomingPanel offerings={offerings} />
      </div>

      {/* ── Edit rule modal ── */}
      <EditRuleModal rule={editingRule} onClose={() => setEditingRule(null)} />
    </div>
  )
}