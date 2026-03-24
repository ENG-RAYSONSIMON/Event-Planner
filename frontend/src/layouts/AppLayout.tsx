import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiCalendar, FiLogOut, FiUser } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

export const AppLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-brand-700">
            <FiCalendar />
            Event Planner
          </Link>

          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-3 py-1 ${isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/events/my"
              className={({ isActive }) =>
                `rounded-full px-3 py-1 ${isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`
              }
            >
              My events
            </NavLink>
            <span className="flex items-center gap-1 text-slate-600">
              <FiUser />
              {user?.fullName ?? user?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-slate-700"
            >
              <FiLogOut /> Logout
            </button>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
};
