import { HTMLAttributes } from "react";

type HeadingVariant = "display" | "title" | "subtitle";
type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingAs;
  variant?: HeadingVariant;
}

const VARIANTS: Record<HeadingVariant, string> = {
  display: "text-2xl font-bold",
  title: "text-xl font-bold text-gray-800 dark:text-gray-100",
  subtitle: "text-lg font-semibold text-gray-700 dark:text-gray-200",
};

export default function Heading({
  as: Tag = "h2",
  variant = "title",
  className = "",
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={[VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
