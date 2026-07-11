import { createFileRoute, redirect } from "@tanstack/react-router";
import RoomsPage from "../pages/Rooms/RoomsPage";
import { getToken } from "../lib/auth";

export const Route = createFileRoute("/rooms")({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/" });
  },
  component: RoomsPage,
});
