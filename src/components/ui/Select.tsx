import { SelectHTMLAttributes } from "react";

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
}

const BASE =
  "bg-white text-sm text-gray-600 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300";

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
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
