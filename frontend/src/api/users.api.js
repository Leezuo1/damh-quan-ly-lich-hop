import { apiFetch } from "../lib/api";

export function getMe() {
  return apiFetch("/users/me");
}

export function updateMe({ name, position }) {
  return apiFetch("/users/me", { method: "PATCH", body: { name, position } });
}

export function changePassword({ currentPassword, newPassword }) {
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
    // Sai mật khẩu hiện tại trả 401 nhưng đó là lỗi nghiệp vụ, không phải hết phiên.
    skipAuthRedirect: true,
  });
}

export function searchUsers(q) {
  return apiFetch("/users", { params: { q } });
}
