import { Button, Modal, Text, type ModalControls } from "@slauyama/ui";

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
    <Modal modalControls={modalControls} title={title} closeOnBackdrop>
      <div className="p-6 flex flex-col gap-4">
        <Text>{message}</Text>
        <div className="flex gap-3 pt-1">
          <Button
            variant="filled"
            color="error"
            onClick={() => {
              onConfirm();
              modalControls.close();
            }}
          >
            {confirmLabel}
          </Button>
          <Button variant="text" onClick={modalControls.close}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
