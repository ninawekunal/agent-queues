import type { ProcessedRefund, RefundOutcomeStatus } from "@/shared/types/refund";

interface StatusBucketProps {
  title: string;
  status: RefundOutcomeStatus;
  refunds: ProcessedRefund[];
}

function formatAmount(amountUsd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountUsd);
}

export function StatusBucket({ title, status, refunds }: StatusBucketProps) {
  return (
    <section className="panel status-bucket">
      <div className="panel-header">
        <h2>{title}</h2>
        <span className={`status-chip status-${status.toLowerCase()}`}>{refunds.length}</span>
      </div>

      {refunds.length === 0 ? (
        <p className="empty-state">No refunds in this bucket yet.</p>
      ) : (
        <ul>
          {refunds.map((refund) => (
            <li key={`${refund.id}-${refund.processedAt}`}>
              <div>
                <strong>{refund.id}</strong>
                <p>{refund.hotelName}</p>
              </div>
              <div>
                <strong>{formatAmount(refund.amountUsd)}</strong>
                <p>{refund.processorMessage}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
