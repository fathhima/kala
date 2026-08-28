import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useCategoriesQuery } from '@/features/categories/hooks'
import { usePublicInstructorsQuery } from '@/features/instructor/hooks'

const PAGE_SIZE = 12

export function BrowseInstructors() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Math.max(Number(searchParams.get('page') || '1'), 1)
  const subcategoryId = searchParams.get('subcategoryId') || undefined
  const committedSearch = searchParams.get('search') || ''

  const [search, setSearch] = useState(committedSearch)

  const categoriesQuery = useCategoriesQuery()
  const instructorsQuery = usePublicInstructorsQuery({
    page,
    limit: PAGE_SIZE,
    search: committedSearch || undefined,
    subcategoryId,
  })

  useEffect(() => {
    setSearch(committedSearch)
  }, [committedSearch])

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()

    const next = new URLSearchParams(searchParams)
    const value = search.trim()

    if (value) next.set('search', value)
    else next.delete('search')

    next.set('page', '1')
    setSearchParams(next)
  }

  const updateSkill = (value: string) => {
    const next = new URLSearchParams(searchParams)

    if (value) next.set('subcategoryId', value)
    else next.delete('subcategoryId')

    next.set('page', '1')
    setSearchParams(next)
  }

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  if (instructorsQuery.isLoading) {
    return (
      <div className="page-container py-12 text-sm text-stone-500">
        Loading instructors…
      </div>
    )
  }

  if (instructorsQuery.isError || !instructorsQuery.data) {
    return (
      <div className="page-container py-12 text-sm text-red-500">
        Could not load instructors.
      </div>
    )
  }

  const { items, meta } = instructorsQuery.data
  const skills =
    categoriesQuery.data?.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        ...subcategory,
        categoryName: category.name,
      })),
    ) ?? []

  return (
    <div className="page-container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-kala-brown">
          Browse Instructors
        </h1>
        <p className="mt-2 text-stone-500">
          {meta.total} approved instructor{meta.total === 1 ? '' : 's'}{' '}
          available.
        </p>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-[1fr_260px]">
        <form onSubmit={submitSearch} className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search instructor, skill, or style…"
            className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm"
          />
        </form>

        <select
          value={subcategoryId ?? ''}
          onChange={(event) => updateSkill(event.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 text-sm"
        >
          <option value="">All skills</option>
          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.categoryName} — {skill.name}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-stone-500">
          No instructors match your search.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((instructor) => {
            const firstOffering = instructor.offerings[0]
            const firstImage = firstOffering?.media.find(
              (media) => media.type === 'IMAGE',
            )

            return (
              <Link key={instructor.id} to={`/instructors/${instructor.id}`}>
                <Card hover className="h-full overflow-hidden">
                  {firstImage && (
                    <img
                      src={firstImage.viewUrl}
                      alt={instructor.name}
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={instructor.name}
                        src={instructor.imageUrl ?? undefined}
                        size="md"
                      />
                      <div>
                        <h2 className="font-semibold text-stone-800">
                          {instructor.name}
                        </h2>
                        {instructor.location && (
                          <p className="flex items-center gap-1 text-xs text-stone-500">
                            <MapPin size={12} /> {instructor.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm text-stone-500">
                      {instructor.bio || 'Creative instructor on Kala.'}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {instructor.offerings.slice(0, 3).map((offering) => (
                        <span
                          key={offering.id}
                          className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-kala-terracotta"
                        >
                          {offering.subcategory.name}
                        </span>
                      ))}
                    </div>

                    {firstOffering && (
                      <p className="mt-4 text-sm font-semibold text-kala-terracotta">
                        From ₹
                        {Number(firstOffering.hourlyRate).toLocaleString(
                          'en-IN',
                        )}{' '}
                        / hour
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          disabled={!meta.hasPrevPage}
          onClick={() => updatePage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!meta.hasNextPage}
          onClick={() => updatePage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}