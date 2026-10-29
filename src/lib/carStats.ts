import type {
  CarService,
  GasFillUp,
  InsurancePayment,
} from "../hooks/useCarLogs";

const DAY_MS = 1000 * 60 * 60 * 24;

export function formatUsd(n: number, maximumFractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}

export function formatNumber(n: number, maximumFractionDigits = 0): string {
  return n.toLocaleString("en-US", { maximumFractionDigits });
}

// Parse "YYYY-MM-DD" as local midnight, matching formatShortDate.
function daysSince(isoDate: string, today: Date): number {
  const start = new Date(`${isoDate}T00:00:00`).getTime();
  return Math.max(1, Math.floor((today.getTime() - start) / DAY_MS));
}

function earliestDate(dates: string[]): string | null {
  return dates.reduce<string | null>(
    (earliest, d) => (d && (earliest === null || d < earliest) ? d : earliest),
    null,
  );
}

function sumCost(rows: Array<{ cost: number | null }>): number {
  return rows.reduce((sum, r) => sum + (r.cost ?? 0), 0);
}

export function gallons(fillUp: GasFillUp): number | null {
  if (!fillUp.cost || !fillUp.pricePerGallon) return null;
  return fillUp.cost / fillUp.pricePerGallon;
}

export function mpg(fillUp: GasFillUp): number | null {
  const g = gallons(fillUp);
  if (!g || !fillUp.tripMiles) return null;
  return fillUp.tripMiles / g;
}

export function buildGasStats(fillUps: GasFillUp[], today: Date) {
  const totalCost = sumCost(fillUps);
  const start = earliestDate(fillUps.map((f) => f.date));
  const days = start ? daysSince(start, today) : 1;

  const mpgs = fillUps.map(mpg).filter((m): m is number => m != null);
  const averageMpg = mpgs.length
    ? mpgs.reduce((sum, m) => sum + m, 0) / mpgs.length
    : null;

  const regularPrices = fillUps
    .filter((f) => !f.premium && f.pricePerGallon)
    .map((f) => f.pricePerGallon as number);
  const averageRegularPrice = regularPrices.length
    ? regularPrices.reduce((sum, p) => sum + p, 0) / regularPrices.length
    : null;

  const measured = fillUps.filter((f) => f.tripMiles && f.cost);
  const measuredMiles = measured.reduce((sum, f) => sum + f.tripMiles!, 0);
  const costPerMile = measuredMiles ? sumCost(measured) / measuredMiles : null;

  return {
    totalCost,
    averageMpg,
    averageRegularPrice,
    costPerDay: totalCost / days,
    costPerYear: (totalCost / days) * 365,
    costPerMile,
  };
}

export function buildInsuranceStats(payments: InsurancePayment[], today: Date) {
  const totalCost = sumCost(payments);
  const start = earliestDate(payments.map((p) => p.date));
  const years = start ? daysSince(start, today) / 365.25 : 0;
  return {
    totalCost,
    years,
    costPerYear: years ? totalCost / years : 0,
  };
}

export function buildServiceStats(services: CarService[], today: Date) {
  const totalCost = sumCost(services);
  const start = earliestDate(services.map((s) => s.date));
  const days = start ? daysSince(start, today) : 1;
  return {
    totalCost,
    costPerYear: (totalCost / days) * 365,
  };
}

export function buildOverviewStats(
  services: CarService[],
  fillUps: GasFillUp[],
  payments: InsurancePayment[],
  today: Date,
) {
  const repair = sumCost(services);
  const gas = sumCost(fillUps);
  const insurance = sumCost(payments);
  const total = repair + gas + insurance;

  const start = earliestDate([
    ...services.map((s) => s.date),
    ...fillUps.map((f) => f.date),
    ...payments.map((p) => p.date),
  ]);
  const days = start ? daysSince(start, today) : 1;

  const totalMiles = Math.max(
    0,
    ...services.map((s) => s.mileage ?? 0),
    ...fillUps.map((f) => f.odometer ?? 0),
  );

  return {
    start,
    repair,
    gas,
    insurance,
    total,
    costPerDay: total / days,
    costPerYear: (total / days) * 365,
    totalMiles,
    milesPerDay: totalMiles / days,
    milesPerYear: (totalMiles / days) * 365,
    costPerMile: totalMiles ? total / totalMiles : null,
  };
}
