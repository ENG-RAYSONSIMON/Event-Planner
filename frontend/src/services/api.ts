import { http, unwrap } from "./http";
import { CreateEventPayload, Event, Invitation, LoginResponse, User } from "../types";

export const api = {
  register: (fullName: string, email: string, password: string) =>
    http.post("/auth/register", { fullName, email, password }).then(unwrap<User>),

  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }).then(unwrap<LoginResponse>),

  getEvents: () => http.get("/events").then(unwrap<Event[]>),

  createEvent: (payload: CreateEventPayload) =>
    http.post("/events", payload).then(unwrap<Event>),

  getMyOrganizedEvents: () => http.get("/events/me/organized").then(unwrap<Event[]>),

  getMyInvitations: () => http.get("/invitations/me").then(unwrap<Invitation[]>),

  getUsers: () => http.get("/users").then(unwrap<User[]>),

  inviteUser: (eventId: number, userId: number) =>
    http.post(`/events/${eventId}/invitations`, { userId }).then(unwrap<Invitation>),

  updateRsvp: (invitationId: number, status: Invitation["rsvp_status"]) =>
    http.patch(`/invitations/${invitationId}/rsvp`, { status }).then(unwrap<Invitation>)
};
