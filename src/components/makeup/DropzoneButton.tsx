import { ButtonHTMLAttributes, ReactNode } from "react";

interface DropzoneButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const BASE =
  "w-full border-2 border-dashed border-zinc-200 dark:border-zinc-600 rounded-lg px-4 py-6 text-sm text-zinc-400 hover:border-slate-300 hover:text-slate-400 transition-colors text-center";

export default function DropzoneButton({
  className = "",
  children,
  ...props
}: DropzoneButtonProps) {
  return (
    <button className={[BASE, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </button>
  );
}
