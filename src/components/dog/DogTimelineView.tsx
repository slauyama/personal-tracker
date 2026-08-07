import { useState } from "react";
import { Button, Card, Input, Text, useIsOpen } from "@slauyama/ui";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";
import type { DogPurchase, DogPurchaseInput } from "../../hooks/useDogPurchases";
import AddDogEventModal from "./AddDogEventModal";
import AddDogPurchaseModal from "./AddDogPurchaseModal";
import ConfirmModal from "../ui/ConfirmModal";

interface DogTimelineViewProps {
  dogEvents: DogEvent[];
  dogPurchases: DogPurchase[];
  onAddEvent: (data: DogEventInput) => void;
  onUpdateEvent: (id: string, data: DogEventInput) => void;
  onDeleteEvent: (id: string) => void;
  onAddPurchase: (data: DogPurchaseInput) => void;
  onUpdatePurchase: (id: string, data: DogPurchaseInput) => void;
  onDeletePurchase: (id: string) => void;
}

type TimelineRow =
  | { kind: "event"; date: string; data: DogEvent }
  | { kind: "purchase"; date: string; data: DogPurchase };

type SortField = "date" | "type" | "price";
type SortDir = "asc" | "desc";

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function buildTimeline(
  dogEvents: DogEvent[],
  dogPurchases: DogPurchase[],
): TimelineRow[] {
  return [
    ...dogEvents.map((e): TimelineRow => ({ kind: "event", date: e.date, data: e })),
    ...dogPurchases.map(
      (p): TimelineRow => ({ kind: "purchase", date: p.date, data: p }),
    ),
  ];
}

function rowType(row: TimelineRow): string {
  return row.kind === "event" ? row.data.type : row.data.category;
}

function rowPrice(row: TimelineRow): number | null {
  return row.kind === "purchase" ? row.data.price : null;
}

function rowDescription(row: TimelineRow): string {
  if (row.kind === "event") {
    return row.data.type === "Weight" && row.data.weightLbs != null
      ? `${row.data.weightLbs} lbs`
      : row.data.notes;
  }
  return row.data.name;
}

function rowVendorLocation(row: TimelineRow): string {
  if (row.kind !== "purchase") return "";
  return [row.data.vendor, row.data.location].filter(Boolean).join(" · ");
}

function matchesQuery(row: TimelineRow, query: string): boolean {
  if (!query) return true;
  const haystack = [row.date, rowType(row), rowDescription(row), rowVendorLocation(row)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function sortRows(rows: TimelineRow[], field: SortField, dir: SortDir): TimelineRow[] {
  return [...rows].sort((a, b) => {
    let cmp: number;
    if (field === "price") {
      const ap = rowPrice(a);
      const bp = rowPrice(b);
      if (ap == null && bp == null) cmp = 0;
      else if (ap == null) return 1;
      else if (bp == null) return -1;
      else cmp = ap - bp;
    } else if (field === "type") {
      cmp = rowType(a).localeCompare(rowType(b));
    } else {
      cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return null;
  return <span className="inline-block ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  align?: "left" | "right";
  onClick: (field: SortField) => void;
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  align = "left",
  onClick,
}: SortableHeaderProps) {
  return (
    <th
      onClick={() => onClick(field)}
      className={`px-4 py-2 font-medium text-zinc-400 cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-200 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
      <SortArrow active={sortField === field} dir={sortDir} />
    </th>
  );
}

export default function DogTimelineView({
  dogEvents,
  dogPurchases,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
}: DogTimelineViewProps) {
  const addEventModal = useIsOpen();
  const editEventModal = useIsOpen();
  const addPurchaseModal = useIsOpen();
  const editPurchaseModal = useIsOpen();
  const confirmDeleteEventModal = useIsOpen();
  const confirmDeletePurchaseModal = useIsOpen();

  const [activeEvent, setActiveEvent] = useState<DogEvent | null>(null);
  const [activePurchase, setActivePurchase] = useState<DogPurchase | null>(null);
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const timeline = buildTimeline(dogEvents, dogPurchases);
  const filtered = timeline.filter((row) => matchesQuery(row, query));
  const rows = sortRows(filtered, sortField, sortDir);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Input
          label="Search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, vendor, type…"
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button variant="ghost" onClick={addEventModal.open}>
          + Add Event
        </Button>
        <Button onClick={addPurchaseModal.open}>+ Add Purchase</Button>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-5xl mb-3">
            🐾
          </Text>
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No events or purchases yet
          </Text>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No entries match your search
          </Text>
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-700">
                <SortableHeader
                  label="Date"
                  field="date"
                  sortField={sortField}
                  sortDir={sortDir}
                  onClick={handleSort}
                />
                <SortableHeader
                  label="Type"
                  field="type"
                  sortField={sortField}
                  sortDir={sortDir}
                  onClick={handleSort}
                />
                <th className="px-4 py-2 font-medium text-zinc-400 text-left">
                  Description
                </th>
                <th className="px-4 py-2 font-medium text-zinc-400 text-left">
                  Vendor / Location
                </th>
                <SortableHeader
                  label="Price"
                  field="price"
                  sortField={sortField}
                  sortDir={sortDir}
                  align="right"
                  onClick={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const price = rowPrice(row);
                return (
                  <tr
                    key={`${row.kind}-${row.data.id}`}
                    onClick={() => {
                      if (row.kind === "event") {
                        setActiveEvent(row.data);
                        editEventModal.open();
                      } else {
                        setActivePurchase(row.data);
                        editPurchaseModal.open();
                      }
                    }}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-50 dark:border-zinc-700 last:border-b-0"
                  >
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                        {rowType(row)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {rowDescription(row)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {rowVendorLocation(row) || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-500 whitespace-nowrap">
                      {price != null ? formatPrice(price) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <AddDogEventModal
        modalControls={addEventModal}
        onSave={(data) => {
          onAddEvent(data);
          addEventModal.close();
        }}
      />

      {activeEvent && (
        <AddDogEventModal
          key={activeEvent.id}
          modalControls={editEventModal}
          initialValues={activeEvent}
          onSave={(data) => {
            onUpdateEvent(activeEvent.id, data);
            editEventModal.close();
          }}
          onDelete={() => {
            editEventModal.close();
            confirmDeleteEventModal.open();
          }}
        />
      )}

      <AddDogPurchaseModal
        modalControls={addPurchaseModal}
        onSave={(data) => {
          onAddPurchase(data);
          addPurchaseModal.close();
        }}
      />

      {activePurchase && (
        <AddDogPurchaseModal
          key={activePurchase.id}
          modalControls={editPurchaseModal}
          initialValues={activePurchase}
          onSave={(data) => {
            onUpdatePurchase(activePurchase.id, data);
            editPurchaseModal.close();
          }}
          onDelete={() => {
            editPurchaseModal.close();
            confirmDeletePurchaseModal.open();
          }}
        />
      )}

      <ConfirmModal
        modalControls={confirmDeleteEventModal}
        title="Delete Event"
        message="Are you sure you want to delete this event? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (activeEvent) onDeleteEvent(activeEvent.id);
          setActiveEvent(null);
        }}
      />

      <ConfirmModal
        modalControls={confirmDeletePurchaseModal}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (activePurchase) onDeletePurchase(activePurchase.id);
          setActivePurchase(null);
        }}
      />
    </>
  );
}
