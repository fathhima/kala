import { Navigate, Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAdminStore } from '../../stores/adminStore'

export function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const { users, toggleUserBlocked } = useAdminStore()
  const user = users.find((item) => item.id === id)

  if (!user) {
    return <Navigate to="/admin/users" replace />
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700">
        <ArrowLeft size={15} /> Back to users
      </Link>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatarUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-kala-brown">{user.name}</h1>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
          </div>
          <Button
            variant={user.isActive ? 'destructive' : 'primary'}
            onClick={() => toggleUserBlocked(user.id)}
          >
            {user.isActive ? 'Block User' : 'Unblock User'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-800">User Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-stone-400">User ID</p>
            <p className="font-medium text-stone-700 break-all">{user.id}</p>
          </div>
          <div>
            <p className="text-stone-400">Status</p>
            <Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Blocked'}</Badge>
          </div>
          <div>
            <p className="text-stone-400">Joined</p>
            <p className="font-medium text-stone-700">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-stone-400">Roles</p>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {user.roles.map((role) => (
                <Badge key={role} variant={role === 'ADMIN' ? 'error' : role === 'INSTRUCTOR' ? 'warning' : 'info'}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
