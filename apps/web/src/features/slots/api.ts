import { apiClient } from '@/lib/axios'

// ─── Shared ────────────────────────────────────────────────────────────────

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'CANCELLED'
export type ExceptionType = 'BLOCK' | 'EXTRA'
export type RuleStatus = 'ACTIVE' | 'INACTIVE'

// ─── Types ─────────────────────────────────────────────────────────────────

export type SlotRule = {
  id: string
  profileId: string
  offeringId: string
  title: string | null
  weekday: number // 0 = Sunday … 6 = Saturday
  startMinute: number // minutes from midnight
  endMinute: number
  timezone: string
  slotDurationMinutes: number
  effectiveFrom: string
  effectiveUntil: string | null
  status: RuleStatus
  offering?: {
    id: string
    title: string | null
    subcategory: { id: string; name: string }
  }
}

export type SlotException = {
  id: string
  profileId: string
  offeringId: string | null
  type: ExceptionType
  title: string | null
  startTime: string
  endTime: string
  timezone: string
  slotDurationMinutes: number | null
  status: string
}

export type Slot = {
  id: string
  profileId: string
  offeringId: string
  ruleId: string | null
  exceptionId: string | null
  title: string | null
  startTime: string
  endTime: string
  timezone: string
  status: SlotStatus
  offering?: {
    id: string
    title: string | null
    subcategory: { id: string; name: string }
  }
}

// ─── Instructor availability (combined query) ───────────────────────────────

export type AvailabilityResponse = {
  rules: SlotRule[]
  exceptions: SlotException[]
  slots: Slot[]
}

export async function getInstructorAvailability(params?: {
  offeringId?: string
  from?: string
  to?: string
}): Promise<AvailabilityResponse> {
  const response = await apiClient.get<{ success: boolean; data: AvailabilityResponse }>(
    '/api/instructor/availability',
    { params },
  )
  return response.data.data
}

// ─── Slot Rules ─────────────────────────────────────────────────────────────

export type CreateSlotRulePayload = {
  offeringId: string
  title?: string
  weekday: number
  startMinute: number
  endMinute: number
  slotDurationMinutes: number
  timezone?: string
  effectiveFrom: string
  effectiveUntil?: string
}

export type UpdateSlotRulePayload = {
  ruleId: string
  title?: string
  startMinute?: number
  endMinute?: number
  slotDurationMinutes?: number
  effectiveUntil?: string
}

export async function createSlotRule(payload: CreateSlotRulePayload): Promise<SlotRule> {
  const response = await apiClient.post<{ success: boolean; data: SlotRule }>(
    '/api/instructor/availability/rules',
    payload,
  )
  return response.data.data
}

export async function updateSlotRule(payload: UpdateSlotRulePayload): Promise<SlotRule> {
  const { ruleId, ...body } = payload
  const response = await apiClient.patch<{ success: boolean; data: SlotRule }>(
    `/api/instructor/availability/rules/${ruleId}`,
    body,
  )
  return response.data.data
}

export async function deleteSlotRule(ruleId: string): Promise<void> {
  await apiClient.delete(`/api/instructor/availability/rules/${ruleId}`)
}

// ─── Slot Exceptions ─────────────────────────────────────────────────────────

export type CreateBlockExceptionPayload = {
  type: 'BLOCK'
  offeringId?: string
  title?: string
  startTime: string
  endTime: string
  timezone?: string
}

export type CreateExtraExceptionPayload = {
  type: 'EXTRA'
  offeringId: string
  title?: string
  startTime: string
  endTime: string
  timezone?: string
  slotDurationMinutes: number
}

export type CreateSlotExceptionPayload =
  | CreateBlockExceptionPayload
  | CreateExtraExceptionPayload

export async function createSlotException(
  payload: CreateSlotExceptionPayload,
): Promise<SlotException> {
  const response = await apiClient.post<{ success: boolean; data: SlotException }>(
    '/api/instructor/availability/exceptions',
    payload,
  )
  return response.data.data
}

// ─── Public availability ─────────────────────────────────────────────────────

export async function getPublicAvailability(params: {
  profileId: string
  offeringId: string
  from: string
  to: string
}): Promise<Slot[]> {
  const response = await apiClient.get<{ success: boolean; data: Slot[] }>(
    `/api/public/instructors/${params.profileId}/availability`,
    {
      params: {
        offeringId: params.offeringId,
        from: params.from,
        to: params.to
      },
    },
  )
  return response.data.data
}