import { createFileRoute, redirect } from "@tanstack/react-router";
import InvitationsPage from "../pages/Invitations/InvitationsPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/invitations")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  validateSearch: (search) => ({
    meetingId: typeof search.meetingId === "string" ? search.meetingId : undefined,
  }),
  component: InvitationsPage,
});
