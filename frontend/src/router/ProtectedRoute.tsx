import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);

  // Prevent access to private routes when user is not authenticated.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
