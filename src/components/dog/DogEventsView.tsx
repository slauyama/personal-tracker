import { useState } from "react";
import { Button, Card, Heading, Input, Text, useIsOpen } from "@slauyama/ui";
import { DogEventType } from "../../constants";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";
import AddDogEventModal from "./AddDogEventModal";
import ConfirmModal from "../ui/ConfirmModal";
import DogWeightChart from "./DogWeightChart";
import SortableHeader from "./SortableHeader";
import CategoryBadge from "./CategoryBadge";
import { EVENT_TYPE_COLORS } from "./categoryColors";

interface DogEventsViewProps {
  dogEvents: DogEvent[];
  onAddEvent: (data: DogEventInput) => void;
  onUpdateEvent: (id: string, data: DogEventInput) => void;
  onDeleteEvent: (id: string) => void;
}

type SortField = "date" | "type";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function matchesQuery(event: DogEvent, query: string): boolean {
  if (!query) return true;
  return [event.date, event.type, event.notes]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function sortEvents(
  events: DogEvent[],
  field: SortField,
  dir: SortDir,
): DogEvent[] {
  return [...events].sort((a, b) => {
    const cmp =
      field === "type"
        ? a.type.localeCompare(b.type)
        : a.date < b.date
          ? -1
          : a.date > b.date
            ? 1
            : 0;
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function DogEventsView({
  dogEvents,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: DogEventsViewProps) {
  const addModal = useIsOpen();
  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();

  const [activeEvent, setActiveEvent] = useState<DogEvent | null>(null);
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState(false);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function openEdit(event: DogEvent) {
    setActiveEvent(event);
    editModal.open();
  }

  const nonWeightEvents = dogEvents.filter(
    (e) => e.type !== DogEventType.Weight,
  );
  const filtered = nonWeightEvents.filter((e) => matchesQuery(e, query));
  const rows = sortEvents(filtered, sortField, sortDir);
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Input
          label="Search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, type…"
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button onClick={addModal.open}>+ Add Event</Button>
      </div>

      {nonWeightEvents.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-5xl mb-3">
            🐾
          </Text>
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No events yet
          </Text>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No events match your search
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
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => openEdit(event)}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-50 dark:border-zinc-700 last:border-b-0"
                >
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {event.date}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge
                      label={event.type}
                      color={EVENT_TYPE_COLORS[event.type]}
                    />
                  </td>
                  <td className="px-4 py-3">{event.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-3">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Show less" : `Show all ${rows.length}`}
          </Button>
        </div>
      )}

      <Card className="p-4 mt-6">
        <Heading as="h3" variant="subtitle" className="mb-2">
          Weight
        </Heading>
        <DogWeightChart events={dogEvents} onEditWeight={openEdit} />
      </Card>

      <AddDogEventModal
        modalControls={addModal}
        onSave={(data) => {
          onAddEvent(data);
          addModal.close();
        }}
      />

      {activeEvent && (
        <AddDogEventModal
          key={activeEvent.id}
          modalControls={editModal}
          initialValues={activeEvent}
          onSave={(data) => {
            onUpdateEvent(activeEvent.id, data);
            editModal.close();
          }}
          onDelete={() => {
            editModal.close();
            confirmDeleteModal.open();
          }}
        />
      )}

      <ConfirmModal
        modalControls={confirmDeleteModal}
        title="Delete Event"
        message="Are you sure you want to delete this event? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (activeEvent) onDeleteEvent(activeEvent.id);
          setActiveEvent(null);
        }}
      />
    </>
  );
}
