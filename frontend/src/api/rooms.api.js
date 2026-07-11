import { apiFetch } from "../lib/api";

export function listRooms({ startTime, endTime } = {}) {
  return apiFetch("/rooms", { params: { startTime, endTime } });
}

export function createRoom(dto) {
  return apiFetch("/rooms", { method: "POST", body: dto });
}
