import { NavLink, Outlet } from "react-router-dom";

const NAV_LINKS = [
  { to: "/makeup", label: "Makeup" },
  { to: "/dog", label: "Dog" },
  { to: "/car", label: "Car" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
          <nav className="flex gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-slate-500"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
