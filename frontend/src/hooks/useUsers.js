import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, getMe, searchUsers, updateMe } from "../api/users.api";

export function useCurrentUser() {
  return useQuery({ queryKey: ["users", "me"], queryFn: getMe });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      queryClient.setQueryData(["users", "me"], user);
    },
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}

export function useUserSearch(q) {
  return useQuery({
    queryKey: ["users", "search", q],
    queryFn: () => searchUsers(q),
    enabled: q !== undefined,
  });
}
