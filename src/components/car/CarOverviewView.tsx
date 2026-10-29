import { useMemo } from "react";
import { CircularProgress, Text } from "@slauyama/ui";
import type {
  CarService,
  GasFillUp,
  InsurancePayment,
} from "../../hooks/useCarLogs";
import {
  buildOverviewStats,
  formatNumber,
  formatUsd,
} from "../../lib/carStats";
import SummarySection, { SummaryLayout } from "./SummarySection";

interface CarOverviewViewProps {
  services: CarService[];
  fillUps: GasFillUp[];
  payments: InsurancePayment[];
  loading: boolean;
}

export default function CarOverviewView({
  services,
  fillUps,
  payments,
  loading,
}: CarOverviewViewProps) {
  const today = useMemo(() => new Date(), []);
  const stats = buildOverviewStats(services, fillUps, payments, today);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <CircularProgress label="Loading" />
      </div>
    );
  }

  if (!stats.start) {
    return (
      <div className="text-center py-20">
        <Text as="p" className="text-5xl mb-3">
          🚗
        </Text>
        <Text as="p" variant="body-large">
          No car entries yet
        </Text>
      </div>
    );
  }

  return (
    <SummaryLayout>
      <SummarySection
        title="Total Cost"
        items={[
          { term: "Repair", value: formatUsd(stats.repair) },
          { term: "Gas", value: formatUsd(stats.gas) },
          { term: "Insurance", value: formatUsd(stats.insurance) },
          { term: "Total", value: formatUsd(stats.total) },
        ]}
      />

      <SummarySection
        title="Cost Over Time"
        items={[
          { term: "Cost / Day", value: formatUsd(stats.costPerDay) },
          { term: "Cost / Year", value: formatUsd(stats.costPerYear) },
          {
            term: "Cost / Mile",
            value:
              stats.costPerMile != null ? formatUsd(stats.costPerMile, 3) : "—",
          },
        ]}
      />

      <SummarySection
        title="Mileage"
        items={[
          { term: "Total Miles", value: formatNumber(stats.totalMiles) },
          { term: "Miles / Day", value: formatNumber(stats.milesPerDay, 1) },
          { term: "Miles / Year", value: formatNumber(stats.milesPerYear) },
        ]}
      />
    </SummaryLayout>
  );
}
