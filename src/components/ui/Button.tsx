import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "pill" | "inline";
type Color = "default" | "destructive";
type Size = "none" | "xs" | "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  color?: Color;
  size?: Size;
  active?: boolean;
}

const BASE =
  "inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-slate-500 text-white hover:bg-slate-600 rounded-lg shadow-sm",
  secondary:
    "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700",
  ghost:
    "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700",
  pill: "rounded-full border",
  inline: "text-slate-400 underline hover:text-slate-500",
};

const DESTRUCTIVE: Partial<Record<Variant, string>> = {
  primary: "bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm",
  secondary:
    "border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 rounded-lg",
  ghost:
    "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg",
  inline: "text-red-400 underline hover:text-red-600",
};

const SIZES: Record<Size, string> = {
  none: "",
  xs: "px-2 py-1.5 text-xs",
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
};

const PILL_COLOR = {
  active: "bg-slate-500 text-white border-slate-500 shadow-sm",
  inactive:
    "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700",
};

export default function Button({
  variant = "primary",
  color = "default",
  size,
  active,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const effectiveSize: Size =
    size ?? (variant === "inline" ? "none" : "md");

  const variantClass =
    color === "destructive" && DESTRUCTIVE[variant]
      ? DESTRUCTIVE[variant]!
      : VARIANTS[variant];

  const pillColor =
    variant === "pill"
      ? active
        ? PILL_COLOR.active
        : PILL_COLOR.inactive
      : "";

  return (
    <button
      className={[BASE, variantClass, SIZES[effectiveSize], pillColor, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
