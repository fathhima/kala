import { Configuration, InstructorApi, RequestOfferingMediaUploadDtoMimeTypeEnum, RequestOfferingMediaUploadDtoTypeEnum, type CreateOfferingDto, type InstructorOfferingDto, type InstructorProfileDto, type PublicInstructorDto, type UpdateInstructorProfileDto, type UpdateOfferingDto, } from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const instructorApi = new InstructorApi(configuration, undefined, apiClient,)

export type PublicInstructor = {
    id: string
    name: string
    imageUrl: string | null
    bio: string | null
    location: string | null
    offerings: Array<{
        id: string
        title: string | null
        description: string | null
        hourlyRate: string
        currency: string
        experienceYears: number | null
        subcategory: {
            id: string
            name: string
            slug: string
            category: {
                id: string
                name: string
                slug: string
            }
        }
        media: Array<{
            id: string
            type: 'IMAGE' | 'VIDEO'
            viewUrl: string
        }>
    }>
}

type PublicInstructorPage = {
    items: PublicInstructor[]
    meta: {
        page: number
        limit: number
        total: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}

const text = (value: unknown): string | null =>
    typeof value === 'string' ? value : null

const numberOrNull = (value: unknown): number | null =>
    typeof value === 'number' ? value : null

const mapPublicInstructor = (instructor: PublicInstructorDto,): PublicInstructor => ({
    id: instructor.id,
    name: instructor.name,
    imageUrl: text(instructor.imageUrl),
    bio: text(instructor.bio),
    location: text(instructor.location),
    offerings: instructor.offerings.map((offering) => ({
        id: offering.id,
        title: text(offering.title),
        description: text(offering.description),
        hourlyRate: offering.hourlyRate,
        currency: offering.currency,
        experienceYears: numberOrNull(offering.experienceYears),
        subcategory: offering.subcategory,
        media: offering.media.map((media) => ({
            id: media.id,
            type: media.type,
            viewUrl: media.viewUrl,
        })),
    })),
})

export const getPublicInstructors = async (params: {
    page: number
    limit: number
    search?: string
    subcategoryId?: string
}): Promise<PublicInstructorPage> => {
    const response = await instructorApi.instructorControllerGetInstructors(
        params.page,
        params.limit,
        params.search,
        params.subcategoryId,
    )

    return {
        items: response.data.data.items.map(mapPublicInstructor),
        meta: response.data.data.meta,
    }
}

export const getPublicInstructor = async (profileId: string,): Promise<PublicInstructor> => {
    const response = await instructorApi.instructorControllerGetInstructor(profileId)
    return mapPublicInstructor(response.data.data)
}

export const getOnboardingWorkspace = async (): Promise<InstructorProfileDto | null> => {
    const response = await instructorApi.instructorControllerGetWorkspace()
    return response.data.data ?? null
}

export const saveInstructorProfile = async (payload: UpdateInstructorProfileDto,): Promise<InstructorProfileDto> => {
    const response = await instructorApi.instructorControllerSaveProfile(payload)
    return response.data.data!
}

export const createOffering = async (payload: CreateOfferingDto,): Promise<InstructorOfferingDto> => {
    const response = await instructorApi.instructorControllerAddOffering(payload)
    return response.data.data
}

export const updateOffering = async (params: { offeringId: string, payload: UpdateOfferingDto }): Promise<InstructorOfferingDto> => {
    const response = await instructorApi.instructorControllerUpdateOffering(
        params.offeringId,
        params.payload,
    )

    return response.data.data
}

export const removeOffering = async (offeringId: string): Promise<void> => {
    await instructorApi.instructorControllerRemoveOffering(offeringId)
}

export const uploadOfferingMedia = async (params: {
    offeringId: string
    file: File
    sortOrder: number
}) => {
    const { offeringId, file, sortOrder } = params
    const isImage = file.type.startsWith('image/')

    const type = isImage ? RequestOfferingMediaUploadDtoTypeEnum.Image : RequestOfferingMediaUploadDtoTypeEnum.Video

    const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024

    if (file.size > maxSize) {
        throw new Error(isImage ? 'Images must be 5 MB or smaller.' : 'Videos must be 100 MB or smaller.',)
    }

    const uploadUrlResponse = await instructorApi.instructorControllerCreateMediaUploadUrl(offeringId, {
        type,
        mimeType: file.type as RequestOfferingMediaUploadDtoMimeTypeEnum,
        sizeBytes: file.size,
        sortOrder,
    })

    const upload = uploadUrlResponse.data.data

    const uploadResponse = await fetch(upload.uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    })

    if (!uploadResponse.ok) {
        throw new Error('Media upload failed.')
    }

    const confirmResponse = await instructorApi.instructorControllerConfirmMediaUpload(offeringId, {
        type,
        storageKey: upload.storageKey,
        sortOrder,
    })

    return confirmResponse.data.data
}

export const removeOfferingMedia = async (params: {
    offeringId: string
    mediaId: string
}): Promise<void> => {
    await instructorApi.instructorControllerRemoveMedia(
        params.offeringId,
        params.mediaId,
    )
}

export const getOfferingMediaUrl = async (params: {
    offeringId: string
    mediaId: string
}): Promise<string> => {
    const response = await instructorApi.instructorControllerGetMediaViewUrl(
        params.offeringId,
        params.mediaId,
    )

    return response.data.data.viewUrl
}

export const submitInstructorApplication = async () => {
    const response = await instructorApi.instructorControllerSubmitApplication()
    return response.data.data
}

export const cancelInstructorApplication = async (applicationId: string,): Promise<void> => {
    await instructorApi.instructorControllerCancelApplication(applicationId)
}