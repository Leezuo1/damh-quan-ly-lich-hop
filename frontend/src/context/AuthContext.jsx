import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { clearAuth, getStoredUser, getToken, saveAuth } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function login({ accessToken, user: nextUser }) {
    saveAuth({ accessToken, user: nextUser });
    setUser(nextUser);
  }

  // Cập nhật user (vd sau khi lưu Profile) mà không phải đăng nhập lại.
  function updateUser(nextUser) {
    saveAuth({ accessToken: getToken(), user: nextUser });
    setUser(nextUser);
  }

  function logout() {
    clearAuth();
    setUser(null);
    queryClient.clear();
    navigate({ to: "/" });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong AuthProvider");
  return ctx;
}
