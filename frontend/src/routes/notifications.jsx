import { createFileRoute, redirect } from "@tanstack/react-router";
import NotificationsPage from "../pages/Notifications/NotificationsPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: NotificationsPage,
});
