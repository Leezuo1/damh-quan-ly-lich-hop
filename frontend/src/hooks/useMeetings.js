import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelMeeting,
  createMeeting,
  getMeeting,
  listMeetings,
  listMine,
  restoreMeeting,
  respondMeeting,
  updateMeeting,
} from "../api/meetings.api";

export function useMeetings({ from, to, roomId, organizerId, mine } = {}) {
  return useQuery({
    queryKey: ["meetings", { from, to, roomId, organizerId, mine }],
    queryFn: () => listMeetings({ from, to, roomId, organizerId, mine }),
  });
}

export function useMyMeetings() {
  return useQuery({ queryKey: ["meetings", "mine"], queryFn: listMine });
}

export function useMeeting(id) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => getMeeting(id),
    enabled: !!id,
  });
}

function useInvalidateMeetings() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
}

export function useCreateMeeting() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: createMeeting,
    onSuccess: invalidate,
  });
}

export function useUpdateMeeting() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: ({ id, dto }) => updateMeeting(id, dto),
    onSuccess: invalidate,
  });
}

export function useCancelMeeting() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: cancelMeeting,
    onSuccess: invalidate,
  });
}

export function useRestoreMeeting() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: restoreMeeting,
    onSuccess: invalidate,
  });
}

export function useRespondMeeting() {
  const invalidate = useInvalidateMeetings();
  return useMutation({
    mutationFn: ({ id, status }) => respondMeeting(id, status),
    onSuccess: invalidate,
  });
}
