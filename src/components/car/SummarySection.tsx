import type { ReactNode } from "react";
import { Card, DescriptionList, Heading } from "@slauyama/ui";

// Lays SummarySections side by side, as many as fit. DescriptionList gives the
// term a third of the row, so 32rem keeps the longest terms on one line;
// auto-fill (not auto-fit) stops a lone section from stretching full width.
export function SummaryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 grid gap-6 items-start grid-cols-[repeat(auto-fill,minmax(min(100%,32rem),1fr))]">
      {children}
    </div>
  );
}

export interface SummaryItem {
  term: string;
  value: string;
}

export default function SummarySection({
  title,
  items,
}: {
  title: string;
  items: SummaryItem[];
}) {
  return (
    <section>
      <Heading as="h2" variant="title-large" className="mb-3">
        {title}
      </Heading>
      <Card className="px-4">
        <DescriptionList dividers>
          {items.map((item) => (
            <DescriptionList.Item key={item.term} term={item.term}>
              {item.value}
            </DescriptionList.Item>
          ))}
        </DescriptionList>
      </Card>
    </section>
  );
}
