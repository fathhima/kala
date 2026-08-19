import { apiClient } from '@/lib/axios'

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'CANCELLED'

export type Slot = {
    id: string
    offeringId: string
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

export type CreateSlotsPayload = {
    offeringId: string
    timezone?: string
    slots: Array<{
        startTime: string
        endTime: string
        title?: string
    }>
}

export type UpdateSlotPayload = {
    slotId: string
    startTime?: string
    endTime?: string
    title?: string
}

export async function getInstructorSlots(): Promise<Slot[]> {
    const response = await apiClient.get<Slot[]>('/api/instructor/slots')
    return response.data
}

export async function createSlots(
    payload: CreateSlotsPayload,
): Promise<Slot[]> {
    const response = await apiClient.post<Slot[]>(
        '/api/instructor/slots/bulk',
        payload,
    )
    return response.data
}

export async function updateSlot(
    payload: UpdateSlotPayload,
): Promise<Slot> {
    const { slotId, ...body } = payload

    const response = await apiClient.patch<Slot>(
        `/api/instructor/slots/${slotId}`,
        body,
    )

    return response.data
}

export async function removeSlot(slotId: string): Promise<void> {
    await apiClient.delete(`/api/instructor/slots/${slotId}`)
}

export async function getPublicAvailability(params: {
    profileId: string
    offeringId: string
    date: string
}): Promise<Slot[]> {
    const response = await apiClient.get<Slot[]>(
        `/api/public/instructors/${params.profileId}/availability`,
        {
            params: {
                offeringId: params.offeringId,
                date: params.date,
            },
        },
    )

    return response.data
}