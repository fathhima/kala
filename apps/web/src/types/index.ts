export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
export type BookingStatus = 'INITIATED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED'
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
export type PaymentProvider = 'STRIPE' | 'RAZORPAY'

export interface User {
  id: string
  name: string
  email: string
  roles: Role[]
  avatarUrl?: string
  createdAt: string
}

export interface Skill {
  id: string
  name: string
  slug: string
  description?: string
}

export interface PortfolioItem {
  id: string
  instructorId: string
  skillId?: string
  type?: 'photo' | 'video'
  imageUrl: string
  videoUrl?: string
  caption?: string
}

export interface InstructorProfile {
  id: string
  userId: string
  user: User
  bio: string
  pricing: number
  skillPricing?: Record<string, number>
  instagramUrl?: string
  location?: string
  isApproved: boolean
  avgRating: number
  isTopRated: boolean
  skills: Skill[]
  portfolioItems: PortfolioItem[]
  createdAt: string
}

export interface Slot {
  id: string
  instructorId: string
  skillId?: string
  title?: string
  startTime: string
  endTime: string
  timezone: string
  status: SlotStatus
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  status: PaymentStatus
  provider?: PaymentProvider
  transactionId?: string
}

export interface Review {
  id: string
  bookingId: string
  studentId: string
  studentName: string
  instructorId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export interface Booking {
  id: string
  studentId: string
  studentName: string
  instructorId: string
  instructor: InstructorProfile
  slotId: string
  slot: Slot
  status: BookingStatus
  payment?: Payment
  review?: Review
  messages: ChatMessage[]
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  totalInstructors: number
  totalBookings: number
  revenue: number
}
