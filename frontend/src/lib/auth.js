const STORAGE_KEY = "damh_auth";

export function getStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return getStoredAuth()?.accessToken ?? null;
}

export function getStoredUser() {
  return getStoredAuth()?.user ?? null;
}

export function saveAuth({ accessToken, user }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, user }));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
