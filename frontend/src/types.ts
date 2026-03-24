export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  status: "draft" | "published" | "cancelled";
  organizer_id: number;
}

export interface Invitation {
  id: number;
  event_id: number;
  user_id: number;
  invited_by: number;
  rsvp_status: "pending" | "accepted" | "declined" | "maybe";
  event_title: string;
}

export interface EventInvitation {
  id: number;
  event_id: number;
  user_id: number;
  invited_by: number;
  rsvp_status: "pending" | "accepted" | "declined" | "maybe";
  invited_user_name: string;
  invited_user_email: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  status?: "draft" | "published" | "cancelled";
}
