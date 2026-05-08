import { ModalControls } from "../../hooks/useModal";
import Button from "./Button";
import Heading from "./Heading";
import Modal from "./Modal";
import Text from "./Text";

interface ConfirmModalProps {
  modalControls: ModalControls;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export default function ConfirmModal({
  modalControls,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal modalControls={modalControls} closeOnBackdrop>
      <div className="p-6 flex flex-col gap-4">
        <Heading as="h2" variant="title">
          {title}
        </Heading>
        <Text variant="body">{message}</Text>
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={modalControls.close}
            className="flex-1"
          >
            Cancel
          </Button>
          <button
            onClick={() => {
              onConfirm();
              modalControls.close();
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
