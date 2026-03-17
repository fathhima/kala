import { createBrowserRouter, Navigate } from 'react-router-dom'

import { PublicLayout } from '../components/layout/PublicLayout'
import { StudentLayout } from '../components/layout/StudentLayout'
import { InstructorLayout } from '../components/layout/InstructorLayout'
import { AdminLayout } from '../components/layout/AdminLayout'
import { ProtectedRoute } from '../components/shared/ProtectedRoute'

import { Landing } from '../pages/public/Landing'
import { BrowseSkills } from '../pages/public/BrowseSkills'
import { BrowseInstructors } from '../pages/public/BrowseInstructors'
import { InstructorProfile } from '../pages/public/InstructorProfile'

import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { ForgotPassword } from '../pages/auth/ForgotPassword'
import { VerifyOtp } from '../pages/auth/VerifyOtp'
import { ResetPassword } from '../pages/auth/ResetPassword'

import { StudentDashboard } from '../pages/student/Dashboard'
import { MyBookings } from '../pages/student/MyBookings'
import { BookingDetails } from '../pages/student/BookingDetails'
import { StudentProfileSettings } from '../pages/student/ProfileSettings'
import { ChangePassword } from '../pages/student/ChangePassword'
import { BecomeInstructor } from '../pages/student/BecomeInstructor'
import { Payment } from '../pages/student/Payment'
import { PaymentHistory } from '../pages/student/PaymentHistory'
import { BookingChat } from '../pages/student/BookingChat'
import { VideoCall } from '../pages/student/VideoCall'

import { InstructorDashboard } from '../pages/instructor/Dashboard'
import { ManageSlots } from '../pages/instructor/ManageSlots'
import { MySessions } from '../pages/instructor/MySessions'
import { InstructorSessionDetails } from '../pages/instructor/SessionDetails'
import { InstructorSessionChat } from '../pages/instructor/SessionChat'
import { Portfolio } from '../pages/instructor/Portfolio'
import { InstructorSkills } from '../pages/instructor/Skills'
import { Reviews } from '../pages/instructor/Reviews'
import { InstructorProfileSettings } from '../pages/instructor/ProfileSettings'
import { InstructorPayments } from '../pages/instructor/Payments'

import { AdminDashboard } from '../pages/admin/Dashboard'
import { InstructorApplications } from '../pages/admin/InstructorApplications'
import { ApplicationDetails } from '../pages/admin/ApplicationDetails'
import { ManageSkills } from '../pages/admin/ManageSkills'
import { ManageUsers } from '../pages/admin/ManageUsers'
import { UserDetails } from '../pages/admin/UserDetails'
import { BookingMonitoring } from '../pages/admin/BookingMonitoring'
import { AdminBookingDetails } from '../pages/admin/BookingDetails'
import { PaymentsOverview } from '../pages/admin/PaymentsOverview'
import { AdminPaymentDetails } from '../pages/admin/PaymentDetails'
import { AdminLogin } from '@/pages/auth/AdminLogin'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/skills', element: <BrowseSkills /> },
      { path: '/instructors', element: <BrowseInstructors /> },
      { path: '/instructors/:id', element: <InstructorProfile /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/verify-otp', element: <VerifyOtp /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'bookings', element: <MyBookings /> },
      { path: 'bookings/:id', element: <BookingDetails /> },
      { path: 'bookings/:id/chat', element: <BookingChat /> },
      { path: 'payments', element: <PaymentHistory /> },
      { path: 'settings', element: <StudentProfileSettings /> },
      { path: 'change-password', element: <ChangePassword /> },
      { path: 'become-instructor', element: <BecomeInstructor /> },
    ],
  },
  {
    path: '/dashboard/payment',
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
  },
  {
    path: '/session/:id',
    element: (
      <ProtectedRoute>
        <VideoCall />
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor',
    element: (
      <ProtectedRoute requireRole="INSTRUCTOR">
        <InstructorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <InstructorDashboard /> },
      { path: 'slots', element: <ManageSlots /> },
      { path: 'sessions', element: <MySessions /> },
      { path: 'sessions/:id', element: <InstructorSessionDetails /> },
      { path: 'sessions/:id/chat', element: <InstructorSessionChat /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'skills', element: <InstructorSkills /> },
      { path: 'reviews', element: <Reviews /> },
      { path: 'payments', element: <InstructorPayments /> },
      { path: 'settings', element: <InstructorProfileSettings /> },
    ],
  },
  { path: 'admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'applications', element: <InstructorApplications /> },
      { path: 'applications/:id', element: <ApplicationDetails /> },
      { path: 'skills', element: <ManageSkills /> },
      { path: 'users', element: <ManageUsers /> },
      { path: 'users/:id', element: <UserDetails /> },
      { path: 'bookings', element: <BookingMonitoring /> },
      { path: 'bookings/:id', element: <AdminBookingDetails /> },
      { path: 'payments', element: <PaymentsOverview /> },
      { path: 'payments/:id', element: <AdminPaymentDetails /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
