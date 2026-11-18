import {
  ReviewsApi,
  Configuration,
  type CreateReviewDto,
  type ReviewDto,
  type PaginatedReviewsDataDto,
  type InstructorReviewSummaryDto,
} from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
})

const reviewsApi = new ReviewsApi(configuration, undefined, apiClient)

export type ReviewListQuery = {
  page?: number
  limit?: number
  rating?: number
}

export const createReview = async (dto: CreateReviewDto): Promise<ReviewDto> => {
  const response = await reviewsApi.reviewControllerCreate(dto)
  return response.data.data
}

export const getReviewByBookingId = async (bookingId: string): Promise<ReviewDto> => {
  const response = await reviewsApi.reviewControllerGetByBookingId(bookingId)
  return response.data.data
}

export const getInstructorReviews = async (
  profileId: string,
  query?: ReviewListQuery,
): Promise<PaginatedReviewsDataDto> => {
  const response = await reviewsApi.reviewControllerGetInstructorReviews(
    profileId,
    query?.page,
    query?.limit,
    query?.rating,
  )
  return response.data.data
}

export const getInstructorSummary = async (
  profileId: string,
): Promise<InstructorReviewSummaryDto> => {
  const response = await reviewsApi.reviewControllerGetInstructorSummary(profileId)
  return response.data.data
}

export const getMyReviews = async (
  query?: ReviewListQuery,
): Promise<PaginatedReviewsDataDto> => {
  const response = await reviewsApi.reviewControllerGetMyReviews(
    query?.page,
    query?.limit,
    query?.rating,
  )
  return response.data.data
}
