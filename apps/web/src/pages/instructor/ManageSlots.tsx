import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Ban,
  Calendar,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  LayoutGrid,
  Pencil,
  Plus,
  Repeat2,
  Trash2,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { cn, formatDate, formatTime } from '@/lib/utils'
import { useOnboardingWorkspaceQuery } from '@/features/instructor/hooks'
import {
  useInstructorAvailabilityQuery,
  useCreateSlotRuleMutation,
  useUpdateSlotRuleMutation,
  useDeleteSlotRuleMutation,
  useCreateSlotExceptionMutation,
  useDeleteSlotExceptionMutation,
} from '@/features/slots/hooks'
import type { SlotRule, SlotException, Slot } from '@/features/slots/api'
import type { InstructorOfferingDto } from '@/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMEZONE = 'Asia/Kolkata'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
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

/** Formats minutes from midnight to 12-hour AM/PM: e.g. 780 -> "1:00 PM" */
function formatMinuteTo12Hour(minutes: number, short = false): string {
  const totalMin = ((minutes % 1440) + 1440) % 1440
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 === 0 ? 12 : h % 12
  if (short && m === 0) {
    return `${displayH} ${period}`
  }
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

/** Converts "13:00" to "1:00 PM" */
function formatTimeStringTo12Hour(timeStr: string): string {
  if (!timeStr) return ''
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr) || 0
  if (isNaN(h)) return timeStr
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 === 0 ? 12 : h % 12
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function getDefaultScheduleTimes() {
  const now = new Date()
  const currentHour = now.getHours()

  if (currentHour >= 20) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(tomorrow)
    return {
      startDate: tomorrowStr,
      startTime: '10:00',
      endDate: tomorrowStr,
      endTime: '12:00',
    }
  }

  const nextHour = currentHour + 1
  const endHour = Math.min(nextHour + 2, 23)
  const todayStr = todayISO()
  return {
    startDate: todayStr,
    startTime: `${String(nextHour).padStart(2, '0')}:00`,
    endDate: todayStr,
    endTime: `${String(endHour).padStart(2, '0')}:00`,
  }
}

// ─── Preview helpers ──────────────────────────────────────────────────────────

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
    endMinute - startMinute < durationMinutes
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
  if (status === 'CANCELLED') return 'error' as const
  return 'default' as const
}

function slotOriginLabel(slot: Slot) {
  if (slot.ruleId) return 'Weekly'
  if (slot.exceptionId) return 'One-time'
  return null
}

// ─── Form UI Building Blocks ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">{children}</p>
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
      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
    >
      {children}
    </select>
  )
}

function TimeInput({
  value,
  onChange,
  id,
  minTime,
}: {
  value: string
  onChange: (v: string) => void
  id?: string
  minTime?: string
}) {
  const display12 = formatTimeStringTo12Hour(value)

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
      />
      {display12 && (
        <span
          className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-xs"
          title={`${display12} IST`}
        >
          {display12}
        </span>
      )}
    </div>
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
      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
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
            'rounded-xl border px-3.5 py-2 text-sm font-medium transition-all',
            value === d.value
              ? 'border-kala-amber bg-kala-amber text-white shadow-sm'
              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
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
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
      <AlertCircle size={16} className="shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  )
}

function EmptyState({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 p-8 text-center">
      <Calendar size={28} className="mb-2 text-stone-300" />
      <p className="text-sm font-medium text-stone-600">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-stone-400">{sublabel}</p>}
    </div>
  )
}

// ─── Weekly Timetable ─────────────────────────────────────────────────────────

const TIMETABLE_START = 7 * 60  // 07:00 in minutes
const TIMETABLE_END   = 22 * 60 // 22:00 in minutes
const TIMETABLE_SPAN  = TIMETABLE_END - TIMETABLE_START

const TIMETABLE_HOURS = Array.from({ length: (TIMETABLE_END - TIMETABLE_START) / 60 + 1 }, (_, i) => {
  const totalMin = TIMETABLE_START + i * 60
  return formatMinuteTo12Hour(totalMin, true)
})

const DAY_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: 'bg-purple-100',  border: 'border-purple-300',  text: 'text-purple-800' },
  1: { bg: 'bg-blue-100',    border: 'border-blue-300',    text: 'text-blue-800'   },
  2: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800'},
  3: { bg: 'bg-amber-100',   border: 'border-amber-300',   text: 'text-amber-800'  },
  4: { bg: 'bg-orange-100',  border: 'border-orange-300',  text: 'text-orange-800' },
  5: { bg: 'bg-rose-100',    border: 'border-rose-300',    text: 'text-rose-800'   },
  6: { bg: 'bg-teal-100',    border: 'border-teal-300',    text: 'text-teal-800'   },
}

