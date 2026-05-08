import { InputHTMLAttributes } from "react";
import Text from "./Text";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  label?: string;
}

const BASE =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500";

export default function Input({ prefix, label, className = "", ...props }: InputProps) {
  const input = prefix ? (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none dark:text-gray-500">
        {prefix}
      </span>
      <input className={[BASE, "pl-6", className].filter(Boolean).join(" ")} {...props} />
    </div>
  ) : (
    <input className={[BASE, className].filter(Boolean).join(" ")} {...props} />
  );

  if (label) {
    return (
      <div>
        <Text as="label" variant="label" className="block mb-1">
          {label}
        </Text>
        {input}
      </div>
    );
  }

  return input;
}
