import { Button, Dialog, Text, type ModalControls } from "@slauyama/ui";

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
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={title}
      actions={
        <>
          <Button variant="text" onClick={modalControls.close}>
            Cancel
          </Button>
          <Button
            variant="filled"
            onClick={() => {
              onConfirm();
              modalControls.close();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Text>{message}</Text>
    </Dialog>
  );
}
