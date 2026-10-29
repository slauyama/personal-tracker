import { useMemo } from "react";
import type { CollectionHandle } from "../../hooks/useFirebaseCollection";
import type { GasFillUp, GasFillUpInput } from "../../hooks/useCarLogs";
import { formatShortDate } from "../../lib/formatDate";
import {
  buildGasStats,
  formatNumber,
  formatUsd,
  mpg,
} from "../../lib/carStats";
import RecordLogView, { type ColumnDef } from "./RecordLogView";
import type { FieldDef } from "./RecordModal";
import SummarySection from "./SummarySection";

const BLANK: GasFillUpInput = {
  date: "",
  odometer: null,
  location: "",
  pricePerGallon: null,
  cost: null,
  tripMiles: null,
  premium: false,
  notes: "",
};

const FIELDS: FieldDef<GasFillUpInput>[] = [
  { key: "date", label: "Date", kind: "date" },
  {
    key: "location",
    label: "Location",
    kind: "text",
    placeholder: "e.g. Costco - Coleman",
  },
  {
    key: "odometer",
    label: "Odometer",
    kind: "number",
    placeholder: "e.g. 136475",
  },
  {
    key: "tripMiles",
    label: "Trip Miles",
    kind: "number",
    placeholder: "e.g. 312.4",
  },
  {
    key: "pricePerGallon",
    label: "Price / Gallon",
    kind: "currency",
    decimals: 3,
    placeholder: "0.000",
  },
  { key: "cost", label: "Total Cost", kind: "currency", placeholder: "0.00" },
  { key: "premium", label: "Premium", kind: "toggle" },
  {
    key: "notes",
    label: "Notes",
    kind: "textarea",
    placeholder: "Any notes about this fill-up…",
  },
];

const COLUMNS: ColumnDef<GasFillUp>[] = [
  {
    label: "Date",
    sortKey: "date",
    className: "whitespace-nowrap",
    render: (f) => formatShortDate(f.date),
  },
  {
    label: "Location",
    className: "truncate",
    render: (f) => f.location || "—",
  },
  {
    label: "$ / Gal",
    sortKey: "pricePerGallon",
    align: "right",
    className: "whitespace-nowrap",
    render: (f) =>
      f.pricePerGallon != null
        ? `${formatUsd(f.pricePerGallon, 3)}${f.premium ? " ★" : ""}`
        : "—",
  },
  {
    label: "Cost",
    sortKey: "cost",
    align: "right",
    className: "whitespace-nowrap",
    render: (f) => (f.cost != null ? formatUsd(f.cost) : "—"),
  },
  {
    label: "Miles",
    sortKey: "tripMiles",
    align: "right",
    render: (f) => (f.tripMiles != null ? formatNumber(f.tripMiles, 1) : "—"),
  },
  {
    label: "MPG",
    align: "right",
    render: (f) => {
      const value = mpg(f);
      return value != null ? formatNumber(value, 1) : "—";
    },
  },
];

function searchText(f: GasFillUp): string {
  return [f.date, f.location, f.notes, f.premium ? "premium" : ""].join(" ");
}

export default function CarGasView({
  collection,
}: {
  collection: CollectionHandle<GasFillUp>;
}) {
  const today = useMemo(() => new Date(), []);
  const stats = buildGasStats(collection.items, today);

  return (
    <RecordLogView
      noun="Fill-Up"
      collection={collection}
      columns={COLUMNS}
      fields={FIELDS}
      blank={BLANK}
      searchText={searchText}
      viewHeadline={(f) => f.location || "Fill-Up"}
      summary={
        <>
          <SummarySection
            title="Gas Costs"
            items={[
              { term: "Total Spent", value: formatUsd(stats.totalCost) },
              { term: "Cost / Day", value: formatUsd(stats.costPerDay) },
              { term: "Cost / Year", value: formatUsd(stats.costPerYear) },
              {
                term: "Cost / Mile",
                value:
                  stats.costPerMile != null
                    ? formatUsd(stats.costPerMile, 3)
                    : "—",
              },
            ]}
          />
          <SummarySection
            title="Fuel Economy"
            items={[
              {
                term: "Average MPG",
                value:
                  stats.averageMpg != null
                    ? formatNumber(stats.averageMpg, 2)
                    : "—",
              },
              {
                term: "Average $ / Gallon",
                value:
                  stats.averageRegularPrice != null
                    ? formatUsd(stats.averageRegularPrice, 3)
                    : "—",
              },
            ]}
          />
        </>
      }
    />
  );
}
