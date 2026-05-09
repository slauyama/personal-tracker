import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NAV_LINKS = [
  { to: "/makeup", label: "Makeup" },
  { to: "/dog", label: "Dog" },
  { to: "/car", label: "Car" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <nav className="flex gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName ?? "User"}
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={logout}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
