import { ReactNode, useState } from "react";

interface LinkProps {
  href: string;
  variant?: "text" | "icon";
  title?: string;
  children: ReactNode;
}

export default function Link({ href, variant = "text", title, children }: LinkProps) {
  const [blocked, setBlocked] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.stopPropagation();
    e.preventDefault();
    const win = window.open(href, "_blank", "noopener,noreferrer");
    if (!win) setBlocked(true);
  }

  if (blocked) {
    return (
      <span className="text-xs text-red-400 flex items-center gap-1">
        <span aria-hidden>⚠</span> Blocked by browser —{" "}
        <button className="underline hover:text-red-600" onClick={() => setBlocked(false)}>
          retry
        </button>
      </span>
    );
  }

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        onClick={handleClick}
        className="opacity-80 hover:opacity-100 transition-opacity"
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      onClick={handleClick}
      className="text-sm text-rose-500 underline hover:text-rose-700 transition-colors"
    >
      {children}
    </a>
  );
}
