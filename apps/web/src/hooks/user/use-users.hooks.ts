import { userApi } from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: ()=>userApi.userControllerFindAll(),
    select: (data) => data.data,
  });
};