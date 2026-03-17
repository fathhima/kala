import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAdminStore } from '../../stores/adminStore'
import { useUsers } from '@/hooks/user/use-users.hooks'
import { useUpdateUserStatus } from '@/hooks/user/use-update-user-status'

export function ManageUsers() {
  const mutate = useUpdateUserStatus()
  const { data: users, isLoading, isError } = useUsers()

  function toggleUserBlocked(userId: string) {
    
    const user = users?.find((user) => user.id === userId)
    if (!user) return
    console.log(userId);

    mutate.mutate({ id: userId, status: !user.isActive })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError || !users.length) {
    return <div>Error loading users</div>
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-kala-brown">Manage Users</h1>
        <p className="text-stone-500 text-sm mt-1">{users.length} users shown</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-5 py-3 font-semibold text-stone-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-stone-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                      <span className="font-medium text-stone-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-stone-500">{user.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === 'ADMIN' ? 'error' : role === 'INSTRUCTOR' ? 'warning' : 'info'}
                        >
                          {role}
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
                      {/* <Link to={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm">Details</Button>
                      </Link> */}
                      {user.roles.includes('ADMIN') ? (
                        <Button variant="outline" size="sm" disabled>Cannot block admin</Button>
                      ) : (
                        <Button
                          variant={user.isActive ? 'destructive' : 'primary'}
                          size="sm"
                          onClick={() => toggleUserBlocked(user.id)}
                        >
                          {user.isActive ? 'Block' : 'Unblock'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
