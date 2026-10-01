const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
});

// Parse "YYYY-MM-DD" as local midnight; `new Date("YYYY-MM-DD")` is UTC and
// renders as the previous day in timezones west of UTC.
export function formatShortDate(isoDate: string): string {
  return SHORT_DATE.format(new Date(`${isoDate}T00:00:00`));
}
