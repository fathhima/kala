import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createReview,
  getInstructorReviews,
  getInstructorSummary,
  getMyReviews,
  getReviewByBookingId,
  type ReviewListQuery,
} from './api'
import type { CreateReviewDto } from '@/api'

export const reviewKeys = {
  all: ['reviews'] as const,
  booking: (bookingId: string) => ['reviews', 'booking', bookingId] as const,
  instructor: (profileId: string, query?: ReviewListQuery) =>
    ['reviews', 'instructor', profileId, query] as const,
  instructorSummary: (profileId: string) =>
    ['reviews', 'instructor', profileId, 'summary'] as const,
  myReviews: (query?: ReviewListQuery) => ['reviews', 'my-reviews', query] as const,
}

export const useReviewByBookingQuery = (bookingId: string) =>
  useQuery({
    queryKey: reviewKeys.booking(bookingId),
    queryFn: () => getReviewByBookingId(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
  })

export const useInstructorReviewsQuery = (
  profileId: string,
  query?: ReviewListQuery,
) =>
  useQuery({
    queryKey: reviewKeys.instructor(profileId, query),
    queryFn: () => getInstructorReviews(profileId, query),
    enabled: Boolean(profileId),
  })

export const useInstructorSummaryQuery = (profileId: string) =>
  useQuery({
    queryKey: reviewKeys.instructorSummary(profileId),
    queryFn: () => getInstructorSummary(profileId),
    enabled: Boolean(profileId),
  })

export const useMyReviewsQuery = (query?: ReviewListQuery) =>
  useQuery({
    queryKey: reviewKeys.myReviews(query),
    queryFn: () => getMyReviews(query),
  })

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateReviewDto) => createReview(dto),
    onSuccess: async (_data: unknown, variables: CreateReviewDto) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: reviewKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: reviewKeys.booking(variables.bookingId),
        }),
      ])
    },
  })
}
