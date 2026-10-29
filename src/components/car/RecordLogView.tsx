import { useState, type ReactNode } from "react";
import {
  Button,
  Card,
  SearchBar,
  Table,
  Text,
  useIsOpen,
  useTableSort,
} from "@slauyama/ui";
import type { CollectionHandle, FirebaseDoc } from "../../hooks/useFirebaseCollection";
import ConfirmModal from "../ui/ConfirmModal";
import ListStateContainer from "../ui/ListStateContainer";
import RecordModal, { type FieldDef } from "./RecordModal";
import { SummaryLayout } from "./SummarySection";

export interface ColumnDef<T> {
  label: string;
  render: (record: T) => ReactNode;
  sortKey?: keyof T;
  align?: "left" | "right";
  className?: string;
}

interface RecordLogViewProps<T extends FirebaseDoc> {
  noun: string;
  collection: CollectionHandle<T>;
  columns: ColumnDef<T>[];
  fields: FieldDef<Omit<T, "id" | "createdAt">>[];
  blank: Omit<T, "id" | "createdAt">;
  searchText: (record: T) => string;
  viewHeadline?: (record: Omit<T, "id" | "createdAt">) => string;
  summary?: ReactNode;
}

const PAGE_SIZE = 15;

// Blank values (e.g. no mileage recorded) sort before real ones ascending,
// instead of being compared as the string "null".
function compareNullable<T>(a: T, b: T, field: keyof T): number {
  const x = a[field];
  const y = b[field];
  if (x == null && y == null) return 0;
  if (x == null) return -1;
  if (y == null) return 1;
  if (typeof x === "number" && typeof y === "number") return x - y;
  return String(x).localeCompare(String(y));
}

export default function RecordLogView<T extends FirebaseDoc>({
  noun,
  collection,
  columns,
  fields,
  blank,
  searchText,
  viewHeadline,
  summary,
}: RecordLogViewProps<T>) {
  type Input = Omit<T, "id" | "createdAt">;
  const { items, loading, add, update, remove } = collection;
  const addModal = useIsOpen();
  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();

  const [active, setActive] = useState<T | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = query
    ? items.filter((r) =>
        searchText(r).toLowerCase().includes(query.toLowerCase()),
      )
    : items;
  const {
    sortedTableRows: rows,
    sortField,
    sortDirection,
    toggleSort,
  } = useTableSort(filtered, "date" as keyof T, {
    initialDirection: "desc",
    comparator: compareNullable,
  });
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE);
  const lowerNoun = noun.toLowerCase();

  return (
    <>
      <div className="flex flex-col sm:flex-row mb-6 gap-2 justify-between align-baseline items-center">
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button onClick={addModal.open} icon="add" className="w-full sm:w-fit">
          Add {noun}
        </Button>
      </div>

      <ListStateContainer
        isLoading={loading}
        isEmpty={items.length === 0}
        hasNoMatches={rows.length === 0}
        emptyContent={
          <>
            <Text as="p" className="text-5xl mb-3">
              🚗
            </Text>
            <Text as="p" variant="body-large">
              No {lowerNoun} entries yet
            </Text>
          </>
        }
        noMatchContent={
          <Text as="p" variant="body-large">
            No {lowerNoun} entries match your search
          </Text>
        }
      >
        <Card className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                {columns.map((col) => (
                  <Table.Head
                    key={col.label}
                    align={col.align}
                    onSort={
                      col.sortKey ? () => toggleSort(col.sortKey!) : undefined
                    }
                    sortDirection={
                      col.sortKey && sortField === col.sortKey
                        ? sortDirection
                        : undefined
                    }
                  >
                    {col.label}
                  </Table.Head>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleRows.map((record) => (
                <Table.Row
                  key={record.id}
                  onClick={() => {
                    setActive(record);
                    editModal.open();
                  }}
                >
                  {columns.map((col) => (
                    <Table.Cell
                      key={col.label}
                      align={col.align}
                      className={col.className}
                    >
                      {col.render(record)}
                    </Table.Cell>
                  ))}
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

      {items.length > 0 && summary && <SummaryLayout>{summary}</SummaryLayout>}

      <RecordModal<Input>
        noun={noun}
        fields={fields}
        blank={blank}
        viewHeadline={viewHeadline}
        modalControls={addModal}
        onSave={(data) => {
          add(data);
          addModal.close();
        }}
      />

      {active && (
        <RecordModal<Input>
          key={active.id}
          noun={noun}
          fields={fields}
          blank={blank}
          record={active}
          viewHeadline={viewHeadline}
          modalControls={editModal}
          onSave={(data) => {
            update(active.id, data as Partial<T>);
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
        title={`Delete ${noun}`}
        message={`Are you sure you want to delete this ${lowerNoun} entry? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (active) remove(active.id);
          setActive(null);
        }}
      />
    </>
  );
}
