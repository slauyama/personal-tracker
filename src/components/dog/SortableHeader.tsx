interface SortableHeaderProps<F extends string> {
  label: string;
  field: F;
  sortField: F;
  sortDir: "asc" | "desc";
  align?: "left" | "right";
  onClick: (field: F) => void;
}

export default function SortableHeader<F extends string>({
  label,
  field,
  sortField,
  sortDir,
  align = "left",
  onClick,
}: SortableHeaderProps<F>) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onClick(field)}
      className={`px-2 py-3 font-medium text-zinc-400 cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-200 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
      {active && (
        <span className="inline-block ml-1">
          {sortDir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );
}
