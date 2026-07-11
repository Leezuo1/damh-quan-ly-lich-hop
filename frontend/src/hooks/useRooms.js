import { useQuery } from "@tanstack/react-query";
import { listRooms } from "../api/rooms.api";

export function useRooms({ startTime, endTime } = {}) {
  return useQuery({
    queryKey: ["rooms", startTime ?? null, endTime ?? null],
    queryFn: () => listRooms({ startTime, endTime }),
  });
}
