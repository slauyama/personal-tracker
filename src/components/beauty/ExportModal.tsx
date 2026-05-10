import { Product } from "../../hooks/useProducts";
import { Button, Modal } from "../ui/UI";
import { ModalControls } from "../../hooks/useModal";

interface ExportModalProps {
  products: Product[];
  modalControls: ModalControls;
}

function downloadJSON(products: Product[]) {
  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `beauty-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportModal({
  products,
  modalControls,
}: ExportModalProps) {
  return (
    <Modal modalControls={modalControls} title="Export">
      <div className="p-6">
        <Button
          variant="secondary"
          size="sm"
          disabled={products.length === 0}
          onClick={() => downloadJSON(products)}
        >
          Download JSON
        </Button>
      </div>
    </Modal>
  );
}
