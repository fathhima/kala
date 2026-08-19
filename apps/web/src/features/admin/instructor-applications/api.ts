import {
    AdminInstructorManagementApi, Configuration, type AdminInstructorControllerFindAllStatusEnum, type ReviewOfferingDto,
} from '@/api'
import { apiClient } from '@/lib/axios'

const configuration = new Configuration({
    basePath: import.meta.env.VITE_API_URL,
})

const adminInstructorApi = new AdminInstructorManagementApi(configuration, undefined, apiClient,)

export type InstructorApplicationQuery = {
    page: number
    limit: number
    status?: AdminInstructorControllerFindAllStatusEnum
    search?: string
}

export const getInstructorApplications = async (query: InstructorApplicationQuery,) => {
    const response = await adminInstructorApi.adminInstructorControllerFindAll(
        query.page,
        query.limit,
        query.status,
        query.search,
    )

    return response.data.data
}

export const getInstructorApplication = async (applicationId: string) => {
    const response = await adminInstructorApi.adminInstructorControllerFindOne(applicationId)

    return response.data.data
}

export const reviewInstructorOffering = async (params: {
    applicationId: string
    offeringId: string
    decision: ReviewOfferingDto['decision']
    reviewNote?: string
}) => {
    const response = await adminInstructorApi.adminInstructorControllerReviewOffering(
        params.applicationId,
        params.offeringId,
        {
            decision: params.decision,
            reviewNote: params.reviewNote?.trim() || undefined,
        },
    )

    return response.data.data
}

export const getAdminOfferingMediaUrl = async (params: {
    applicationId: string
    offeringId: string
    mediaId: string
}): Promise<string> => {
    const response = await adminInstructorApi.adminInstructorControllerGetOfferingMediaViewUrl(
        params.applicationId,
        params.offeringId,
        params.mediaId,
    )

    return response.data.data.viewUrl
}