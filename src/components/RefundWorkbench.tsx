"use client";

import { useState } from "react";
import { Alert, Stack } from "@mui/material";
import { QueueStreamPanel, type StreamEvent } from "@/components/QueueStreamPanel";
import { RefundSelectionTable } from "@/components/RefundSelectionTable";
import type {
  RefundQueueEnqueueOutput,
  RefundRequest,
} from "@/shared/contracts/refunds";
import type { ApiEnvelope } from "@/shared/types/api";

interface RefundWorkbenchProps {
  agentId: string;
  initialRefunds: RefundRequest[];
}

export function RefundWorkbench({ agentId, initialRefunds }: RefundWorkbenchProps) {
  const [tableRefunds, setTableRefunds] = useState<RefundRequest[]>(initialRefunds);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProcessSelected = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      return;
    }

    setIsProcessingSelection(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/refunds/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          refundIds: selectedIds,
        }),
      });

      const body = (await response.json()) as ApiEnvelope<RefundQueueEnqueueOutput>;

      if (!body.ok) {
        setErrorMessage(body.error.message);
        return;
      }

      setQueueIds((prev) => [...prev, ...body.data.queuedIds]);
      setTableRefunds((prev) => prev.filter((refund) => !selectedIds.includes(refund.id)));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown queue enqueue error.",
      );
    } finally {
      setIsProcessingSelection(false);
    }
  };

  const handleProcessQueueItem = (refundId: string) => {
    setQueueIds((prev) => prev.filter((id) => id !== refundId));
    setStreamEvents((prev) => [
      {
        refundId,
        agentId,
        status: "PROCESSED",
        processedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <QueueStreamPanel
        queueIds={queueIds}
        streamEvents={streamEvents}
        onProcessQueueItem={handleProcessQueueItem}
      />

      <RefundSelectionTable
        refunds={tableRefunds}
        processing={isProcessingSelection}
        onProcessSelected={handleProcessSelected}
      />
    </Stack>
  );
}
