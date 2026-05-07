import { ReactNode } from "react";
import { ModalControls } from "../../hooks/useModal";

interface ModalProps {
  children: ReactNode;
  /** Extra classes applied to the white card (e.g. "max-h-[90vh] overflow-y-auto") */
  className?: string;
  /** Whether clicking the dark backdrop closes the modal. Default false. */
  closeOnBackdrop?: boolean;
  modalControls: ModalControls;
}

export default function Modal({
  children,
  className = "",
  closeOnBackdrop = false,
  modalControls,
}: ModalProps) {
  if (!modalControls.isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4"
      onClick={closeOnBackdrop ? modalControls.close : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-md ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
