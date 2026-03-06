"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BatteryLoadingBar } from "@/client/components/BatteryLoadingBar";
import { HeadingBanner } from "@/client/components/HeadingBanner";
import { QueueSimulationComponent } from "@/client/components/QueueSimulationComponent";
import { RefundRequestTable } from "@/client/components/RefundRequestTable";
import { StatusBucket } from "@/client/components/StatusBucket";
import { useAgentSessionController } from "@/client/controllers/useAgentSessionController";
import { useRefundQueueController } from "@/client/controllers/useRefundQueueController";

interface RefundQueueViewProps {
  agentId: string;
  agentDisplayName: string;
}

export function RefundQueueView({ agentId, agentDisplayName }: RefundQueueViewProps) {
  const router = useRouter();
  const [switchAgentError, setSwitchAgentError] = useState<string | null>(null);
  const { clearSession, isSubmitting: isSessionSubmitting } = useAgentSessionController();
  const {
    isInitialLoading,
    loadingProgress,
    activeRefunds,
    selectedRequestIds,
    queuedRequestIds,
    processingRequestId,
    successBucket,
    failedBucket,
    queueTimeline,
    streamStatus,
    isBulkSubmitting,
    errorMessage,
    selectionCount,
    pendingSelectableCount,
    toggleRequestSelection,
    toggleSelectAllPending,
    submitSelectedRefunds,
  } = useRefundQueueController(agentId);

  const queueDepth = queuedRequestIds.length + (processingRequestId ? 1 : 0);

  const switchAgentSession = async (): Promise<void> => {
    setSwitchAgentError(null);

    try {
      await clearSession();
      router.push("/login");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to switch agent.";
      setSwitchAgentError(message);
    }
  };

  return (
    <main className="page-shell">
      <HeadingBanner
        agentId={agentId}
        agentDisplayName={agentDisplayName}
        activeCount={activeRefunds.length}
        queueDepth={queueDepth}
        successCount={successBucket.length}
        failedCount={failedBucket.length}
        selectedCount={selectionCount}
        streamStatus={streamStatus}
        onSwitchAgent={() => {
          void switchAgentSession();
        }}
        isSwitchingAgent={isSessionSubmitting}
      />

      {isInitialLoading ? (
        <section className="panel loading-panel">
          <BatteryLoadingBar progress={loadingProgress} />
        </section>
      ) : null}

      {errorMessage || switchAgentError ? (
        <section className="panel error-panel">
          <p>{errorMessage ?? switchAgentError}</p>
        </section>
      ) : null}

      <RefundRequestTable
        refundRequests={activeRefunds}
        selectedRequestIds={selectedRequestIds}
        pendingSelectableCount={pendingSelectableCount}
        isSubmitting={isBulkSubmitting}
        onToggleSelection={toggleRequestSelection}
        onToggleSelectAllPending={toggleSelectAllPending}
        onSubmitSelected={submitSelectedRefunds}
      />

      <QueueSimulationComponent
        queuedRequestIds={queuedRequestIds}
        processingRequestId={processingRequestId}
        queueTimeline={queueTimeline}
      />

      <section className="bucket-grid">
        <StatusBucket
          title="Successfully Processed"
          status="SUCCESS"
          refunds={successBucket}
        />
        <StatusBucket title="Failed" status="FAILED" refunds={failedBucket} />
      </section>
    </main>
  );
}
