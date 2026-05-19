import { useEffect, useMemo, useState } from 'react'
import {
  Role as RoleEnum,
  UserControllerGetAdminUsersStatusEnum,
  type Role,
} from '@/api'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getApiErrorResponse } from '@/lib/api-error'
import {
  useAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
} from '@/features/admin/users/hooks'

const PAGE_SIZE = 10

type UserStatus =
  (typeof UserControllerGetAdminUsersStatusEnum)[keyof typeof UserControllerGetAdminUsersStatusEnum]

const getRoleBadgeVariant = (role: Role) => {
  if (role === 'ADMIN') return 'error'
  if (role === 'INSTRUCTOR') return 'warning'
  return 'info'
}

export function ManageUsers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusMutation = useUpdateAdminUserStatusMutation()

  const page = Math.max(Number(searchParams.get('page') || '1') || 1, 1)
  const committedSearch = searchParams.get('search')?.trim() ?? ''

  const rawRole = searchParams.get('role')
  const role = Object.values(RoleEnum).includes(rawRole as Role)
    ? (rawRole as Role)
    : undefined

  const rawStatus = searchParams.get('status')
  const status = Object.values(UserControllerGetAdminUsersStatusEnum).includes(
    rawStatus as UserStatus,
  )
    ? (rawStatus as UserStatus)
    : undefined

  const [searchInput, setSearchInput] = useState(committedSearch)

  useEffect(() => {
    setSearchInput(committedSearch)
  }, [committedSearch])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim()

      if (nextSearch === committedSearch) {
        return
      }

      const nextParams = new URLSearchParams(searchParams)

      if (nextSearch) {
        nextParams.set('search', nextSearch)
      } else {
        nextParams.delete('search')
      }

      nextParams.set('page', '1')
      setSearchParams(nextParams, { replace: true })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput, committedSearch, searchParams, setSearchParams])

  const query = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: committedSearch || undefined,
      role,
      status,
    }),
    [page, committedSearch, role, status],
  )

  const { data, isLoading, isError, error, isFetching } = useAdminUsersQuery(query)

  const handlePageChange = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(nextPage))
    setSearchParams(nextParams)
  }

  const handleRoleChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set('role', value)
    } else {
      nextParams.delete('role')
    }

    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  const handleStatusChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set('status', value)
    } else {
      nextParams.delete('status')
    }

    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await statusMutation.mutateAsync({
        id: userId,
        isActive: !isActive,
      })
    } catch {
    }
  }

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading users...</div>
  }

  if (isError || !data) {
    return (
      <div className="text-sm text-red-500">
        {getApiErrorResponse(error, 'Failed to load users')}
      </div>
    )
  }

  const totalPages = Math.max(Math.ceil(data.meta.total / data.meta.limit), 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-kala-brown">Manage Users</h1>
          <p className="text-stone-500 text-sm mt-1">
            {data.meta.total} total users
            {isFetching ? ' • Refreshing...' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-stone-500">Search</span>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 shadow-sm outline-none transition focus:border-kala-brown focus:ring-2 focus:ring-kala-brown/20"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-stone-500">Role</span>
            <select
              value={role ?? ''}
              onChange={(event) => handleRoleChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 shadow-sm outline-none transition focus:border-kala-brown focus:ring-2 focus:ring-kala-brown/20"
            >
              <option value="">All roles</option>
              <option value={RoleEnum.Student}>Student</option>
              <option value={RoleEnum.Instructor}>Instructor</option>
              <option value={RoleEnum.Admin}>Admin</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-stone-500">Status</span>
            <select
              value={status ?? ''}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 shadow-sm outline-none transition focus:border-kala-brown focus:ring-2 focus:ring-kala-brown/20"
            >
              <option value="">All statuses</option>
              <option value={UserControllerGetAdminUsersStatusEnum.Active}>Active</option>
              <option value={UserControllerGetAdminUsersStatusEnum.Blocked}>Blocked</option>
            </select>
          </label>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Roles</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.items.map((user) => {
                const rowUpdating =
                  statusMutation.isPending &&
                  statusMutation.variables?.id === user.id

                return (
                  <tr
                    key={user.id}
                    className="border-b border-stone-50 hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.imageUrl ?? undefined} size="sm" />
                        <div>
                          <p className="font-medium text-stone-800">{user.name}</p>
                          <p className="text-xs text-stone-400">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-stone-500">{user.email}</td>

                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((itemRole) => (
                          <Badge key={itemRole} variant={getRoleBadgeVariant(itemRole)}>
                            {itemRole}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <Badge variant={user.isActive ? 'success' : 'error'}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </Badge>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>

                        {user.roles.includes('ADMIN') ? (
                          <Button variant="outline" size="sm" disabled>
                            Cannot block admin
                          </Button>
                        ) : (
                          <Button
                            variant={user.isActive ? 'destructive' : 'primary'}
                            size="sm"
                            loading={rowUpdating}
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? 'Block' : 'Unblock'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {data.items.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-stone-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4">
          <p className="text-sm text-stone-500">
            Page {data.meta.page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.meta.hasPrevPage}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.meta.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}