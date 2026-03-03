import { Link } from 'react-router-dom'
import { Star, MapPin, BadgeCheck } from 'lucide-react'
import type { InstructorProfile } from '../../types'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { formatPrice } from '../../lib/utils'

export function InstructorCard({ instructor }: { instructor: InstructorProfile }) {
  return (
    <Link to={`/instructors/${instructor.id}`}>
      <Card hover className="overflow-hidden h-full flex flex-col">
        {instructor.portfolioItems[0] && (
          <div className="h-40 overflow-hidden">
            <img
              src={instructor.portfolioItems[0].imageUrl}
              alt={instructor.user.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start gap-3 mb-3">
            <Avatar name={instructor.user.name} src={instructor.user.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-stone-800 text-sm truncate">{instructor.user.name}</h3>
                {instructor.isTopRated && <BadgeCheck size={15} className="text-kala-amber shrink-0" />}
              </div>
              {instructor.location && (
                <div className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                  <MapPin size={11} />
                  {instructor.location}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2 mb-3 flex-1">{instructor.bio}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {instructor.skills.slice(0, 3).map((skill) => (
              <Badge key={skill.id}>{skill.name}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 text-sm">
              <Star size={13} className="text-kala-amber fill-kala-amber" />
              <span className="font-semibold text-stone-700">{instructor.avgRating.toFixed(1)}</span>
            </div>
            <span className="text-sm font-semibold text-kala-terracotta">
              {formatPrice(instructor.pricing)}<span className="text-xs font-normal text-stone-400">/session</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
