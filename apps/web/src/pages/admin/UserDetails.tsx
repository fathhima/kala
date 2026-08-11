import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Role } from '@/api'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getApiErrorResponse } from '@/lib/api-error'
import { useAdminUserQuery, useUpdateAdminUserStatusMutation, } from '@/features/admin/users/hooks'

const getRoleBadgeVariant = (role: Role) => {
  if (role === 'ADMIN') return 'error'
  if (role === 'INSTRUCTOR') return 'warning'
  return 'info'
}

export function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const statusMutation = useUpdateAdminUserStatusMutation()

  if (!id) {
    return <Navigate to="/admin/users" replace />
  }

  const { data: user, isLoading, isError, error } = useAdminUserQuery(id)

  const handleToggleStatus = async () => {
    if (!user) return

    try {
      await statusMutation.mutateAsync({
        id: user.data.id,
        isActive: !user.data.isActive,
      })
    } catch {
    }
  }

  if (isLoading) {
    return <div className="text-sm text-stone-500">Loading user details...</div>
  }

  if (isError || !user) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={15} /> Back to users
        </Link>
        <div className="text-sm text-red-500">
          {getApiErrorResponse(error, 'Failed to load user details')}
        </div>
      </div>
    )
  }

  const isAdminUser = user.data.roles.includes('ADMIN')

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft size={15} /> Back to users
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.data.name} src={user.data.imageUrl ?? undefined} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-kala-brown">{user.data.name}</h1>
              <p className="text-sm text-stone-500">{user.data.email}</p>
            </div>
          </div>

          {isAdminUser ? (
            <Button variant="outline" disabled>
              Cannot block admin
            </Button>
          ) : (
            <Button
              variant={user.data.isActive ? 'destructive' : 'primary'}
              loading={statusMutation.isPending}
              onClick={handleToggleStatus}
            >
              {user.data.isActive ? 'Block User' : 'Unblock User'}
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">User Details</h2>

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-stone-400">User ID</p>
            <p className="font-medium text-stone-700 break-all">{user.data.id}</p>
          </div>

          <div>
            <p className="text-stone-400">Status</p>
            <Badge variant={user.data.isActive ? 'success' : 'error'}>
              {user.data.isActive ? 'Active' : 'Blocked'}
            </Badge>
          </div>

          <div>
            <p className="text-stone-400">Verified</p>
            <Badge variant={user.data.isVerified ? 'success' : 'warning'}>
              {user.data.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>

          <div>
            <p className="text-stone-400">Roles</p>
            <div className="mt-1 flex gap-1.5 flex-wrap">
              {user.data.roles.map((role) => (
                <Badge key={role} variant={getRoleBadgeVariant(role)}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-stone-400">Joined</p>
            <p className="font-medium text-stone-700">
              {new Date(user.data.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-stone-400">Last Updated</p>
            <p className="font-medium text-stone-700">
              {new Date(user.data.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}