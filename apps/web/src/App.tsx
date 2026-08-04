import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AuthBootsrap } from './features/auth/AuthBootstrap'

export default function App() {
  return (
    <AuthBootsrap>
      <RouterProvider router={router} />
    </AuthBootsrap>
  )
}  
