import { VerifyOtp } from "@/pages/auth/verify-otp";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Landing } from "@/pages/public/Landing";
import { Register } from "@/pages/auth/Register";
import { Login } from "@/pages/auth/Login";

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
    path: '/register',
    element: <Register />
  },
  {
    path: '/verify-otp',
    element: <VerifyOtp />
  },
  {
    path: '/login',
    element: <Login />
  },
  // {
  //   path: '/dashboard',
  //   element: (
  //     <ProtectedRoute>
  //       <StudentLayout />
  //     </ProtectedRoute>
  //   ),
  //   children: []
  // },
  {
    path: '*',
    element: <Navigate to='/register' replace />
  }
])