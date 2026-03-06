import { InvoiceCard } from "@/components/InvoiceCard";
import type { RefundRequest } from "@/shared/contracts/refunds";

export default function Home() {
  const sampleInvoice: RefundRequest = {
    id: "rr_agent-1_1",
    agentId: "agent-1",
    hotelName: "Grand Horizon Hotel",
    bookingReference: "BK100001",
    amount: 129.99,
    currency: "USD",
    reason: "Duplicate booking charge",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  return (
    <main className="home-shell">
      <section className="home-card">
        <p className="eyebrow">Step 1</p>
        <h1>Invoice Card Component</h1>
        <p>
          First component setup for refund invoice display (single card, no grid yet).
        </p>
        <div className="invoice-card-wrap">
          <InvoiceCard invoice={sampleInvoice} />
        </div>
      </section>
    </main>
  );
}
