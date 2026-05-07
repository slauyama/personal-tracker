import { useState } from "react";

export type ModalControls = ReturnType<typeof useModal>;

export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
