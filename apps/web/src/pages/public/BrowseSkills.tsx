import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useCategoriesQuery } from '@/features/categories/hooks'

export function BrowseSkills() {
  const { data: categories = [], isLoading, isError } = useCategoriesQuery()

  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const skills = categories.flatMap((category) =>
    category.subcategories
      .filter((subcategory) =>
        [category.name, subcategory.name, subcategory.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch)),
      )
      .map((subcategory) => ({ category, subcategory })),
  )

  if (isLoading) {
    return (
      <div className="page-container py-12 text-sm text-stone-500">
        Loading skills…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="page-container py-12 text-sm text-red-500">
        Could not load skills.
      </div>
    )
  }

  return (
    <div className="page-container py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-kala-brown">
          Creative Skills
        </h1>
        <p className="mt-3 text-stone-500">
          Discover skills taught by approved Kala instructors.
        </p>
      </div>

      <div className="relative mx-auto mb-10 max-w-xl">
        <Search
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search skills…"
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm"
        />
      </div>

      {skills.length === 0 ? (
        <Card className="p-10 text-center text-sm text-stone-500">
          No skills match your search.
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map(({ category, subcategory }) => (
            <Link
              key={subcategory.id}
              to={`/instructors?subcategoryId=${subcategory.id}`}
            >
              <Card hover className="h-full p-5">
                <p className="text-xs font-medium text-kala-terracotta">
                  {category.name}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-stone-800">
                  {subcategory.name}
                </h2>
                <p className="mt-2 text-sm text-stone-500">
                  {subcategory.description ||
                    'Find an instructor and start learning.'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}