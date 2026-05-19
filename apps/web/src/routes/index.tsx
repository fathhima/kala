import { VerifyOtp } from "@/pages/auth/verify-otp";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Landing } from "@/pages/public/Landing";
import { Register } from "@/pages/auth/Register";
import { Login } from "@/pages/auth/Login";
import { PublicOnlyRoute } from "./public-only-route";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import { AuthBootsrap } from "@/features/auth/AuthBootstrap";
import { AdminRoute } from "./admin-route";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminPublicOnlyRoute } from "./admin-public-only-route";
import { AdminLogin } from "@/pages/auth/AdminLogin";
import { ManageUsers } from "@/pages/admin/ManageUsers";
import { AdminDashboard } from "@/pages/admin/Dashboard";

const ProtectedApp = () => (
  <AuthBootsrap>
    <ProtectedRoute>
      <StudentLayout />
    </ProtectedRoute>
  </AuthBootsrap>
);

const ProtectedAdminApp = () => (
  <AuthBootsrap>
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  </AuthBootsrap>
);

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
    path: '/admin/login',
    element: (
      <AuthBootsrap>
        <AdminPublicOnlyRoute>
          <AdminLogin />
        </AdminPublicOnlyRoute>
      </AuthBootsrap>
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
  },
  {
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPassword />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedApp />
    ),
    children: []
  },
  {
    path: '/admin',
    element: <ProtectedAdminApp />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <ManageUsers />,
      },
    ]
  },
  {
    path: '*',
    element: <Navigate to='/register' replace />
  }
])