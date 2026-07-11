import { createFileRoute, redirect } from "@tanstack/react-router";
import ChangePasswordPage from "../pages/ChangePassword/ChangePasswordPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/change-password")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: ChangePasswordPage,
});
