import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminOfferingMediaUrl, getInstructorApplication, getInstructorApplications, reviewInstructorOffering, type InstructorApplicationQuery, } from './api'

export const useInstructorApplicationsQuery = (query: InstructorApplicationQuery,) =>
    useQuery({
        queryKey: ['admin-instructor-applications', query],
        queryFn: () => getInstructorApplications(query),
        placeholderData: (previousData) => previousData,
    })

export const useInstructorApplicationQuery = (applicationId: string) =>
    useQuery({
        queryKey: ['admin-instructor-application', applicationId],
        queryFn: () => getInstructorApplication(applicationId),
        enabled: Boolean(applicationId),
    })

export const useReviewInstructorOfferingMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: reviewInstructorOffering,
        onSuccess: async (_data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['admin-instructor-applications'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [
                        'admin-instructor-application',
                        variables.applicationId,
                    ],
                }),
            ])
        },
    })
}

export const useAdminOfferingMediaUrlQuery = (
    applicationId: string,
    offeringId: string,
    mediaId: string,
    enabled = true,
) =>
    useQuery({
        queryKey: [
            'admin-instructor-offering-media-url',
            applicationId,
            offeringId,
            mediaId,
        ],
        queryFn: () => getAdminOfferingMediaUrl({
            applicationId,
            offeringId,
            mediaId,
        }),
        enabled: Boolean(applicationId && offeringId && mediaId && enabled),
        staleTime: 10 * 60 * 1000,
    })