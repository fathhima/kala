import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminInstructorControllerFindAllStatusEnum, type AdminInstructorControllerFindAllStatusEnum as ApplicationStatus, } from '@/api'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useInstructorApplicationsQuery } from '@/features/admin/instructor-applications/hooks'
import { getApiErrorResponse } from '@/lib/api-error'

const PAGE_SIZE = 10

const statusVariant = (status: string) => {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'error'
  if (status === 'CHANGES_REQUESTED' || status === 'PENDING') return 'warning'
  return 'default'
}

export function InstructorApplications() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(Number(searchParams.get('page') || '1'), 1)
  const committedSearch = searchParams.get('search')?.trim() ?? ''

  const rawStatus = searchParams.get('status')
  const status = Object.values(AdminInstructorControllerFindAllStatusEnum).includes(rawStatus as ApplicationStatus,)
    ? (rawStatus as ApplicationStatus)
    : undefined

  const [searchInput, setSearchInput] = useState(committedSearch)

  useEffect(() => {
    setSearchInput(committedSearch)
  }, [committedSearch])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim()

      if (nextSearch === committedSearch) return

      const next = new URLSearchParams(searchParams)

      if (nextSearch) next.set('search', nextSearch)
      else next.delete('search')

      next.set('page', '1')
      setSearchParams(next, { replace: true })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput, committedSearch, searchParams, setSearchParams])

  const query = useMemo(() => ({
      page,
      limit: PAGE_SIZE,
      status,
      search: committedSearch || undefined,
    }),
    [page, status, committedSearch],
  )

  const { data, isLoading, isError, error, isFetching } = useInstructorApplicationsQuery(query)

  const updateStatus = (value: string) => {
    const next = new URLSearchParams(searchParams)

    if (value) next.set('status', value)
    else next.delete('status')

    next.set('page', '1')
    setSearchParams(next)
  }

  const updatePage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading instructor applications…</div>
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-500">
        {getApiErrorResponse(error, 'Failed to load instructor applications.')}
      </div>
    )
  }

  const totalPages = Math.max(Math.ceil(data.meta.total / data.meta.limit), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Instructor Applications</h1>
        <p className="mt-1 text-sm text-stone-500">
          {data.meta.total} application{data.meta.total === 1 ? '' : 's'}
          {isFetching ? ' · Refreshing…' : ''}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-stone-500">Search</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by applicant name or email…"
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-stone-500">Status</span>
          <select
            value={status ?? ''}
            onChange={(event) => updateStatus(event.target.value)}
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHANGES_REQUESTED">Changes requested</option>
          </select>
        </label>
      </div>

      {data.items.length === 0 ? (
        <Card className="p-8 text-center text-sm text-stone-500">
          No instructor applications found.
        </Card>
      ) : (
        <div className="space-y-4">
          {data.items.map((application) => {
            const applicant = application.profile?.user

            return (
              <Card key={application.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar
                      name={applicant?.name ?? 'Applicant'}
                      src={applicant?.imageUrl ?? undefined}
                      size="lg"
                    />

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-stone-800">
                          {applicant?.name ?? 'Unknown applicant'}
                        </h2>
                        <Badge variant={statusVariant(application.status)}>
                          {application.status}
                        </Badge>
                      </div>

                      <p className="truncate text-sm text-stone-500">{applicant?.email}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {application.profile?.location || 'Location not supplied'} ·{' '}
                        {application.offerings.length} offering
                        {application.offerings.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <Link to={`/admin/applications/${application.id}`}>
                    <Button variant="outline">Review application</Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">
          Page {data.meta.page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updatePage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => updatePage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}