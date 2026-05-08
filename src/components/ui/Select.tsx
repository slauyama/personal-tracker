import { SelectHTMLAttributes } from "react";
import Text from "./Text";

type SelectOption = string | { value: string; label: string };
type Variant = "default" | "pill";

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value"
> {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: Variant;
  label?: string;
}

const BASE =
  "bg-white text-sm text-zinc-600 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

const VARIANTS: Record<Variant, string> = {
  default: "rounded-lg px-3 py-2",
  pill: "rounded-full px-3 py-1",
};

/**
 * Variants:     default | pill
 * options:      string[] | { value: string; label: string }[]
 * placeholder:  shown as the first selectable-blank option (optional)
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder,
  variant = "default",
  label,
  className = "",
  ...props
}: SelectProps) {
  const select = (
    <select
      value={value}
      onChange={onChange}
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const optLabel = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={val} value={val}>
            {optLabel}
          </option>
        );
      })}
    </select>
  );

  if (label) {
    return (
      <div>
        <Text as="label" variant="label" className="block mb-1">
          {label}
        </Text>
        {select}
      </div>
    );
  }

  return select;
}
