import { createFileRoute, redirect } from "@tanstack/react-router";
import MyMeetingsPage from "../pages/MyMeetings/MyMeetingsPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/my-meetings")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: MyMeetingsPage,
});
