import { useMemo } from "react";
import type { CollectionHandle } from "../../hooks/useFirebaseCollection";
import type { CarService, CarServiceInput } from "../../hooks/useCarLogs";
import { formatShortDate } from "../../lib/formatDate";
import { buildServiceStats, formatNumber, formatUsd } from "../../lib/carStats";
import RecordLogView, { type ColumnDef } from "./RecordLogView";
import type { FieldDef } from "./RecordModal";
import SummarySection from "./SummarySection";

const BLANK: CarServiceInput = {
  date: "",
  mileage: null,
  activity: "",
  vendor: "",
  location: "",
  cost: null,
  notes: "",
};

const FIELDS: FieldDef<CarServiceInput>[] = [
  { key: "activity", label: "Activity", kind: "text", required: true, placeholder: "e.g. Oil Change" },
  { key: "date", label: "Date", kind: "date" },
  { key: "mileage", label: "Mileage", kind: "number", placeholder: "e.g. 124268" },
  { key: "vendor", label: "Vendor", kind: "text", placeholder: "e.g. Jiffy Lube" },
  { key: "location", label: "Location", kind: "text", placeholder: "e.g. San Jose" },
  { key: "cost", label: "Cost", kind: "currency", placeholder: "0.00" },
  { key: "notes", label: "Notes", kind: "textarea", placeholder: "Any notes about this service…" },
];

const COLUMNS: ColumnDef<CarService>[] = [
  { label: "Date", sortKey: "date", className: "whitespace-nowrap", render: (s) => formatShortDate(s.date) },
  { label: "Mileage", sortKey: "mileage", align: "right", render: (s) => (s.mileage != null ? formatNumber(s.mileage) : "—") },
  { label: "Activity", sortKey: "activity", className: "max-w-xs truncate", render: (s) => s.activity },
  {
    label: "Vendor",
    className: "truncate",
    render: (s) => [s.vendor, s.location].filter(Boolean).join(" · ") || "—",
  },
  { label: "Cost", sortKey: "cost", align: "right", className: "whitespace-nowrap", render: (s) => (s.cost != null ? formatUsd(s.cost) : "—") },
];

function searchText(s: CarService): string {
  return [s.date, s.activity, s.vendor, s.location, s.notes].join(" ");
}

export default function CarServicesView({
  collection,
}: {
  collection: CollectionHandle<CarService>;
}) {
  const today = useMemo(() => new Date(), []);
  const stats = buildServiceStats(collection.items, today);

  return (
    <RecordLogView
      noun="Service"
      collection={collection}
      columns={COLUMNS}
      fields={FIELDS}
      blank={BLANK}
      searchText={searchText}
      viewHeadline={(s) => s.activity}
      summary={
        <SummarySection
          title="Repair Costs"
          items={[
            { term: "Total Spent", value: formatUsd(stats.totalCost) },
            { term: "Cost / Year", value: formatUsd(stats.costPerYear) },
          ]}
        />
      }
    />
  );
}
