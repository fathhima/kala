import { useState, useMemo } from 'react'
import { Plus, ChevronUp, CalendarDays, Clock, Trash2 } from 'lucide-react'
import { useInstructorStore } from '../../stores/instructorStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { cn, formatTime } from '../../lib/utils'
import type { Slot } from '../../types'

/* ── Duration presets ─────────────────────────────────────── */
const DURATIONS = [
  { label: '30 min', mins: 30 },
  { label: '1 hr', mins: 60 },
  { label: '1.5 hrs', mins: 90 },
  { label: '2 hrs', mins: 120 },
]

/* ── Next N days as date chips ───────────────────────────── */
function getUpcomingDays(n = 21) {
  const days: { key: string; dayShort: string; dayNum: number; monthShort: string; isToday: boolean }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      key: d.toISOString().slice(0, 10),
      dayShort: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthShort: d.toLocaleDateString('en-IN', { month: 'short' }),
      isToday: i === 0,
    })
  }
  return days
}

/* ── Group slots by date label ────────────────────────────── */
function groupByDate(slots: Slot[]) {
  const map = new Map<string, Slot[]>()
  for (const slot of [...slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())) {
    const d = new Date(slot.startTime)
    const label = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(slot)
  }
  return map
}

/* ── Component ─────────────────────────────────────────────── */
export function ManageSlots() {
  const { slots, addSlot, deleteSlot, profile } = useInstructorStore()

  const skills = profile?.skills ?? []
  const hasMultipleSkills = skills.length > 1
  const [activeSkillId, setActiveSkillId] = useState(skills[0]?.id ?? '')

  // Add-slots panel
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [durationMins, setDurationMins] = useState(60)
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set())
  const [startTime, setStartTime] = useState('10:00')
  const [formSkillId, setFormSkillId] = useState(skills[0]?.id ?? '')

  const upcomingDays = useMemo(() => getUpcomingDays(21), [])

  const toggleDate = (key: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleCreate = () => {
    if (!startTime || selectedDates.size === 0) return
    const [hStr, mStr] = startTime.split(':').map(Number)
    const sortedDates = [...selectedDates].sort()
    sortedDates.forEach((dateKey, i) => {
      const [year, month, day] = dateKey.split('-').map(Number)
      const start = new Date(year, month - 1, day, hStr, mStr)
      const end = new Date(start.getTime() + durationMins * 60_000)
      const slot: Slot = {
        id: `slot-${Date.now()}-${i}`,
        instructorId: profile?.id || 'inst1',
        skillId: formSkillId || undefined,
        title: title.trim() || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone: 'Asia/Kolkata',
        status: 'AVAILABLE',
      }
      addSlot(slot)
    })
    setSelectedDates(new Set())
    setTitle('')
    setShowForm(false)
  }

  // Slots for this skill (or untagged slots in first tab)
  const slotsForSkill = useMemo(() => {
    if (!hasMultipleSkills) return slots
    const isFirst = activeSkillId === skills[0]?.id
    return slots.filter((s) =>
      s.skillId === activeSkillId || (isFirst && !s.skillId)
    )
  }, [slots, activeSkillId, hasMultipleSkills, skills])

  const grouped = useMemo(() => groupByDate(slotsForSkill), [slotsForSkill])

  const totalForSkill = slotsForSkill.length
  const activeSkillName = skills.find((s) => s.id === activeSkillId)?.name ?? 'this skill'

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Slots</h1>
          <p className="text-stone-500 text-sm mt-1">
            {slots.length} total slot{slots.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="gap-2"
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showForm ? 'Close' : 'Add Slots'}
        </Button>
      </div>

      {/* ── Skill tabs ─────────────────────────────────────── */}
      {hasMultipleSkills && (
        <div className="flex gap-2 flex-wrap">
          {skills.map((skill) => {
            const count = slots.filter((s) =>
              s.skillId === skill.id || (skill.id === skills[0]?.id && !s.skillId)
            ).length
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => setActiveSkillId(skill.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                  activeSkillId === skill.id
                    ? 'bg-kala-amber text-white border-kala-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber hover:text-kala-brown'
                )}
              >
                {skill.name}
                {count > 0 && (
                  <span className={cn(
                    'ml-2 text-xs px-1.5 py-0.5 rounded-full',
                    activeSkillId === skill.id ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Add Slots Panel ────────────────────────────────── */}
      {showForm && (
        <Card className="p-6 border-kala-amber/30 bg-amber-50/30">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-5">
            Create Slots
          </h2>

          <div className="space-y-5">

            {/* Skill selector (if multiple skills) */}
            {hasMultipleSkills && (
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">Skill</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => setFormSkillId(skill.id)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all',
                        formSkillId === skill.id
                          ? 'bg-kala-brown text-white border-kala-brown'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber'
                      )}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div>
              <p className="text-xs font-medium text-stone-500 mb-2">Session Duration</p>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map((d) => (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setDurationMins(d.mins)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                      durationMins === d.mins
                        ? 'bg-kala-amber text-white border-kala-amber'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-kala-amber hover:text-kala-brown'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-stone-500">
                  Select Dates
                  {selectedDates.size > 0 && (
                    <span className="ml-2 text-kala-amber font-semibold">{selectedDates.size} selected</span>
                  )}
                </p>
                {selectedDates.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDates(new Set())}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1.5 -mx-1 px-1">
                {upcomingDays.map((day) => {
                  const selected = selectedDates.has(day.key)
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => toggleDate(day.key)}
                      className={cn(
                        'flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl border-2 text-center transition-all min-w-[3.5rem]',
                        selected
                          ? 'bg-kala-amber border-kala-amber text-white shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:border-kala-amber hover:text-kala-brown'
                      )}
                    >
                      <span className={cn(
                        'text-[10px] font-medium uppercase tracking-wide',
                        selected ? 'text-white/80' : 'text-stone-400'
                      )}>
                        {day.isToday ? 'Today' : day.dayShort}
                      </span>
                      <span className="text-base font-bold leading-tight">{day.dayNum}</span>
                      <span className={cn(
                        'text-[10px]',
                        selected ? 'text-white/70' : 'text-stone-400'
                      )}>
                        {day.monthShort}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Start time + Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Start Time
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-kala-amber transition-colors"
                  />
                </div>
                {startTime && durationMins && (
                  <p className="text-xs text-stone-400 mt-1.5">
                    Ends at {(() => {
                      const [h, m] = startTime.split(':').map(Number)
                      const end = new Date(0, 0, 0, h, m + durationMins)
                      return end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    })()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">
                  Session Label <span className="text-stone-300">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Batch"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-kala-amber transition-colors"
                />
              </div>
            </div>

            {/* Create button */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleCreate}
                disabled={selectedDates.size === 0 || !startTime}
                className="gap-2"
              >
                <CalendarDays size={15} />
                Create {selectedDates.size > 0 ? `${selectedDates.size} ` : ''}slot{selectedDates.size !== 1 ? 's' : ''}
              </Button>
              {selectedDates.size === 0 && (
                <p className="text-xs text-stone-400">Select at least one date above</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Slot list grouped by date ──────────────────────── */}
      {totalForSkill === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 rounded-2xl">
          <CalendarDays size={40} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 mb-1">No slots for {activeSkillName}</p>
          <p className="text-xs text-stone-400 mb-4">Use the "Add Slots" panel above to create your availability</p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus size={16} /> Add Slots
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([dateLabel, dateSlots]) => (
            <section key={dateLabel}>
              {/* Date heading */}
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays size={14} className="text-stone-400 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-stone-600">{dateLabel}</h3>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-xs text-stone-400">{dateSlots.length} slot{dateSlots.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Slot rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dateSlots.map((slot) => {
                  const statusVariant = slot.status === 'AVAILABLE' ? 'success' : slot.status === 'BOOKED' ? 'error' : 'warning'
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl px-4 py-3 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        {slot.title && (
                          <p className="text-sm font-medium text-stone-800 truncate mb-0.5">{slot.title}</p>
                        )}
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock size={11} />
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </p>
                      </div>
                      <Badge variant={statusVariant}>{slot.status}</Badge>
                      {slot.status === 'AVAILABLE' && (
                        <button
                          type="button"
                          onClick={() => deleteSlot(slot.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
