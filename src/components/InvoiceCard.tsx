import type { RefundRequest } from "@/shared/contracts/refunds";

interface InvoiceCardProps {
  invoice: RefundRequest;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <article className="invoice-card">
      <header className="invoice-card__header">
        <h2>{invoice.hotelName}</h2>
        <span className={`invoice-card__status invoice-card__status--${invoice.status.toLowerCase()}`}>
          {invoice.status}
        </span>
      </header>

      <section className="invoice-card__details">
        <div className="invoice-card__row">
          <p className="invoice-card__label">Refund ID</p>
          <p className="invoice-card__value">{invoice.id}</p>
        </div>
        <div className="invoice-card__row">
          <p className="invoice-card__label">Booking Ref</p>
          <p className="invoice-card__value">{invoice.bookingReference}</p>
        </div>
        <div className="invoice-card__row">
          <p className="invoice-card__label">Agent</p>
          <p className="invoice-card__value">{invoice.agentId}</p>
        </div>
        <div className="invoice-card__row">
          <p className="invoice-card__label">Amount</p>
          <p className="invoice-card__value">{formatAmount(invoice.amount, invoice.currency)}</p>
        </div>
        <div className="invoice-card__row invoice-card__reason">
          <p className="invoice-card__label">Reason</p>
          <p className="invoice-card__value">{invoice.reason}</p>
        </div>
      </section>
    </article>
  );
}
