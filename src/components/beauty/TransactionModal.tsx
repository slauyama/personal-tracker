import { useState } from "react";
import { Button, Dialog, TextField, type ModalControls } from "@slauyama/ui";
import type {
  Transaction,
  TransactionInput,
} from "../../hooks/useTransactions";

interface TransactionModalProps {
  productId: string;
  initialValues?: Transaction;
  onSave: (data: TransactionInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

function blank(productId: string): TransactionInput {
  return {
    productId,
    purchaseDate: new Date().toISOString().slice(0, 10),
    price: null,
    location: "",
    finishDate: "",
    notes: "",
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
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={isEdit ? "Edit Purchase" : "Add Purchase"}
      actions={
        <>
          {onDelete && (
            <Button
              variant="filled"
              type="button"
              onClick={onDelete}
              className="bg-(--color-error)! text-(--color-on-error)! mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="text" type="button" onClick={modalControls.close}>
            Cancel
          </Button>
          <Button variant="filled" type="button" onClick={saveForm}>
            {isEdit ? "Save" : "Add Purchase"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 md:gap-3">
          <TextField
            variant="outlined"
            label="Purchase Date"
            type="date"
            fullWidth
            value={form.purchaseDate}
            onChange={set("purchaseDate")}
          />
          <TextField
            variant="outlined"
            label="Price"
            prefix="$"
            type="text"
            fullWidth
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => setPriceStr(e.target.value)}
            onBlur={handlePriceBlur}
            placeholder="0.00"
          />
          <TextField
            variant="outlined"
            label="Location"
            type="text"
            fullWidth
            value={form.location}
            onChange={set("location")}
            placeholder="e.g. Sephora, Ulta"
          />
          <TextField
            variant="outlined"
            label="Finish Date"
            type="date"
            fullWidth
            value={form.finishDate}
            onChange={set("finishDate")}
          />
        </div>

        <TextField
          variant="outlined"
          label="Notes"
          textarea
          fullWidth
          value={form.notes}
          onChange={set("notes")}
          placeholder="Any notes about this purchase…"
          rows={2}
        />
      </form>
    </Dialog>
  );
}
