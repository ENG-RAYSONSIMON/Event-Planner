import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "../types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// Centralized auth state with persistence for page refreshes.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null })
    }),
    {
      name: "event-planner-auth"
    }
  )
);
