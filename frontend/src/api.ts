import { ApiResponse, Event, Invitation, LoginResponse, User } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data.data;
};

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  register: (fullName: string, email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password })
    }),
  getEvents: () => request<Event[]>("/events"),
  getMyOrganizedEvents: (token: string) =>
    request<Event[]>("/events/me/organized", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getMyInvitations: (token: string) =>
    request<Invitation[]>("/invitations/me", {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getUsers: () => request<User[]>("/users")
};
