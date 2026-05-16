import { VerifyOtp } from "@/pages/auth/verify-otp";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Landing } from "@/pages/public/Landing";
import { Register } from "@/pages/auth/Register";
import { Login } from "@/pages/auth/Login";
import { AuthBootsrap } from "@/features/auth/AuthBootstrap";
import { PublicOnlyRoute } from "./public-only-route";

const ProtectedApp = () => (
  <AuthBootsrap>
    <ProtectedRoute>
      <StudentLayout />
    </ProtectedRoute>
  </AuthBootsrap>
)

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Landing />
      }
    ]
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    )
  },
  {
    path: '/verify-otp',
    element: (
      <PublicOnlyRoute>
        <VerifyOtp />
      </PublicOnlyRoute>
    )
  }
  ,
  {
    path: '/dashboard',
    element: <ProtectedApp />,
    children: []
  },
  {
    path: '*',
    element: <Navigate to='/register' replace />
  }
])
