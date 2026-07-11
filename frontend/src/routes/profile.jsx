import { createFileRoute, redirect } from "@tanstack/react-router";
import ProfilePage from "../pages/Profile/ProfilePage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: ProfilePage,
});
