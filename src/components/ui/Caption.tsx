import { Text } from "@slauyama/ui";
import { HTMLAttributes } from "react";

export default function Caption({
  children,
  className,
}: HTMLAttributes<HTMLElement>) {
  return (
    <Text
      as="label"
      className={`shrink-0 text-zinc-400 -mt-1 uppercase ${className}`}
      size="xs"
    >
      {children}
    </Text>
  );
}
