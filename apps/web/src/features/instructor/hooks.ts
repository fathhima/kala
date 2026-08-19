import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    cancelInstructorApplication,
    createOffering, getOfferingMediaUrl, getOnboardingWorkspace, removeOffering, removeOfferingMedia, saveInstructorProfile,
    submitInstructorApplication, updateOffering, uploadOfferingMedia,
} from './api'

const workspaceKey = ['instructor-onboarding']

const useInvalidateWorkspace = () => {
    const queryClient = useQueryClient()

    return () => queryClient.invalidateQueries({ queryKey: workspaceKey })
}

export const useOnboardingWorkspaceQuery = () =>
    useQuery({
        queryKey: workspaceKey,
        queryFn: getOnboardingWorkspace,
    })

export const useSaveInstructorProfileMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: saveInstructorProfile,
        onSuccess: invalidate,
    })
}

export const useCreateOfferingMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: createOffering,
        onSuccess: invalidate,
    })
}

export const useUpdateOfferingMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: updateOffering,
        onSuccess: invalidate,
    })
}

export const useRemoveOfferingMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: removeOffering,
        onSuccess: invalidate,
    })
}

export const useUploadOfferingMediaMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: uploadOfferingMedia,
        onSuccess: invalidate,
    })
}

export const useRemoveOfferingMediaMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: removeOfferingMedia,
        onSuccess: invalidate,
    })
}

export const useOfferingMediaUrlQuery = (
    offeringId: string,
    mediaId: string,
) =>
    useQuery({
        queryKey: ['offering-media-url', offeringId, mediaId],
        queryFn: () => getOfferingMediaUrl({ offeringId, mediaId }),
        staleTime: 10 * 60 * 1000,
    })

export const useSubmitInstructorApplicationMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: submitInstructorApplication,
        onSuccess: invalidate,
    })
}

export const useCancelInstructorApplicationMutation = () => {
    const invalidate = useInvalidateWorkspace()

    return useMutation({
        mutationFn: cancelInstructorApplication,
        onSuccess: invalidate,
    })
}