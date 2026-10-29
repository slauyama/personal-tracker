import type { CSSProperties } from "react";
import type { HexPair } from "./categoryColors";

interface CategoryBadgeProps {
  label: string;
  color: HexPair | undefined;
}

const FALLBACK_COLOR: HexPair = { light: "#e4e4e7", dark: "#3f3f46" }; // zinc-200 / zinc-700

export default function CategoryBadge({
  label,
  color = FALLBACK_COLOR,
}: CategoryBadgeProps) {
  return (
    <span
      style={{ "--dot-l": color.light, "--dot-d": color.dark } as CSSProperties}
      className="text-xs bg-(--dot-l) dark:bg-(--dot-d) text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full"
    >
      {label}
    </span>
  );
}
