import { apiFetch } from "../lib/api";

export function listMeetings({ from, to, roomId, organizerId, mine } = {}) {
  return apiFetch("/meetings", { params: { from, to, roomId, organizerId, mine } });
}

export function listMine() {
  return apiFetch("/meetings/mine");
}

export function getMeeting(id) {
  return apiFetch(`/meetings/${id}`);
}

export function createMeeting(dto) {
  return apiFetch("/meetings", { method: "POST", body: dto });
}

export function updateMeeting(id, dto) {
  return apiFetch(`/meetings/${id}`, { method: "PATCH", body: dto });
}

export function cancelMeeting(id) {
  return apiFetch(`/meetings/${id}`, { method: "DELETE" });
}

export function restoreMeeting(id) {
  return apiFetch(`/meetings/${id}/restore`, { method: "PATCH" });
}

export function respondMeeting(id, status) {
  return apiFetch(`/meetings/${id}/respond`, { method: "PATCH", body: { status } });
}
