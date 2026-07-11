import { clearAuth, getToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Yêu cầu thất bại (${status})`);
    this.status = status;
    this.body = body;
  }
}

// Gọi API backend, tự gắn token, tự parse JSON, ném ApiError khi lỗi.
// skipAuthRedirect: dùng cho endpoint mà 401 mang nghĩa nghiệp vụ (vd sai mật khẩu
// hiện tại ở đổi mật khẩu), không phải hết phiên đăng nhập — không nên tự đăng xuất.
export async function apiFetch(
  path,
  { method = "GET", body, params, skipAuthRedirect = false } = {},
) {
  const token = getToken();
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    // Token hết hạn/không hợp lệ khi đang gọi API cần đăng nhập: đá về trang login.
    if (res.status === 401 && token && !skipAuthRedirect) {
      clearAuth();
      window.location.assign("/");
    }
    throw new ApiError(res.status, data);
  }

  return data;
}
