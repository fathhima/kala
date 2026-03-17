import { useMutation, useQueryClient } from '@tanstack/react-query';

import { User } from '@/types';
import { userApi, UserService } from '@/services/user.service';

type UpdateUserStatusPayload = {
  id: string;
  status: User['status'];
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateUserStatusPayload) =>
      userApi.userControllerUpdateStatus(id, { status }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
