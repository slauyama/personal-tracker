import type { CSSProperties } from "react";
import type { HexPair } from "./categoryColors";

interface CategoryBadgeProps {
  label: string;
  color: HexPair;
}

export default function CategoryBadge({ label, color }: CategoryBadgeProps) {
  return (
    <span
      style={{ "--dot-l": color.light, "--dot-d": color.dark } as CSSProperties}
      className="text-xs bg-(--dot-l) dark:bg-(--dot-d) text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full"
    >
      {label}
    </span>
  );
}
