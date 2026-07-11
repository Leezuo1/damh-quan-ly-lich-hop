import { createFileRoute, redirect } from "@tanstack/react-router";
import CalendarPage from "../pages/Calendar/CalendarPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/calendar")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: CalendarPage,
});
