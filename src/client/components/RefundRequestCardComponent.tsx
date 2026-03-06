import type { RefundRequestWithStatus } from "@/shared/types/refund";

interface RefundRequestCardComponentProps {
  refundRequest: RefundRequestWithStatus;
  selected: boolean;
  onToggleSelection: (requestId: string) => void;
}

function formatAmount(amountUsd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountUsd);
}

export function RefundRequestCardComponent({
  refundRequest,
  selected,
  onToggleSelection,
}: RefundRequestCardComponentProps) {
  const selectable = refundRequest.status === "PENDING";

  return (
    <article className={`refund-card ${selected ? "selected" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={selected}
          disabled={!selectable}
          onChange={() => onToggleSelection(refundRequest.id)}
        />
        Select
      </label>

      <div className="refund-card-header">
        <h3>{refundRequest.hotelName}</h3>
        <span className={`status-chip status-${refundRequest.status.toLowerCase()}`}>
          {refundRequest.status}
        </span>
      </div>

      <dl>
        <div>
          <dt>Request ID</dt>
          <dd>{refundRequest.id}</dd>
        </div>
        <div>
          <dt>Guest</dt>
          <dd>{refundRequest.guestName}</dd>
        </div>
        <div>
          <dt>Booking</dt>
          <dd>{refundRequest.bookingId}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>{formatAmount(refundRequest.amountUsd)}</dd>
        </div>
      </dl>

      <p className="reason">{refundRequest.reason}</p>
    </article>
  );
}
