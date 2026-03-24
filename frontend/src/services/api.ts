import {
  CreateEventPayload,
  Event,
  EventInvitation,
  Invitation,
  LoginResponse,
  UpdateEventPayload,
  UpdateRsvpResponse,
  User
} from "../types";
import { http, unwrap } from "./http";

export const api = {
  register: (fullName: string, email: string, password: string) =>
    http.post("/auth/register", { fullName, email, password }).then(unwrap<User>),

  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }).then(unwrap<LoginResponse>),

  getEvents: () => http.get("/events").then(unwrap<Event[]>),

  getEventById: (eventId: number) => http.get(`/events/${eventId}`).then(unwrap<Event>),

  createEvent: (payload: CreateEventPayload) => http.post("/events", payload).then(unwrap<Event>),

  updateEvent: (eventId: number, payload: UpdateEventPayload) =>
    http.patch(`/events/${eventId}`, payload).then(unwrap<Event>),

  deleteEvent: (eventId: number) => http.delete(`/events/${eventId}`).then(unwrap<null>),

  getMyOrganizedEvents: () => http.get("/events/me/organized").then(unwrap<Event[]>),

  getMyInvitations: () => http.get("/invitations/me").then(unwrap<Invitation[]>),

  getEventInvitations: (eventId: number) =>
    http.get(`/events/${eventId}/invitations`).then(unwrap<EventInvitation[]>),

  getUsers: () => http.get("/users").then(unwrap<User[]>),

  inviteUser: (eventId: number, userId: number) =>
    http.post(`/events/${eventId}/invitations`, { userId }).then(unwrap<Invitation>),

  updateRsvp: (invitationId: number, status: Invitation["rsvp_status"]) =>
    http.patch(`/invitations/${invitationId}/rsvp`, { status }).then(unwrap<UpdateRsvpResponse>)
};
