import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createSlots,
    getInstructorSlots,
    getPublicAvailability,
    removeSlot,
    updateSlot,
} from './api';

const instructorSlotsKey = ['instructor-slots'];

export const useInstructorSlotsQuery = () =>
    useQuery({
        queryKey: instructorSlotsKey,
        queryFn: getInstructorSlots,
    });

export const useCreateSlotsMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSlots,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: instructorSlotsKey }),
    });
};

export const useUpdateSlotMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSlot,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: instructorSlotsKey }),
    });
};

export const useRemoveSlotMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeSlot,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: instructorSlotsKey }),
    });
};

export const usePublicAvailabilityQuery = (params: {
    profileId: string;
    offeringId: string;
    date: string;
    enabled?: boolean;
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
    });