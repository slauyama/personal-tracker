import { useState } from "react";
import { Button, Input, Modal, type ModalControls } from "@slauyama/ui";
import type {
  Transaction,
  TransactionInput,
} from "../../hooks/useTransactions";
import { useBreakpoints } from "../../hooks/useBreakpoints";

interface TransactionModalProps {
  productId: string;
  initialValues?: Transaction;
  onSave: (data: TransactionInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormEvent = React.ChangeEvent<HTMLInputElement>;

function blank(productId: string): TransactionInput {
  return {
    productId,
    purchaseDate: new Date().toISOString().slice(0, 10),
    price: null,
    location: "",
    finishDate: "",
  };
}

function toInput(transaction: Transaction): TransactionInput {
  const { id: _id, createdAt: _createdAt, ...rest } = transaction;
  return rest;
}

export default function TransactionModal({
  productId,
  initialValues,
  onSave,
  onDelete,
  modalControls,
}: TransactionModalProps) {
  const isEdit = !!initialValues;
  const { isSmall } = useBreakpoints();

  const [form, setForm] = useState<TransactionInput>(
    initialValues ? toInput(initialValues) : blank(productId),
  );
  const [priceStr, setPriceStr] = useState<string>(
    initialValues?.price != null ? initialValues.price.toFixed(2) : "",
  );

  function set(field: keyof TransactionInput) {
    return (e: FormEvent) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handlePriceBlur() {
    const num = parseFloat(priceStr);
    const parsed = isNaN(num) || priceStr.trim() === "" ? null : num;
    setPriceStr(parsed != null ? parsed.toFixed(2) : "");
    setForm((prev) => ({ ...prev, price: parsed }));
  }

  function saveForm() {
    if (!form.purchaseDate) return;
    onSave(form);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveForm();
  }

  return (
    <Modal
      variant={isSmall ? "fullscreen" : "basic"}
      modalControls={modalControls}
      headerAction={
        <Button variant="filled" type="button" onClick={() => saveForm()}>
          {isEdit ? "Save" : "Add Purchase"}
        </Button>
      }
      title={isEdit ? "Edit Purchase" : "Add Purchase"}
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 md:gap-3">
            <Input
              label="Purchase Date"
              type="date"
              required
              value={form.purchaseDate}
              onChange={set("purchaseDate")}
            />
            <Input
              label="Price"
              prefix="$"
              type="text"
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="0.00"
            />
            <Input
              label="Location"
              type="text"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Sephora, Ulta"
            />
            <Input
              label="Finish Date"
              type="date"
              value={form.finishDate}
              onChange={set("finishDate")}
            />
          </div>

          <div className="flex pt-2 justify-between">
            {onDelete && (
              <Button
                surface="error"
                variant="filled"
                color="error"
                type="button"
                onClick={onDelete}
                className="w-40"
              >
                Delete
              </Button>
            )}
            <Button variant="filled" type="submit" className="hidden">
              {isEdit ? "Save" : "Add Purchase"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
