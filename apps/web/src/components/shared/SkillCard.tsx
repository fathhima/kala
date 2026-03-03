import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Skill } from '../../types'
import { Card } from '../ui/Card'

const skillColors: Record<string, string> = {
  painting: 'from-blue-50 to-indigo-50 border-blue-100',
  mehendi: 'from-orange-50 to-amber-50 border-orange-100',
  calligraphy: 'from-purple-50 to-violet-50 border-purple-100',
  'resin-art': 'from-teal-50 to-cyan-50 border-teal-100',
  'clay-modelling': 'from-rose-50 to-pink-50 border-rose-100',
  'handmade-crafts': 'from-green-50 to-emerald-50 border-green-100',
}

const skillEmojis: Record<string, string> = {
  painting: '🎨',
  mehendi: '🌿',
  calligraphy: '✍️',
  'resin-art': '💎',
  'clay-modelling': '🏺',
  'handmade-crafts': '🧶',
}

export function SkillCard({ skill }: { skill: Skill }) {
  const colorClass = skillColors[skill.slug] || 'from-stone-50 to-gray-50 border-stone-100'
  const emoji = skillEmojis[skill.slug] || '🎭'

  return (
    <Link to={`/instructors?skill=${skill.slug}`}>
      <Card hover className={`bg-gradient-to-br ${colorClass} p-5 h-full`}>
        <div className="text-3xl mb-3">{emoji}</div>
        <h3 className="font-semibold text-stone-800 mb-1">{skill.name}</h3>
        <p className="text-xs text-stone-500 leading-relaxed mb-3 line-clamp-2">{skill.description}</p>
        <div className="flex items-center gap-1 text-xs font-medium text-kala-terracotta">
          Explore <ArrowRight size={12} />
        </div>
      </Card>
    </Link>
  )
}
