import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token from persisted auth store for every request.
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem("event-planner-auth");

  if (raw) {
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    const token = parsed?.state?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const unwrap = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Request failed");
  }

  return response.data.data;
};

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};
