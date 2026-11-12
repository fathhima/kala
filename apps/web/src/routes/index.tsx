import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { InstructorLayout } from '@/components/layout/InstructorLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { AccountSettings } from '@/pages/account/AccountSettings';
import { ApplicationDetails } from '@/pages/admin/ApplicationDetails';
import { AdminBookingDetails } from '@/pages/admin/BookingDetails';
import { BookingMonitoring } from '@/pages/admin/BookingMonitoring';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { InstructorApplications } from '@/pages/admin/InstructorApplications';
import { ManageSkills } from '@/pages/admin/ManageSkills';
import { ManageUsers } from '@/pages/admin/ManageUsers';
import { AdminPaymentDetails } from '@/pages/admin/PaymentDetails';
import { PaymentsOverview } from '@/pages/admin/PaymentsOverview';
import { UserDetails } from '@/pages/admin/UserDetails';
import { AdminLogin } from '@/pages/auth/AdminLogin';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { VerifyOtp } from '@/pages/auth/verify-otp';
import { InstructorDashboard } from '@/pages/instructor/Dashboard';
import { ManageSlots } from '@/pages/instructor/ManageSlots';
import { InstructorMessages } from '@/pages/instructor/Messages';
import { MySessions } from '@/pages/instructor/MySessions';
import { InstructorOfferings } from '@/pages/instructor/Offerings';
import { InstructorPayments } from '@/pages/instructor/Payments';
import { Portfolio } from '@/pages/instructor/Portfolio';
import { InstructorSessionChat } from '@/pages/instructor/SessionChat';
import { InstructorSessionDetails } from '@/pages/instructor/SessionDetails';
import { InstructorSkills } from '@/pages/instructor/Skills';
import { About } from '@/pages/public/About';
import { BrowseInstructors } from '@/pages/public/BrowseInstructors';
import { BrowseSkills } from '@/pages/public/BrowseSkills';
import { Contact } from '@/pages/public/Contact';
import { InstructorProfile } from '@/pages/public/InstructorProfile';
import { Landing } from '@/pages/public/Landing';
import { VideoCallPage } from '@/pages/session/VideoCallPage';
import { BecomeInstructor } from '@/pages/student/BecomeInstructor';
import { BookingChat } from '@/pages/student/BookingChat';
import { BookingDetails } from '@/pages/student/BookingDetails';
import { StudentDashboard } from '@/pages/student/Dashboard';
import { StudentMessages } from '@/pages/student/Messages';
import { MyBookings } from '@/pages/student/MyBookings';
import { Payment } from '@/pages/student/Payment';
import { ProtectedRoute } from './protected-route';
import { PublicOnlyRoute } from './public-only-route';

const StudentApp = () => (
  <ProtectedRoute>
    <StudentLayout />
  </ProtectedRoute>
);

const InstructorApp = () => (
  <ProtectedRoute requireRole="INSTRUCTOR">
    <InstructorLayout />
  </ProtectedRoute>
);

const AdminApp = () => (
  <ProtectedRoute requireRole="ADMIN" loginPath="/admin/login">
    <AdminLayout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/skills',
        element: <BrowseSkills />,
      },
      {
        path: '/instructors',
        element: <BrowseInstructors />,
      },
      {
        path: '/instructors/:profileId',
        element: <InstructorProfile />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/verify-otp',
    element: (
      <PublicOnlyRoute>
        <VerifyOtp />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPassword />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/admin/login',
    element: (
      <PublicOnlyRoute redirectTo="/admin">
        <AdminLogin />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/dashboard',
    element: <StudentApp />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'bookings', element: <MyBookings /> },
      { path: 'bookings/:id', element: <BookingDetails /> },
      { path: 'bookings/:id/chat', element: <BookingChat /> },
      { path: 'messages', element: <StudentMessages /> },
      // { path: 'payments', element: <PaymentHistory /> },
      { path: 'become-instructor', element: <BecomeInstructor /> },
      { path: 'settings', element: <AccountSettings /> },
    ],
  },
  {
    path: '/checkout/:bookingId',
    element: (
      <ProtectedRoute>
        <Payment />
      </ProtectedRoute>
    ),
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
    path: '/dashboard/payment/:bookingId',
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
        <VideoCallPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/instructor',
    element: <InstructorApp />,
    children: [
      { index: true, element: <InstructorDashboard /> },
      { path: 'skills', element: <InstructorSkills /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'offerings', element: <InstructorOfferings /> },
      { path: 'slots', element: <ManageSlots /> },
      { path: 'sessions', element: <MySessions /> },
      { path: 'sessions/:id', element: <InstructorSessionDetails /> },
      { path: 'sessions/:id/chat', element: <InstructorSessionChat /> },
      { path: 'messages', element: <InstructorMessages /> },
      { path: 'payments', element: <InstructorPayments /> },
      // { path: 'reviews', element: <Reviews /> },
      { path: 'settings', element: <AccountSettings /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminApp />,
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
  {
    path: '*',
    element: <Navigate to="/register" replace />,
  },
]);
