import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

export default function App() {
  const { fetchUser,isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [isAuthenticated,fetchUser])

  return <RouterProvider router={router} />
}