function WeeklyTimetable({ rules }: { rules: SlotRule[] }) {
  // Order Mon(1)…Sat(6)…Sun(0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0]

  const { activeRules, byDay } = useMemo(() => {
    const active = rules.filter((r) => r.status === 'ACTIVE')
    const map: Record<number, SlotRule[]> = {}
    orderedDays.forEach((d) => (map[d] = []))
    active.forEach((r) => {
      if (map[r.weekday]) map[r.weekday].push(r)
    })
    return { activeRules: active, byDay: map }
  }, [rules])

  const hasAnyRule = activeRules.length > 0

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[48px_repeat(7,_1fr)] border-b border-stone-100 bg-stone-50/60">
        <div className="py-2" /> {/* time gutter */}
        {orderedDays.map((d) => {
          const hasRule = byDay[d].length > 0
          return (
            <div
              key={d}
              className={cn(
                'py-2 text-center text-[11px] font-bold uppercase tracking-wider border-l border-stone-100',
                hasRule ? 'text-stone-800' : 'text-stone-400',
              )}
            >
              {WEEKDAYS[d]}
            </div>
          )
        })}
      </div>

      {!hasAnyRule ? (
        <div className="flex items-center justify-center py-10 text-xs text-stone-400">
          No active weekly rules yet — add one above to see it here.
        </div>
      ) : (
        <div className="relative grid grid-cols-[48px_repeat(7,_1fr)]" style={{ minHeight: 360 }}>
          {/* Hour gridlines + labels */}
          <div className="relative" style={{ height: 360 }}>
            {TIMETABLE_HOURS.map((label, i) => {
              const pct = ((i * 60) / TIMETABLE_SPAN) * 100
              return (
                <div
                  key={label}
                  className="absolute left-0 right-0 flex items-start"
                  style={{ top: `${pct}%` }}
                >
                  <span className="w-full pr-1 text-right text-[9px] leading-none text-stone-400 select-none">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Day columns */}
          {orderedDays.map((d) => {
            const color = DAY_COLORS[d]
            return (
              <div
                key={d}
                className="relative border-l border-stone-100"
                style={{ height: 360 }}
              >
                {/* Subtle gridlines */}
                {TIMETABLE_HOURS.map((_, i) => {
                  const pct = ((i * 60) / TIMETABLE_SPAN) * 100
                  return (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-stone-100"
                      style={{ top: `${pct}%` }}
                    />
                  )
                })}

                {byDay[d].map((rule) => {
                  const clampedStart = Math.max(rule.startMinute, TIMETABLE_START)
                  const clampedEnd   = Math.min(rule.endMinute,   TIMETABLE_END)
                  if (clampedEnd <= clampedStart) return null

                  const topPct    = ((clampedStart - TIMETABLE_START) / TIMETABLE_SPAN) * 100
                  const heightPct = ((clampedEnd   - clampedStart)    / TIMETABLE_SPAN) * 100
                  const slotCount = Math.floor((rule.endMinute - rule.startMinute) / rule.slotDurationMinutes)

                  return (
                    <div
                      key={rule.id}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded-md border px-1 py-0.5 overflow-hidden cursor-default transition-opacity hover:opacity-90',
                        color.bg,
                        color.border,
                      )}
                      style={{ top: `${topPct}%`, height: `${heightPct}%`, minHeight: 20 }}
                      title={`${rule.title || WEEKDAY_FULL[d]} • ${formatMinuteTo12Hour(rule.startMinute)} – ${formatMinuteTo12Hour(rule.endMinute)} • ${slotCount} slot${slotCount !== 1 ? 's' : ''}`}
                    >
                      <p className={cn('text-[9px] font-semibold leading-tight truncate', color.text)}>
                        {formatMinuteTo12Hour(rule.startMinute)} – {formatMinuteTo12Hour(rule.endMinute)}
                      </p>
                      <p className={cn('text-[8px] leading-tight opacity-75 truncate', color.text)}>
                        {slotCount}×{rule.slotDurationMinutes}m
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Weekly Rules Tab ─────────────────────────────────────────────────────────

function WeeklyRulesTab({
  offerings,
  onEditRule,
}: {
  offerings: InstructorOfferingDto[]
  onEditRule: (rule: SlotRule) => void
}) {
  const availabilityQuery = useInstructorAvailabilityQuery()
  const createRuleMutation = useCreateSlotRuleMutation()
  const updateRuleMutation = useUpdateSlotRuleMutation()
  const deleteRuleMutation = useDeleteSlotRuleMutation()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [offeringId, setOfferingId] = useState(offerings[0]?.id || '')
  const [weekday, setWeekday] = useState(1)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('13:00')
  const [duration, setDuration] = useState(60)
  const [effectiveFrom, setEffectiveFrom] = useState(todayISO())
  const [effectiveUntil, setEffectiveUntil] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showTimetable, setShowTimetable] = useState(true)
  const [ruleToBlock, setRuleToBlock] = useState<SlotRule | null>(null)
  const [ruleToDelete, setRuleToDelete] = useState<SlotRule | null>(null)
  const [exceptionToUnblock, setExceptionToUnblock] = useState<SlotException | null>(null)

  const rules = availabilityQuery.data?.rules ?? []

  const startMinute = timeToMinutes(startTime)
  const endMinute = timeToMinutes(endTime)
  const totalWindowMinutes = Math.max(0, endMinute - startMinute)
  const calculatedSlotsCount = duration > 0 ? Math.floor(totalWindowMinutes / duration) : 0

  const previewSlots = useMemo(
    () =>
      showPreview && offeringId
        ? previewRuleSlots(weekday, startMinute, endMinute, duration, effectiveFrom)
        : [],
    [showPreview, offeringId, weekday, startMinute, endMinute, duration, effectiveFrom],
  )

  async function handleCreate() {
    setError('')
    if (!offeringId) {
      setError('Please select an offering.')
      return
    }
    if (endMinute <= startMinute) {
      setError('End time must be after start time.')
      return
    }
    if (endMinute - startMinute < duration) {
      setError('The time window is shorter than the slot duration.')
      return
    }
    if ((endMinute - startMinute) % duration !== 0) {
      setError('The time window must divide evenly by the slot duration.')
      return
    }
    if (!effectiveFrom) {
      setError('Please choose an effective from date.')
      return
    }

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
      setTitle('')
      setEffectiveUntil('')
      setShowPreview(false)
      setIsFormOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleToggleStatus(rule: SlotRule) {
    try {
      const nextStatus = rule.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await updateRuleMutation.mutateAsync({
        ruleId: rule.id,
        status: nextStatus,
      })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Explanation & Toggles ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Recurring Weekly Schedule</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Rules repeat automatically every week. Slots are generated in advance for students to book.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTimetable((p) => !p)}
            title={showTimetable ? 'Hide week view' : 'Show week view'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
              showTimetable
                ? 'border-kala-amber bg-kala-amber/10 text-kala-amber'
                : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50',
            )}
          >
            <LayoutGrid size={14} />
            Week View
          </button>
          <Button
            onClick={() => {
              setIsFormOpen((prev) => !prev)
              setError('')
            }}
          >
            {isFormOpen ? (
              <>
                <ChevronUp size={16} />
                Hide form
              </>
            ) : (
              <>
                <Plus size={16} />
                Add weekly hours
              </>
            )}
          </Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* ── Visual Weekly Timetable ── */}
      {showTimetable && (
        <WeeklyTimetable rules={rules} />
      )}

      {/* ── Collapsible Add Rule Form ── */}
      {isFormOpen && (
        <Card className="space-y-5 border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-kala-amber">
                <Repeat2 size={16} />
              </div>
              <h3 className="font-semibold text-stone-800">New weekly rule</h3>
            </div>
            <span className="text-xs text-stone-400">Repeats every week</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SectionLabel>Offering</SectionLabel>
              <OfferingSelect
                value={offeringId}
                onChange={setOfferingId}
                offerings={offerings}
                id="rule-offering"
              />
            </div>
            <div>
              <SectionLabel>Label (optional)</SectionLabel>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Batch or Evening Jam"
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
              />
            </div>
          </div>

          <div>
            <SectionLabel>Select Day of the Week</SectionLabel>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWeekday(idx)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border py-2.5 text-xs font-semibold transition-all',
                    weekday === idx
                      ? 'border-kala-amber bg-kala-amber text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50',
                  )}
                >
                  <span>{day}</span>
                  <span className="hidden text-[10px] opacity-75 sm:inline">{WEEKDAY_FULL[idx].slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SectionLabel>Start time</SectionLabel>
              <TimeInput id="rule-start" value={startTime} onChange={setStartTime} />
            </div>
            <div>
              <SectionLabel>End time</SectionLabel>
              <TimeInput id="rule-end" value={endTime} onChange={setEndTime} minTime={startTime} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <SectionLabel>Slot Duration</SectionLabel>
              {endMinute > startMinute && (
                <span className="text-xs font-medium text-stone-500">
                  {formatTimeStringTo12Hour(startTime)} – {formatTimeStringTo12Hour(endTime)} ({Math.floor(totalWindowMinutes / 60)}h {totalWindowMinutes % 60 ? `${totalWindowMinutes % 60}m` : ''} total)
                  {' → '}
                  <strong className="text-kala-amber">{calculatedSlotsCount} slot{calculatedSlotsCount !== 1 ? 's' : ''}</strong> per {WEEKDAY_FULL[weekday]}
                </span>
              )}
            </div>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SectionLabel>Effective from</SectionLabel>
              <DateInput
                id="rule-from"
                value={effectiveFrom}
                onChange={setEffectiveFrom}
                min={todayISO()}
              />
            </div>
            <div>
              <SectionLabel>Effective until (optional)</SectionLabel>
              <DateInput
                id="rule-until"
                value={effectiveUntil}
                onChange={setEffectiveUntil}
                min={effectiveFrom || todayISO()}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreate}
                loading={createRuleMutation.isPending}
                disabled={!offeringId}
              >
                <CalendarPlus size={16} />
                Save weekly rule
              </Button>
              <button
                type="button"
                onClick={() => setShowPreview((p) => !p)}
                className="text-xs font-medium text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline"
              >
                {showPreview ? 'Hide preview' : 'Preview slots →'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>

          {/* ── Preview ── */}
          {showPreview && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-600">
                Generated slots preview (next 14 days)
              </p>
              {previewSlots.length === 0 ? (
                <p className="text-xs text-stone-400">
                  {offeringId
                    ? 'No slots generated with the current settings.'
                    : 'Select an offering to preview.'}
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {previewSlots.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-sm"
                    >
                      <CalendarDays size={14} className="shrink-0 text-kala-amber" />
                      <div>
                        <p className="font-semibold text-stone-700">{s.date}</p>
                        <p className="text-stone-500">
                          {formatMinuteTo12Hour(s.startMinute)} – {formatMinuteTo12Hour(s.endMinute)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Weekly Schedule List ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Current Weekly Rules ({rules.length})
          </h3>
          <span className="text-xs text-stone-400">
            {rules.filter((r) => r.status === 'ACTIVE').length} active • {rules.filter((r) => r.status === 'INACTIVE').length} paused
          </span>
        </div>

        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading rules…</p>
        ) : rules.length === 0 ? (
          <EmptyState
            label="No weekly rules yet"
            sublabel="Click '+ Add weekly hours' above to set your regular recurring availability."
          />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                exceptions={availabilityQuery.data?.exceptions ?? []}
                onToggleStatus={() => handleToggleStatus(rule)}
                onEdit={() => onEditRule(rule)}
                onDelete={() => setRuleToDelete(rule)}
                onBlock={() => setRuleToBlock(rule)}
                onUnblock={(ex) => setExceptionToUnblock(ex)}
                updating={updateRuleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmBlockModal
        rule={ruleToBlock}
        exceptions={availabilityQuery.data?.exceptions ?? []}
        onClose={() => setRuleToBlock(null)}
      />

      <ConfirmUnblockModal
        exception={exceptionToUnblock}
        onClose={() => setExceptionToUnblock(null)}
      />

      <ConfirmDeleteRuleModal
        rule={ruleToDelete}
        onClose={() => setRuleToDelete(null)}
      />
    </div>
  )
}

function ConfirmBlockModal({
  rule,
  exceptions = [],
  onClose,
}: {
  rule: SlotRule | null
  exceptions?: SlotException[]
  onClose: () => void
}) {
  const createExceptionMutation = useCreateSlotExceptionMutation()
  const [error, setError] = useState('')

  if (!rule) return null

  // Calculate target occurrence
  const now = new Date()
  const istTimeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
  const [h, m] = istTimeStr.split(':').map(Number)
  const currentMinute = h * 60 + m

  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).format(now)
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const todayWeekday = map[weekdayStr] ?? now.getDay()

  let daysAhead = rule.weekday - todayWeekday
  if (daysAhead === 0) {
    if (currentMinute >= rule.endMinute) {
      daysAhead = 7
    }
  } else if (daysAhead < 0) {
    daysAhead += 7
  }

  const occurrence = new Date(now)
  occurrence.setDate(occurrence.getDate() + daysAhead)

  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(occurrence)

  const friendlyDate = occurrence.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

  const startISO = new Date(`${dateStr}T${minutesToTime(rule.startMinute)}:00+05:30`).toISOString()
  const endISO = new Date(`${dateStr}T${minutesToTime(rule.endMinute)}:00+05:30`).toISOString()

  const isAlreadyBlocked = exceptions.some((e) => {
    if (e.type !== 'BLOCK') return false
    if (e.offeringId && e.offeringId !== rule.offeringId) return false
    const exStart = new Date(e.startTime).getTime()
    const exEnd = new Date(e.endTime).getTime()
    const targetStart = new Date(startISO).getTime()
    const targetEnd = new Date(endISO).getTime()
    return exStart < targetEnd && exEnd > targetStart
  })

  async function handleConfirm() {
    if (!rule) return
    if (isAlreadyBlocked) {
      setError('This upcoming date is already blocked.')
      return
    }
    setError('')
    try {
      await createExceptionMutation.mutateAsync({
        type: 'BLOCK',
        offeringId: rule.offeringId,
        title: `Block – ${WEEKDAY_FULL[rule.weekday]} ${friendlyDate}`,
        startTime: startISO,
        endTime: endISO,
        timezone: TIMEZONE,
      })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal
      open={Boolean(rule)}
      onClose={createExceptionMutation.isPending ? () => {} : onClose}
      title={`Block ${WEEKDAY_FULL[rule.weekday]}?`}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
          <p className="text-sm font-semibold">{friendlyDate}</p>
          <p className="mt-1 font-medium text-stone-700">
            Window: <strong>{formatMinuteTo12Hour(rule.startMinute)} – {formatMinuteTo12Hour(rule.endMinute)} (IST)</strong>
          </p>
          {rule.offering && (
            <p className="mt-0.5 text-stone-500">
              Offering: {rule.offering.title || rule.offering.subcategory.name}
            </p>
          )}
        </div>

        <p className="text-xs text-stone-500">
          This will cancel all <strong>open available slots</strong> in this window on this day. Your recurring weekly rule remains intact for future weeks. Any confirmed student bookings will not be cancelled.
        </p>

        {isAlreadyBlocked && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            ⚠️ This upcoming occurrence ({friendlyDate}) is already blocked.
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={createExceptionMutation.isPending}
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="destructive"
            loading={createExceptionMutation.isPending}
            disabled={isAlreadyBlocked}
            onClick={handleConfirm}
          >
            <Ban size={14} />
            Confirm &amp; Block
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ConfirmUnblockModal({
  exception,
  onClose,
}: {
  exception: SlotException | null
  onClose: () => void
}) {
  const deleteExceptionMutation = useDeleteSlotExceptionMutation()
  const [error, setError] = useState('')

  if (!exception) return null

  const friendlyStart = new Date(exception.startTime).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIMEZONE,
  })

  async function handleConfirm() {
    if (!exception) return
    setError('')
    try {
      await deleteExceptionMutation.mutateAsync(exception.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal
      open={Boolean(exception)}
      onClose={deleteExceptionMutation.isPending ? () => {} : onClose}
      title="Unblock This Date?"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900">
          <p className="text-sm font-semibold">{friendlyStart}</p>
          <p className="mt-1 font-medium text-stone-700">
            Window: <strong>{formatTime(exception.startTime)} – {formatTime(exception.endTime)} (IST)</strong>
          </p>
          {exception.title && (
            <p className="mt-0.5 text-stone-500">Note: {exception.title}</p>
          )}
        </div>

        <p className="text-xs text-stone-500">
          This will remove the time off block. Any open slots generated by your weekly schedule for this day will be automatically restored for student booking.
        </p>

        {error && <ErrorBanner message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={deleteExceptionMutation.isPending}
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            loading={deleteExceptionMutation.isPending}
            onClick={handleConfirm}
          >
            <CheckCircle2 size={14} />
            Confirm &amp; Unblock
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ConfirmDeleteRuleModal({
  rule,
  onClose,
}: {
  rule: SlotRule | null
  onClose: () => void
}) {
  const deleteRuleMutation = useDeleteSlotRuleMutation()
  const [error, setError] = useState('')

  if (!rule) return null

  async function handleConfirm() {
    if (!rule) return
    setError('')
    try {
      await deleteRuleMutation.mutateAsync(rule.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal
      open={Boolean(rule)}
      onClose={deleteRuleMutation.isPending ? () => {} : onClose}
      title="Delete Weekly Rule?"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5 text-xs text-stone-700">
          <p className="font-semibold text-stone-900">
            {rule.title || `Every ${WEEKDAY_FULL[rule.weekday]}`}
          </p>
          <p className="mt-1 text-stone-600">
            Every {WEEKDAY_FULL[rule.weekday]} • {formatMinuteTo12Hour(rule.startMinute)} – {formatMinuteTo12Hour(rule.endMinute)}
          </p>
        </div>

        <p className="text-xs text-stone-500">
          Are you sure you want to permanently delete this weekly schedule? Any future unbooked slots generated by it will be removed.
        </p>

        {error && <ErrorBanner message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={deleteRuleMutation.isPending}
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="destructive"
            loading={deleteRuleMutation.isPending}
            onClick={handleConfirm}
          >
            <Trash2 size={14} />
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function RuleCard({
  rule,
  exceptions = [],
  onToggleStatus,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  updating,
}: {
  rule: SlotRule
  exceptions?: SlotException[]
  onToggleStatus: () => void
  onEdit: () => void
  onDelete: () => void
  onBlock: () => void
  onUnblock: (exception: SlotException) => void
  updating: boolean
}) {
  const isActive = rule.status === 'ACTIVE'

  // Next occurrence calculation
  const nextOccur = useMemo(() => {
    const now = new Date()
    const istTimeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now)
    const [h, m] = istTimeStr.split(':').map(Number)
    const currentMinute = h * 60 + m

    const weekdayStr = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      weekday: 'short',
    }).format(now)
    const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const todayWeekday = map[weekdayStr] ?? now.getDay()

    let daysAhead = rule.weekday - todayWeekday
    if (daysAhead === 0) {
      if (currentMinute >= rule.endMinute) {
        daysAhead = 7
      }
    } else if (daysAhead < 0) {
      daysAhead += 7
    }

    const occurrence = new Date(now)
    occurrence.setDate(occurrence.getDate() + daysAhead)

    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(occurrence)

    const friendlyDate = occurrence.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      timeZone: TIMEZONE,
    })

    const startISO = new Date(`${dateStr}T${minutesToTime(rule.startMinute)}:00+05:30`).toISOString()
    const endISO = new Date(`${dateStr}T${minutesToTime(rule.endMinute)}:00+05:30`).toISOString()

    return { dateStr, friendlyDate, startISO, endISO, daysAhead }
  }, [rule])

  const activeBlockException = useMemo(() => {
    return exceptions.find((e) => {
      if (e.type !== 'BLOCK') return false
      if (e.offeringId && e.offeringId !== rule.offeringId) return false
      const exStart = new Date(e.startTime).getTime()
      const exEnd = new Date(e.endTime).getTime()
      const targetStart = new Date(nextOccur.startISO).getTime()
      const targetEnd = new Date(nextOccur.endISO).getTime()
      return exStart < targetEnd && exEnd > targetStart
    })
  }, [exceptions, rule.offeringId, nextOccur])

  const occurrenceDayLabel = nextOccur.daysAhead === 0 ? 'Today' : WEEKDAY_FULL[rule.weekday]

  return (
    <Card className={cn('flex flex-col gap-3 p-4 transition-all sm:flex-row sm:items-center sm:gap-4', !isActive && 'bg-stone-50/60 opacity-80')}>
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-semibold',
          isActive
            ? 'bg-amber-100 text-kala-amber'
            : 'bg-stone-200 text-stone-500',
        )}
      >
        <span className="text-xs uppercase">{WEEKDAY_FULL[rule.weekday].slice(0, 3)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-stone-800">
            {rule.title || `Every ${WEEKDAY_FULL[rule.weekday]}`}
          </p>
          {rule.offering && (
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
              {rule.offering.title || rule.offering.subcategory.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-stone-500">
          Every {WEEKDAY_FULL[rule.weekday]} • {formatMinuteTo12Hour(rule.startMinute)} – {formatMinuteTo12Hour(rule.endMinute)} • {rule.slotDurationMinutes} min slots
        </p>
        <p className="mt-0.5 text-[11px] text-stone-400">
          Effective from {rule.effectiveFrom}
          {rule.effectiveUntil ? ` until ${rule.effectiveUntil}` : ' (ongoing)'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        {/* ── Block / Unblock this Day quick-action ── */}
        {isActive && (
          activeBlockException ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/90 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-2xs">
              <Ban size={12} className="text-red-500 shrink-0" />
              <span>{occurrenceDayLabel} ({nextOccur.friendlyDate}) Blocked</span>
              <button
                type="button"
                onClick={() => onUnblock(activeBlockException)}
                title="Click to remove this block and restore slots"
                className="ml-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-red-700 shadow-2xs hover:bg-red-100 hover:text-red-900 transition-colors"
              >
                Unblock
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onBlock}
              title={`Cancel all open slots for ${occurrenceDayLabel} (${nextOccur.friendlyDate}) without changing your recurring weekly rule`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100"
            >
              <Ban size={12} />
              Block {occurrenceDayLabel} ({nextOccur.friendlyDate})
            </button>
          )
        )}

        {/* ── Active / Inactive Status Switch ── */}
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={updating}
          title={isActive ? 'Click to pause this rule (cancels future open slots)' : 'Click to activate this rule (generates slots)'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
            isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400',
            )}
          />
          {isActive ? 'Active' : 'Paused'}
        </button>

        {/* ── Edit Button ── */}
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          title="Edit rule parameters"
        >
          <Pencil size={15} />
        </button>

        {/* ── Delete Button ── */}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
          title="Permanently remove rule"
        >
          <Trash2 size={15} />
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

  const defaultSchedule = useMemo(() => getDefaultScheduleTimes(), [])
  const [offeringId, setOfferingId] = useState(offerings[0]?.id || '')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(defaultSchedule.startDate)
  const [startTime, setStartTime] = useState(defaultSchedule.startTime)
  const [endDate, setEndDate] = useState(defaultSchedule.endDate)
  const [endTime, setEndTime] = useState(defaultSchedule.endTime)
  const [duration, setDuration] = useState(60)
  const [error, setError] = useState('')

  const upcomingExtraSlots = useMemo(() => {
    const now = new Date().toISOString()
    return (availabilityQuery.data?.slots ?? [])
      .filter((s) => s.exceptionId && s.status === 'AVAILABLE' && s.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [availabilityQuery.data?.slots])

  async function handleCreate() {
    setError('')
    if (!offeringId) {
      setError('Please select an offering.')
      return
    }
    if (!startDate || !endDate) {
      setError('Please select both start and end date/time.')
      return
    }

    const startISO = new Date(`${startDate}T${startTime}:00+05:30`).toISOString()
    const endISO = new Date(`${endDate}T${endTime}:00+05:30`).toISOString()

    if (endISO <= startISO) {
      setError('End time must be after start time.')
      return
    }

    if (new Date(startISO) <= new Date()) {
      setError('Start time must be in the future. Please pick an upcoming date and time.')
      return
    }

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
      {/* ── Explanation Header ── */}
      <div className="flex flex-col gap-1 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-emerald-600" />
          <h2 className="text-sm font-semibold text-stone-800">One-Time Extra Availability</h2>
        </div>
        <p className="text-xs text-stone-500">
          Want to offer sessions on a specific date (e.g. this Saturday or a public holiday) outside your normal weekly schedule? Add extra slots here without modifying your weekly rules.
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* ── Form Card ── */}
      <Card className="space-y-5 border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <SectionLabel>Offering</SectionLabel>
            <OfferingSelect
              value={offeringId}
              onChange={setOfferingId}
              offerings={offerings}
              id="extra-offering"
            />
          </div>
          <div>
            <SectionLabel>Label (optional)</SectionLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Masterclass or Extra Office Hours"
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
            <SectionLabel>From (Start date &amp; time)</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                id="extra-start-date"
                value={startDate}
                onChange={setStartDate}
                min={todayISO()}
              />
              <TimeInput
                id="extra-start-time"
                value={startTime}
                onChange={setStartTime}
              />
            </div>
          </div>

          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
            <SectionLabel>To (End date &amp; time)</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                id="extra-end-date"
                value={endDate}
                onChange={setEndDate}
                min={startDate}
              />
              <TimeInput
                id="extra-end-time"
                value={endTime}
                onChange={setEndTime}
                minTime={startDate === endDate ? startTime : undefined}
              />
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Slot Duration</SectionLabel>
          <DurationPicker value={duration} onChange={setDuration} />
        </div>

        <div className="border-t border-stone-100 pt-4">
          <Button
            onClick={handleCreate}
            loading={createExceptionMutation.isPending}
            disabled={!offeringId}
          >
            <Plus size={16} />
            Add one-time availability
          </Button>
        </div>
      </Card>

      {/* ── Upcoming Extra Slots ── */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-600">
          Upcoming One-Time Extra Slots ({upcomingExtraSlots.length})
        </h3>
        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : upcomingExtraSlots.length === 0 ? (
          <EmptyState
            label="No upcoming extra slots"
            sublabel="Any one-off slots added above will be listed here."
          />
        ) : (
          <UpcomingSlotsGrid slots={upcomingExtraSlots} />
        )}
      </div>
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

  const defaultSchedule = useMemo(() => getDefaultScheduleTimes(), [])
  const [offeringId, setOfferingId] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(defaultSchedule.startDate)
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState(defaultSchedule.endDate)
  const [endTime, setEndTime] = useState('18:00')
  const [error, setError] = useState('')
  const [exceptionToDelete, setExceptionToDelete] = useState<SlotException | null>(null)

  const blockExceptions = (availabilityQuery.data?.exceptions ?? []).filter(
    (e) => e.type === 'BLOCK',
  )

  async function handleCreate() {
    setError('')
    if (!startDate || !endDate) {
      setError('Please select a date and time range.')
      return
    }

    const startISO = new Date(`${startDate}T${startTime}:00+05:30`).toISOString()
    const endISO = new Date(`${endDate}T${endTime}:00+05:30`).toISOString()

    if (endISO <= startISO) {
      setError('End time must be after start time.')
      return
    }

    if (new Date(endISO) <= new Date()) {
      setError('Block end time must be in the future. You cannot block a past time range.')
      return
    }

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
      {/* ── Explanation Header ── */}
      <div className="flex flex-col gap-1 rounded-2xl border border-red-100 bg-red-50/30 p-4">
        <div className="flex items-center gap-2">
          <Ban size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-stone-800">Block Time Off &amp; Vacations</h2>
        </div>
        <p className="text-xs text-stone-500">
          Need a day off, attending an event, or going on holiday? Blocking time will automatically cancel any open booking slots in that window. Booked slots with students are not automatically cancelled.
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* ── Form Card ── */}
      <Card className="space-y-5 border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <SectionLabel>Offering (leave empty to block ALL offerings)</SectionLabel>
            <OfferingSelect
              value={offeringId}
              onChange={setOfferingId}
              offerings={offerings}
              id="block-offering"
              includeAll
            />
          </div>
          <div>
            <SectionLabel>Reason / Note (optional)</SectionLabel>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Doctor's appointment, Personal vacation"
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-colors focus:border-kala-amber focus:outline-none focus:ring-2 focus:ring-kala-amber/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
            <SectionLabel>Block from (Start date &amp; time)</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                id="block-start-date"
                value={startDate}
                onChange={setStartDate}
                min={todayISO()}
              />
              <TimeInput
                id="block-start-time"
                value={startTime}
                onChange={setStartTime}
              />
            </div>
          </div>

          <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4">
            <SectionLabel>Block until (End date &amp; time)</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <DateInput
                id="block-end-date"
                value={endDate}
                onChange={setEndDate}
                min={startDate}
              />
              <TimeInput
                id="block-end-time"
                value={endTime}
                onChange={setEndTime}
                minTime={startDate === endDate ? startTime : undefined}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <Button
            variant="destructive"
            onClick={handleCreate}
            loading={createExceptionMutation.isPending}
          >
            <Ban size={16} />
            Block this time
          </Button>
        </div>
      </Card>

      {/* ── Active Blocks ── */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-600">
          Active Time Blocks ({blockExceptions.length})
        </h3>
        {availabilityQuery.isLoading ? (
          <p className="text-sm text-stone-400">Loading…</p>
        ) : blockExceptions.length === 0 ? (
          <EmptyState
            label="No time blocks active"
            sublabel="If you block hours or days off, they will appear here."
          />
        ) : (
          <div className="space-y-3">
            {blockExceptions.map((ex) => (
              <ExceptionCard
                key={ex.id}
                exception={ex}
                offerings={offerings}
                onDelete={() => setExceptionToDelete(ex)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteExceptionModal
        exception={exceptionToDelete}
        onClose={() => setExceptionToDelete(null)}
      />
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
          <div className="mb-2.5 flex items-center gap-2">
            <CalendarDays size={14} className="text-stone-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">{label}</h4>
            <div className="h-px flex-1 bg-stone-100" />
            <span className="text-[11px] text-stone-400">{daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {daySlots.map((slot) => {
              const origin = slotOriginLabel(slot)
              const isCancelled = slot.status === 'CANCELLED'
              return (
                <div
                  key={slot.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 shadow-xs transition-shadow hover:shadow-sm',
                    isCancelled
                      ? 'border-red-200/70 bg-red-50/25 opacity-75'
                      : 'border-stone-200/80 bg-white',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      isCancelled ? 'bg-red-100 text-red-500' : 'bg-amber-50 text-kala-amber',
                    )}
                  >
                    {isCancelled ? <Ban size={15} /> : <Clock size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-xs font-semibold',
                        isCancelled ? 'text-stone-600 line-through' : 'text-stone-800',
                      )}
                    >
                      {slot.title || slot.offering?.title || slot.offering?.subcategory.name || 'Available Slot'}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={slotStatusVariant(slot.status)}>
                      {isCancelled ? 'BLOCKED' : slot.status}
                    </Badge>
                    {origin && (
                      <span className="text-[10px] font-medium text-stone-400">{origin}</span>
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
  onDelete,
}: {
  exception: SlotException
  offerings: InstructorOfferingDto[]
  onDelete?: () => void
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
          {exception.title || (isBlock ? 'Time Block' : 'Extra Availability')}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {new Date(exception.startTime).toLocaleString('en-IN', {
            timeZone: TIMEZONE,
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' → '}
          {new Date(exception.endTime).toLocaleString('en-IN', {
            timeZone: TIMEZONE,
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        {offering ? (
          <p className="mt-0.5 text-xs text-stone-400">
            Offering: {offering.title || offering.subcategory.name}
          </p>
        ) : isBlock ? (
          <p className="mt-0.5 text-xs text-stone-400">All offerings blocked</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isBlock ? 'error' : 'success'}>{exception.type}</Badge>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title={isBlock ? 'Remove time block' : 'Remove extra time'}
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </Card>
  )
}

function ConfirmDeleteExceptionModal({
  exception,
  onClose,
}: {
  exception: SlotException | null
  onClose: () => void
}) {
  const deleteExceptionMutation = useDeleteSlotExceptionMutation()
  const [error, setError] = useState('')

  if (!exception) return null

  const isBlock = exception.type === 'BLOCK'

  async function handleConfirm() {
    if (!exception) return
    setError('')
    try {
      await deleteExceptionMutation.mutateAsync(exception.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal
      open={Boolean(exception)}
      onClose={deleteExceptionMutation.isPending ? () => {} : onClose}
      title={isBlock ? 'Remove Time Block?' : 'Remove Extra Availability?'}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
          <p className="font-semibold text-stone-900">
            {exception.title || (isBlock ? 'Time Block' : 'Extra Availability')}
          </p>
          <p className="mt-1 text-stone-500">
            {new Date(exception.startTime).toLocaleString('en-IN', {
              timeZone: TIMEZONE,
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' → '}
            {new Date(exception.endTime).toLocaleString('en-IN', {
              timeZone: TIMEZONE,
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <p className="text-xs text-stone-500">
          {isBlock
            ? 'Removing this time block will restore your regular recurring weekly schedule and reopen any unbooked slots that were previously blocked.'
            : 'Removing this extra availability will cancel any open unbooked slots in this window.'}
        </p>

        {error && <ErrorBanner message={error} />}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={deleteExceptionMutation.isPending}
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="destructive"
            loading={deleteExceptionMutation.isPending}
            onClick={handleConfirm}
          >
            <Trash2 size={14} />
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Upcoming All Slots Panel ─────────────────────────────────────────────────

function UpcomingPanel({
  offerings,
}: {
  offerings: InstructorOfferingDto[]
}) {
  const [filterOfferingId, setFilterOfferingId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'AVAILABLE' | 'BLOCKED' | 'ALL'>('AVAILABLE')
  const availabilityQuery = useInstructorAvailabilityQuery(
    filterOfferingId ? { offeringId: filterOfferingId } : undefined,
  )

  const now = new Date().toISOString()

  const allUpcomingSlots = useMemo(() => {
    return (availabilityQuery.data?.slots ?? [])
      .filter((s) => s.startTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [availabilityQuery.data?.slots, now])

  const upcomingBlocks = useMemo(() => {
    return (availabilityQuery.data?.exceptions ?? [])
      .filter((e) => e.type === 'BLOCK' && e.endTime > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [availabilityQuery.data?.exceptions, now])

  const availableCount = useMemo(
    () => allUpcomingSlots.filter((s) => s.status === 'AVAILABLE').length,
    [allUpcomingSlots],
  )
  const blockedCount = useMemo(
    () => allUpcomingSlots.filter((s) => s.status === 'CANCELLED').length,
    [allUpcomingSlots],
  )

  const displayedSlots = useMemo(() => {
    if (statusFilter === 'AVAILABLE') {
      return allUpcomingSlots.filter((s) => s.status === 'AVAILABLE').slice(0, 60)
    }
    if (statusFilter === 'BLOCKED') {
      return allUpcomingSlots.filter((s) => s.status === 'CANCELLED').slice(0, 60)
    }
    return allUpcomingSlots.slice(0, 60)
  }, [allUpcomingSlots, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            All Upcoming Slots ({displayedSlots.length})
          </h3>
          <p className="text-xs text-stone-400">
            Combined view of upcoming slots generated by weekly rules &amp; extra time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter('AVAILABLE')}
              className={cn(
                'rounded-lg px-2.5 py-1 transition-all',
                statusFilter === 'AVAILABLE'
                  ? 'bg-white text-stone-800 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-700',
              )}
            >
              Available ({availableCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('BLOCKED')}
              className={cn(
                'rounded-lg px-2.5 py-1 transition-all',
                statusFilter === 'BLOCKED'
                  ? 'bg-white text-red-700 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-700',
              )}
            >
              Blocked / Off ({blockedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                'rounded-lg px-2.5 py-1 transition-all',
                statusFilter === 'ALL'
                  ? 'bg-white text-stone-800 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-700',
              )}
            >
              All ({allUpcomingSlots.length})
            </button>
          </div>

          <div className="w-full sm:w-52">
            <OfferingSelect
              value={filterOfferingId}
              onChange={setFilterOfferingId}
              offerings={offerings}
              includeAll
              id="panel-offering-filter"
            />
          </div>
        </div>
      </div>

      {/* Active blocked notice if any */}
      {upcomingBlocks.length > 0 && statusFilter === 'AVAILABLE' && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
          <Ban size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-950">Active Time Off</p>
            <p className="mt-0.5 text-stone-600">
              Slots falling in the following blocked window{upcomingBlocks.length > 1 ? 's' : ''} are cancelled and closed for booking:
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {upcomingBlocks.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-300/80 bg-white px-2 py-0.5 text-[11px] font-medium text-amber-900 shadow-2xs"
                >
                  <span className="font-semibold">{formatDate(b.startTime)}</span> ({formatTime(b.startTime)} – {formatTime(b.endTime)})
                  {b.title ? ` • ${b.title}` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {availabilityQuery.isLoading ? (
        <p className="text-sm text-stone-400">Loading slots…</p>
      ) : displayedSlots.length === 0 ? (
        <EmptyState
          label={
            statusFilter === 'BLOCKED'
              ? 'No blocked slots found'
              : statusFilter === 'AVAILABLE'
                ? 'No upcoming available slots'
                : 'No slots found'
          }
          sublabel={
            statusFilter === 'BLOCKED'
              ? 'Any slots cancelled by time off blocks will appear here.'
              : 'Add a weekly rule or one-time extra availability to open bookable slots.'
          }
        />
      ) : (
        <UpcomingSlotsGrid slots={displayedSlots} />
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
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [effectiveUntil, setEffectiveUntil] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (rule) {
      setStartTime(minutesToTime(rule.startMinute))
      setEndTime(minutesToTime(rule.endMinute))
      setDuration(rule.slotDurationMinutes)
      setEffectiveUntil(rule.effectiveUntil ?? '')
      setError('')
    }
  }, [rule])

  async function handleSave() {
    if (!rule) return
    setError('')
    const startMinute = timeToMinutes(startTime)
    const endMinute = timeToMinutes(endTime)
    if (endMinute <= startMinute) {
      setError('End time must be after start time.')
      return
    }
    if ((endMinute - startMinute) % duration !== 0) {
      setError('The window must divide evenly by the slot duration.')
      return
    }

    try {
      await updateRuleMutation.mutateAsync({
        ruleId: rule.id,
        startMinute,
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
    <Modal open={Boolean(rule)} onClose={onClose} title="Edit Weekly Rule">
      {rule && (
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-3 text-xs text-stone-600">
            <p className="font-semibold text-stone-800">
              {rule.title || `Every ${WEEKDAY_FULL[rule.weekday]}`}
            </p>
            <p className="mt-0.5 text-stone-500">
              Every {WEEKDAY_FULL[rule.weekday]} • Effective from {rule.effectiveFrom}
            </p>
          </div>

          <ErrorBanner message={error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SectionLabel>Start time</SectionLabel>
              <TimeInput
                id="edit-rule-start"
                value={startTime}
                onChange={(v) => {
                  setStartTime(v)
                  setError('')
                }}
              />
            </div>
            <div>
              <SectionLabel>End time</SectionLabel>
              <TimeInput
                id="edit-rule-end"
                value={endTime}
                onChange={(v) => {
                  setEndTime(v)
                  setError('')
                }}
                minTime={startTime}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Slot duration</SectionLabel>
            <DurationPicker value={duration} onChange={setDuration} />
          </div>

          <div>
            <SectionLabel>Effective until (optional)</SectionLabel>
            <DateInput
              id="edit-rule-until"
              value={effectiveUntil}
              onChange={setEffectiveUntil}
              min={todayISO()}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              loading={updateRuleMutation.isPending}
              onClick={handleSave}
            >
              Save changes
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; desc: string; Icon: typeof Repeat2 }[] = [
  {
    id: 'rules',
    label: 'Weekly Schedule',
    desc: 'Recurring weekly hours',
    Icon: Repeat2,
  },
  {
    id: 'extra',
    label: 'One-Time Extra',
    desc: 'Extra hours for specific dates',
    Icon: Zap,
  },
  {
    id: 'block',
    label: 'Block Time Off',
    desc: 'Vacations & busy hours',
    Icon: Ban,
  },
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
        Loading availability workspace…
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
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Availability</h1>
          <p className="mt-1 text-sm text-stone-500">
            Control your schedule: set recurring weekly hours, open one-time availability, or block time off.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-xs">
          <Clock size={14} className="text-kala-amber" />
          <span>All times are in <strong>Indian Standard Time (IST • 12-hr AM/PM)</strong></span>
        </div>
      </div>

      {/* ── Tabs (Redesigned with helper descriptions) ── */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TABS.map(({ id, label, desc, Icon }) => {
          const isSelected = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200',
                isSelected
                  ? 'border-kala-amber bg-white shadow-sm ring-1 ring-kala-amber/30'
                  : 'border-stone-200/70 bg-stone-50/60 hover:border-stone-300 hover:bg-stone-50',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                  isSelected
                    ? 'bg-kala-amber text-white'
                    : 'bg-stone-200/70 text-stone-500',
                )}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-stone-900' : 'text-stone-700',
                  )}
                >
                  {label}
                </p>
                <p className="truncate text-xs text-stone-400">{desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Tab Panels ── */}
      <div key={activeTab} style={{ animation: 'fadeSlideIn 150ms ease both' }}>
        {activeTab === 'rules' && (
          <WeeklyRulesTab
            offerings={offerings}
            onEditRule={(rule) => setEditingRule(rule)}
          />
        )}
        {activeTab === 'extra' && <ExtraTimeTab offerings={offerings} />}
        {activeTab === 'block' && <BlockTimeTab offerings={offerings} />}
      </div>

      {/* ── Upcoming Available Slots Agenda ── */}
      <div className="border-t border-stone-200 pt-8">
        <UpcomingPanel offerings={offerings} />
      </div>

      {/* ── Edit Rule Modal ── */}
      <EditRuleModal rule={editingRule} onClose={() => setEditingRule(null)} />
    </div>
  )
}