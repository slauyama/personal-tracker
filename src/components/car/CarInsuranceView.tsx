import { useMemo } from "react";
import type { CollectionHandle } from "../../hooks/useFirebaseCollection";
import type {
  InsurancePayment,
  InsurancePaymentInput,
} from "../../hooks/useCarLogs";
import { formatShortDate } from "../../lib/formatDate";
import {
  buildInsuranceStats,
  formatNumber,
  formatUsd,
} from "../../lib/carStats";
import RecordLogView, { type ColumnDef } from "./RecordLogView";
import type { FieldDef } from "./RecordModal";
import SummarySection from "./SummarySection";

const BLANK: InsurancePaymentInput = {
  date: "",
  cost: null,
  notes: "",
};

const FIELDS: FieldDef<InsurancePaymentInput>[] = [
  { key: "date", label: "Date", kind: "date" },
  { key: "cost", label: "Cost", kind: "currency", placeholder: "0.00" },
  {
    key: "notes",
    label: "Notes",
    kind: "textarea",
    placeholder: "e.g. AAA 6-month premium",
  },
];

const COLUMNS: ColumnDef<InsurancePayment>[] = [
  {
    label: "Date",
    sortKey: "date",
    className: "whitespace-nowrap",
    render: (p) => formatShortDate(p.date),
  },
  { label: "Notes", className: "truncate", render: (p) => p.notes || "—" },
  {
    label: "Cost",
    sortKey: "cost",
    align: "right",
    className: "whitespace-nowrap",
    render: (p) => (p.cost != null ? formatUsd(p.cost) : "—"),
  },
];

function searchText(p: InsurancePayment): string {
  return [p.date, p.notes].join(" ");
}

export default function CarInsuranceView({
  collection,
}: {
  collection: CollectionHandle<InsurancePayment>;
}) {
  const today = useMemo(() => new Date(), []);
  const stats = buildInsuranceStats(collection.items, today);

  return (
    <RecordLogView
      noun="Payment"
      collection={collection}
      columns={COLUMNS}
      fields={FIELDS}
      blank={BLANK}
      searchText={searchText}
      viewHeadline={(p) => `Insurance · ${p.date}`}
      summary={
        <SummarySection
          title="Insurance Costs"
          items={[
            { term: "Total Spent", value: formatUsd(stats.totalCost) },
            { term: "Years Owned", value: formatNumber(stats.years, 2) },
            { term: "Cost / Year", value: formatUsd(stats.costPerYear) },
          ]}
        />
      }
    />
  );
}
