import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { to: "/makeup", label: "Makeup", emoji: "💄" },
  { to: "/dog", label: "Dog", emoji: "🐾" },
  { to: "/car", label: "Car", emoji: "🚗" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        {SECTIONS.map(({ to, label, emoji }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="aspect-square flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-400 transition-all cursor-pointer group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {emoji}
            </span>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
