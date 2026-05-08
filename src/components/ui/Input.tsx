import { InputHTMLAttributes } from "react";
import Text from "./Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

const BASE =
  "w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-500";

export default function Input({
  prefix,
  label,
  className = "",
  ...props
}: InputProps) {
  const input = prefix ? (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none dark:text-zinc-500">
        {prefix}
      </span>
      <input
        className={[BASE, "pl-6", className].filter(Boolean).join(" ")}
        {...props}
      />
    </div>
  ) : (
    <input className={[BASE, className].filter(Boolean).join(" ")} {...props} />
  );

  return (
    <div>
      <Text as="label" variant="label" className="block mb-1">
        {label}
      </Text>
      {input}
    </div>
  );
}
