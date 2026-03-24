import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { EditEventPage } from "./pages/EditEventPage";
import { LoginPage } from "./pages/LoginPage";
import { MyEventsPage } from "./pages/MyEventsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedRoute } from "./router/ProtectedRoute";

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/events/my" element={<MyEventsPage />} />
        <Route path="/events/:eventId/edit" element={<EditEventPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
