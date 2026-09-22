import { Text } from "@slauyama/ui";
import { HTMLAttributes } from "react";

export default function Caption({
  children,
  className,
}: HTMLAttributes<HTMLElement>) {
  return (
    <Text
      as="p"
      variant="body-small"
      className={`shrink-0 -mt-1 uppercase ${className}`}
    >
      {children}
    </Text>
  );
}
