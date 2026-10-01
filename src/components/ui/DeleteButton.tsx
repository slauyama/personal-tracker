import type { MouseEvent, ReactNode } from "react";
import { Button } from "@slauyama/ui";
import { useBreakpoints } from "@slauyama/hooks";

interface DeleteButtonProps {
  onClick: (e: MouseEvent) => void;
  children?: ReactNode;
}

export default function DeleteButton({
  onClick,
  children = "Delete",
}: DeleteButtonProps) {
  const { isSmall } = useBreakpoints();

  return (
    <Button
      variant={isSmall ? "text" : "filled"}
      icon="delete"
      onClick={onClick}
      className="[--color-primary:var(--color-error)] [--color-on-primary:var(--color-on-error)] mr-auto"
    >
      {children}
    </Button>
  );
}
