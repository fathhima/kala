import { Configuration, InstructorOnboardingApi, RequestOfferingMediaUploadDtoMimeTypeEnum, RequestOfferingMediaUploadDtoTypeEnum, type CreateOfferingDto, type InstructorOfferingDto, type InstructorProfileDto, type UpdateInstructorProfileDto, type UpdateOfferingDto, } from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const onboardingApi = new InstructorOnboardingApi(configuration, undefined, apiClient,)

export const getOnboardingWorkspace = async (): Promise<InstructorProfileDto | null> => {
    const response = await onboardingApi.instructorControllerGetWorkspace()
    return response.data.data ?? null
}

export const saveInstructorProfile = async (payload: UpdateInstructorProfileDto,): Promise<InstructorProfileDto> => {
    const response = await onboardingApi.instructorControllerSaveProfile(payload)
    return response.data.data!
}

export const createOffering = async (payload: CreateOfferingDto,): Promise<InstructorOfferingDto> => {
    const response = await onboardingApi.instructorControllerAddOffering(payload)
    return response.data.data
}

export const updateOffering = async (params: { offeringId: string, payload: UpdateOfferingDto }): Promise<InstructorOfferingDto> => {
    const response = await onboardingApi.instructorControllerUpdateOffering(
        params.offeringId,
        params.payload,
    )

    return response.data.data
}

export const removeOffering = async (offeringId: string): Promise<void> => {
    await onboardingApi.instructorControllerRemoveOffering(offeringId)
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

    const uploadUrlResponse = await onboardingApi.instructorControllerCreateMediaUploadUrl(offeringId, {
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

    const confirmResponse = await onboardingApi.instructorControllerConfirmMediaUpload(offeringId, {
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
    await onboardingApi.instructorControllerRemoveMedia(
        params.offeringId,
        params.mediaId,
    )
}

export const getOfferingMediaUrl = async (params: {
    offeringId: string
    mediaId: string
}): Promise<string> => {
    const response = await onboardingApi.instructorControllerGetMediaViewUrl(
        params.offeringId,
        params.mediaId,
    )

    return response.data.data.viewUrl
}

export const submitInstructorApplication = async () => {
    const response = await onboardingApi.instructorControllerSubmitApplication()
    return response.data.data
}

export const cancelInstructorApplication = async (applicationId: string,): Promise<void> => {
    await onboardingApi.instructorControllerCancelApplication(applicationId)
}