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
        <Text variant="body">{message}</Text>
        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={modalControls.close}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            color="destructive"
            onClick={() => {
              onConfirm();
              modalControls.close();
            }}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
