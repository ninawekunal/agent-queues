import { HeadingBanner } from "@/components/HeadingBanner";
import { RefundWorkbench } from "@/components/RefundWorkbench";
import type { RefundRequest } from "@/shared/contracts/refunds";

const HOTEL_NAMES = [
  "Grand Horizon Hotel",
  "Seabreeze Suites",
  "Maple Crown Inn",
  "Aurora Bay Resort",
  "Summit Peak Lodge",
  "Golden Palm Retreat",
  "Riverstone Hotel",
  "Skyline Central",
  "Bluewater Boutique",
  "Evergreen Palace",
];

const REFUND_REASONS = [
  "Duplicate booking charge",
  "Flight cancellation impacted stay",
  "Room unavailable at check-in",
  "Incorrect billing amount",
  "Customer canceled within policy window",
];

function createDummyRefunds(agentId: string, count: number): RefundRequest[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `rr_${agentId}_${index + 1}`,
    agentId,
    hotelName: HOTEL_NAMES[index % HOTEL_NAMES.length],
    bookingReference: `BK${String(100000 + index)}`,
    amount: Number((89 + (index + 1) * 17.35).toFixed(2)),
    currency: "USD",
    reason: REFUND_REASONS[index % REFUND_REASONS.length],
    status: "PENDING",
    createdAt: new Date(Date.now() - index * 60_000).toISOString(),
  }));
}

export default function Home() {
  const dummyRefunds = createDummyRefunds("agent-1", 10);

  return (
    <main className="home-shell">
      <section className="home-card">
        <HeadingBanner
          title="Refund Queue Workbench"
          description="Bulk-select refund requests, enqueue them via API, and click queued request numbers to process them into the stream."
        />
        <div className="invoice-card-wrap">
          <RefundWorkbench agentId="agent-1" initialRefunds={dummyRefunds} />
        </div>
      </section>
    </main>
  );
}
