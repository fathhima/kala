import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSlotException,
  createSlotRule,
  deleteSlotRule,
  getInstructorAvailability,
  getPublicAvailability,
  updateSlotRule,
} from './api'

const instructorAvailabilityKey = ['instructor-availability']

// ─── Instructor ───────────────────────────────────────────────────────────────

export const useInstructorAvailabilityQuery = (params?: {
  offeringId?: string
  from?: string
  to?: string
}) =>
  useQuery({
    queryKey: [...instructorAvailabilityKey, params],
    queryFn: () => getInstructorAvailability(params),
  })

const useInvalidateAvailability = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: instructorAvailabilityKey })
}

export const useCreateSlotRuleMutation = () => {
  const invalidate = useInvalidateAvailability()
  return useMutation({
    mutationFn: createSlotRule,
    onSuccess: invalidate,
  })
}

export const useUpdateSlotRuleMutation = () => {
  const invalidate = useInvalidateAvailability()
  return useMutation({
    mutationFn: updateSlotRule,
    onSuccess: invalidate,
  })
}

export const useDeleteSlotRuleMutation = () => {
  const invalidate = useInvalidateAvailability()
  return useMutation({
    mutationFn: deleteSlotRule,
    onSuccess: invalidate,
  })
}

export const useCreateSlotExceptionMutation = () => {
  const invalidate = useInvalidateAvailability()
  return useMutation({
    mutationFn: createSlotException,
    onSuccess: invalidate,
  })
}

// ─── Public ───────────────────────────────────────────────────────────────────

export const usePublicAvailabilityQuery = (params: {
  profileId: string
  offeringId: string
  date: string
  enabled?: boolean
}) =>
  useQuery({
    queryKey: [
      'public-availability',
      params.profileId,
      params.offeringId,
      params.date,
    ],
    queryFn: () =>
      getPublicAvailability({
        profileId: params.profileId,
        offeringId: params.offeringId,
        date: params.date,
      }),
    enabled: Boolean(
      params.enabled !== false &&
      params.profileId &&
      params.offeringId &&
      params.date,
    ),
  })