import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { InstructorCard } from '../../components/shared/InstructorCard'
import { useInstructorStore } from '../../stores/instructorStore'
import { useSkillStore } from '../../stores/skillStore'
import { Button } from '../../components/ui/Button'

type SortOption = 'top-rated' | 'price-low' | 'price-high' | 'newest'

export function BrowseInstructors() {
  const { instructors } = useInstructorStore()
  const { skills } = useSkillStore()
  const [searchParams] = useSearchParams()

  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '')
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sort, setSort] = useState<SortOption>('top-rated')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const approved = instructors.filter((i) => i.isApproved)

  const filtered = useMemo(() => {
    let result = approved.filter((inst) => {
      const matchesSkill = !selectedSkill || inst.skills.some((s) => s.slug === selectedSkill)
      const matchesRating = inst.avgRating >= minRating
      const matchesPrice = inst.pricing <= maxPrice
      return matchesSkill && matchesRating && matchesPrice
    })

    if (sort === 'top-rated') result = [...result].sort((a, b) => b.avgRating - a.avgRating)
    else if (sort === 'price-low') result = [...result].sort((a, b) => a.pricing - b.pricing)
    else if (sort === 'price-high') result = [...result].sort((a, b) => b.pricing - a.pricing)
    else if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return result
  }, [approved, selectedSkill, minRating, maxPrice, sort])

  const clearFilters = () => {
    setSelectedSkill('')
    setMinRating(0)
    setMaxPrice(5000)
    setSort('top-rated')
  }

  const hasFilters = selectedSkill || minRating > 0 || maxPrice < 5000

  return (
    <div className="page-container py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-kala-brown mb-2">Browse Instructors</h1>
          <p className="text-stone-500">{filtered.length} instructor{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
          <SlidersHorizontal size={16} /> Filters
          {hasFilters && <span className="h-2 w-2 bg-kala-terracotta rounded-full" />}
        </Button>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Skill filter */}
            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2 block">Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kala-amber"
              >
                <option value="">All Skills</option>
                {skills.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>

            {/* Min rating */}
            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2 block">Min Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}</label>
              <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-kala-amber" />
            </div>

            {/* Max price */}
            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2 block">Max Price: ₹{maxPrice}</label>
              <input type="range" min={100} max={5000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-kala-amber" />
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2 block">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kala-amber"
              >
                <option value="top-rated">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-xs text-kala-terracotta hover:underline">
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((inst) => <InstructorCard key={inst.id} instructor={inst} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-stone-500 mb-4">No instructors match your filters.</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
    </div>
  )
}
