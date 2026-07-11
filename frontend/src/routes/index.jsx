import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginPage from "../pages/Login/LoginPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (getToken()) throw redirect({ to: "/calendar" });
  },
  component: LoginPage,
});
