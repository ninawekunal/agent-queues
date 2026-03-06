import { RefundRequestCardComponent } from "@/client/components/RefundRequestCardComponent";
import type { RefundRequestWithStatus } from "@/shared/types/refund";

interface RefundRequestTableProps {
  refundRequests: RefundRequestWithStatus[];
  selectedRequestIds: string[];
  pendingSelectableCount: number;
  isSubmitting: boolean;
  onToggleSelection: (requestId: string) => void;
  onToggleSelectAllPending: () => void;
  onSubmitSelected: () => Promise<void>;
}

export function RefundRequestTable({
  refundRequests,
  selectedRequestIds,
  pendingSelectableCount,
  isSubmitting,
  onToggleSelection,
  onToggleSelectAllPending,
  onSubmitSelected,
}: RefundRequestTableProps) {
  const allPendingSelected =
    pendingSelectableCount > 0 &&
    refundRequests
      .filter((refund) => refund.status === "PENDING")
      .every((refund) => selectedRequestIds.includes(refund.id));

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Refund Request Cards</h2>
          <p>10 hotel refunds loaded as selectable queue items.</p>
        </div>

        <div className="panel-actions">
          <button
            type="button"
            onClick={onToggleSelectAllPending}
            disabled={pendingSelectableCount === 0}
          >
            {allPendingSelected ? "Clear Pending Selection" : "Select All Pending"}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              void onSubmitSelected();
            }}
            disabled={selectedRequestIds.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : `Bulk Queue (${selectedRequestIds.length})`}
          </button>
        </div>
      </div>

      {refundRequests.length === 0 ? (
        <p className="empty-state">No active refund cards remain in the table.</p>
      ) : (
        <div className="refund-grid">
          {refundRequests.map((refundRequest) => (
            <RefundRequestCardComponent
              key={refundRequest.id}
              refundRequest={refundRequest}
              selected={selectedRequestIds.includes(refundRequest.id)}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      )}
    </section>
  );
}
