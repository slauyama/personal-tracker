import { useRef, useState } from "react";
import { Product } from "../hooks/useProducts";
import Button from "./ui/Button";
import Heading from "./ui/Heading";
import Modal from "./ui/Modal";
import Text from "./ui/Text";
import { ModalControls } from "../hooks/useModal";

interface ImportExportModalProps {
  products: Product[];
  onImport: (products: Product[], merge: boolean) => void;
  modalControls: ModalControls;
}

function downloadJSON(products: Product[]) {
  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `makeup-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type ImportMode = "merge" | "replace";

export default function ImportExportModal({
  products,
  onImport,
  modalControls,
}: ImportExportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Product[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed))
          throw new Error("File must contain a JSON array.");
        if (parsed.length === 0) throw new Error("File contains no products.");
        if (!parsed[0]?.id || !parsed[0]?.name)
          throw new Error("File doesn't look like a makeup-tracker export.");
        setPreview(parsed as Product[]);
        setParseError(null);
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : "Could not parse file.",
        );
        setPreview(null);
      }
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!preview) return;
    onImport(preview, mode === "merge");
    modalControls.close();
  }

  return (
    <Modal modalControls={modalControls}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <Heading as="h2" variant="title">
            Import / Export
          </Heading>
          <button
            onClick={modalControls.close}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <Heading as="h3" variant="subtitle">
            Export
          </Heading>
          <Button
            variant="secondary"
            size="sm"
            disabled={products.length === 0}
            onClick={() => downloadJSON(products)}
            className="self-start mt-1"
          >
            Download JSON
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <Text variant="caption" className="text-gray-300">
            or
          </Text>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="flex flex-col gap-3">
          <Heading as="h3" variant="subtitle">
            Import
          </Heading>
          <Text variant="caption" className="text-gray-400">
            Load products from a previously exported JSON file.
          </Text>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors text-center"
          >
            {preview
              ? `✓ ${preview.length} product${preview.length !== 1 ? "s" : ""} ready to import`
              : "Click to choose a .json file"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFile}
          />

          {parseError && (
            <Text variant="caption" className="text-red-400">
              {parseError}
            </Text>
          )}

          {preview && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("merge")}
                className={`flex-1 text-xs px-3 py-2 rounded-lg border transition ${
                  mode === "merge"
                    ? "bg-rose-50 border-rose-300 text-rose-600 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Merge
                <span className="block font-normal text-gray-400 mt-0.5">
                  Add new, keep existing
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMode("replace")}
                className={`flex-1 text-xs px-3 py-2 rounded-lg border transition ${
                  mode === "replace"
                    ? "bg-rose-50 border-rose-300 text-rose-600 font-medium"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Replace
                <span className="block font-normal text-gray-400 mt-0.5">
                  Overwrite all current data
                </span>
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={modalControls.close}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!preview}
              className="flex-1"
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
