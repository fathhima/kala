import { Calendar, Clock, Trash2 } from 'lucide-react'
import type { Slot } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDate, formatTime } from '../../lib/utils'

interface SlotCardProps {
  slot: Slot
  onDelete?: (id: string) => void
  showDelete?: boolean
}

export function SlotCard({ slot, onDelete, showDelete = false }: SlotCardProps) {
  const statusVariant = slot.status === 'AVAILABLE' ? 'success' : slot.status === 'BOOKED' ? 'error' : 'warning'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {slot.title && <h4 className="font-medium text-stone-800 text-sm mb-1">{slot.title}</h4>}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Calendar size={12} />
              {formatDate(slot.startTime)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Clock size={12} />
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Badge variant={statusVariant}>{slot.status}</Badge>
          {showDelete && slot.status === 'AVAILABLE' && onDelete && (
            <Button variant="ghost" size="sm" className="p-1.5 text-stone-400 hover:text-red-500" onClick={() => onDelete(slot.id)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
