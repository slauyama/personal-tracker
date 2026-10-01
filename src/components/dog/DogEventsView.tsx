import { useState } from "react";
import {
  Button,
  Card,
  Heading,
  SearchBar,
  Table,
  Text,
  useIsOpen,
  useTableSort,
} from "@slauyama/ui";
import { DogEventType } from "../../constants";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";
import DogEventModal from "./DogEventModal";
import ConfirmModal from "../ui/ConfirmModal";
import ListStateContainer from "../ui/ListStateContainer";
import DogWeightChart from "./DogWeightChart";
import CategoryBadge from "./CategoryBadge";
import { EVENT_TYPE_COLORS } from "./categoryColors";
import { useBreakpoints } from "@slauyama/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { formatShortDate } from "../../lib/formatDate";

interface DogEventsViewProps {
  dogEvents: DogEvent[];
  loading: boolean;
  onAddEvent: (data: DogEventInput) => void;
  onUpdateEvent: (id: string, data: DogEventInput) => void;
  onDeleteEvent: (id: string) => void;
}

const PAGE_SIZE = 15;

function matchesQuery(event: DogEvent, query: string): boolean {
  if (!query) return true;
  return [event.date, event.type, event.notes]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export default function DogEventsView({
  dogEvents,
  loading,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: DogEventsViewProps) {
  const addModal = useIsOpen();
  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();

  const [activeEvent, setActiveEvent] = useState<DogEvent | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const { isLarge } = useBreakpoints();

  function openEdit(event: DogEvent) {
    setActiveEvent(event);
    editModal.open();
  }

  const nonWeightEvents = dogEvents.filter(
    (e) => e.type !== DogEventType.Weight,
  );
  const filtered = nonWeightEvents.filter((e) => matchesQuery(e, query));
  const {
    sortedTableRows: rows,
    sortField,
    sortDirection,
    toggleSort,
  } = useTableSort(filtered, "date", {
    initialDirection: "desc",
  });
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showEvents = pathname.includes("/events");

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outlined"
          onClick={() => navigate(showEvents ? "/dog" : "/dog/events")}
        >
          {showEvents ? "← Purchases" : "Events"}
        </Button>
        <Button onClick={addModal.open} icon="add">
          {isLarge ? "Add" : "Add Event"}
        </Button>
      </div>
      <SearchBar
        className="mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ListStateContainer
        isLoading={loading}
        isEmpty={nonWeightEvents.length === 0}
        hasNoMatches={rows.length === 0}
        emptyContent={
          <>
            <Text as="p" className="text-5xl mb-3">
              🐾
            </Text>
            <Text as="p" variant="body-large">
              No events yet
            </Text>
          </>
        }
        noMatchContent={
          <Text as="p" variant="body-large">
            No events match your search
          </Text>
        }
      >
        <Card className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head
                  onSort={() => toggleSort("date")}
                  sortDirection={
                    sortField === "date" ? sortDirection : undefined
                  }
                >
                  Date
                </Table.Head>
                <Table.Head
                  onSort={() => toggleSort("type")}
                  sortDirection={
                    sortField === "type" ? sortDirection : undefined
                  }
                >
                  Type
                </Table.Head>
                <Table.Head>Notes</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleRows.map((event) => (
                <Table.Row key={event.id} onClick={() => openEdit(event)}>
                  <Table.Cell className="whitespace-nowrap">
                    {formatShortDate(event.date)}
                  </Table.Cell>
                  <Table.Cell>
                    <CategoryBadge
                      label={event.type}
                      color={EVENT_TYPE_COLORS[event.type]}
                    />
                  </Table.Cell>
                  <Table.Cell className="truncate">{event.notes}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </ListStateContainer>

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-3">
          <Button variant="outlined" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Show less" : `Show all ${rows.length}`}
          </Button>
        </div>
      )}

      <Card className="p-4 mt-6">
        <Heading as="h3" variant="headline-small" className="mb-2">
          Weight
        </Heading>
        <DogWeightChart events={dogEvents} onEditWeight={openEdit} />
      </Card>

      <DogEventModal
        modalControls={addModal}
        onSave={(data) => {
          onAddEvent(data);
          addModal.close();
        }}
      />

      {activeEvent && (
        <DogEventModal
          key={activeEvent.id}
          modalControls={editModal}
          dogEvent={activeEvent}
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
