import { apiFetch } from "../lib/api";

export function listNotifications() {
  return apiFetch("/notifications");
}

export function getUnreadCount() {
  return apiFetch("/notifications/unread-count");
}

export function markRead(id) {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllRead() {
  return apiFetch("/notifications/read-all", { method: "PATCH" });
}
