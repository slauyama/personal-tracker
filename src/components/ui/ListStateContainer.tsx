import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@slauyama/ui";

type ListStatus = "loading" | "error" | "empty" | "no-match" | "ready";

interface ListStateContainerProps {
  isLoading: boolean;
  hasError?: unknown;
  isEmpty: boolean;
  hasNoMatches: boolean;
  errorContent?: ReactNode;
  emptyContent: ReactNode;
  noMatchContent: ReactNode;
  children: ReactNode;
}

function resolveStatus({
  isLoading,
  hasError,
  isEmpty,
  hasNoMatches,
}: Pick<
  ListStateContainerProps,
  "isLoading" | "hasError" | "isEmpty" | "hasNoMatches"
>): ListStatus {
  if (isLoading) return "loading";
  if (hasError) return "error";
  if (isEmpty) return "empty";
  if (hasNoMatches) return "no-match";
  return "ready";
}

export default function ListStateContainer({
  isLoading,
  hasError,
  isEmpty,
  hasNoMatches,
  errorContent,
  emptyContent,
  noMatchContent,
  children,
}: ListStateContainerProps) {
  const status = resolveStatus({ isLoading, hasError, isEmpty, hasNoMatches });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {status === "loading" && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}
        {status === "error" && (
          <div className="flex justify-center py-20">{errorContent}</div>
        )}
        {status === "empty" && (
          <div className="flex justify-center py-20">{emptyContent}</div>
        )}
        {status === "no-match" && (
          <div className="flex justify-center py-20">{noMatchContent}</div>
        )}
        {status === "ready" && children}
      </motion.div>
    </AnimatePresence>
  );
}
