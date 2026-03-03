import { useState } from 'react'
import { Search } from 'lucide-react'
import { SkillCard } from '../../components/shared/SkillCard'
import { useSkillStore } from '../../stores/skillStore'

export function BrowseSkills() {
  const { skills } = useSkillStore()
  const [query, setQuery] = useState('')

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.description?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="page-container py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-kala-brown mb-3">Creative Skills</h1>
        <p className="text-stone-500 max-w-md mx-auto">Explore artistic skills taught by passionate instructors. Find what sparks your creativity.</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10 relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kala-amber shadow-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-stone-500">No skills found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
