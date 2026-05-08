import { ReactNode } from "react";

interface LinkProps {
  href: string;
  variant?: "text" | "icon";
  title?: string;
  children: ReactNode;
}

export default function Link({
  href,
  variant = "text",
  title,
  children,
}: LinkProps) {
  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
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
      className="text-sm text-slate-500 underline hover:text-slate-700 transition-colors"
    >
      {children}
    </a>
  );
}
