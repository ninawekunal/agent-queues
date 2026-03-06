"use client";

import { useState } from "react";
import { Alert, Stack } from "@mui/material";
import { QueueStreamPanel, type StreamEvent } from "@/components/QueueStreamPanel";
import { RefundSelectionTable } from "@/components/RefundSelectionTable";
import { FailureBucket } from "@/components/FailureBucket";
import { SuccessBucket, type BucketItem } from "@/components/SuccessBucket";
import type {
  RefundQueueEnqueueOutput,
  RefundProcessOutput,
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
  const [successItems, setSuccessItems] = useState<BucketItem[]>([]);
  const [failureItems, setFailureItems] = useState<BucketItem[]>([]);
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

  const handleProcessQueueItem = async (refundId: string) => {
    setQueueIds((prev) => prev.filter((id) => id !== refundId));
    setStreamEvents((prev) => [
      {
        refundId,
        agentId,
        status: "PROCESSING",
        processedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    try {
      const response = await fetch("/api/refunds/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId,
          refundId,
        }),
      });

      const body = (await response.json()) as ApiEnvelope<RefundProcessOutput>;

      if (!body.ok) {
        setErrorMessage(body.error.message);
        setStreamEvents((prev) =>
          prev.map((event) =>
            event.refundId === refundId ? { ...event, status: "FAILED" } : event,
          ),
        );
        return;
      }

      const nextStatus = body.data.status;
      const processedAt = body.data.processedAt;

      setStreamEvents((prev) =>
        prev.map((event) =>
          event.refundId === refundId
            ? { ...event, status: nextStatus, processedAt }
            : event,
        ),
      );

      // Keep the item visible in stream briefly, then move it to final bucket.
      window.setTimeout(() => {
        setStreamEvents((prev) => prev.filter((event) => event.refundId !== refundId));

        if (nextStatus === "SUCCESS") {
          setSuccessItems((prev) => [{ refundId, processedAt }, ...prev]);
        } else {
          setFailureItems((prev) => [{ refundId, processedAt }, ...prev]);
        }
      }, 2200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown refund processing error.",
      );
      setStreamEvents((prev) =>
        prev.map((event) =>
          event.refundId === refundId ? { ...event, status: "FAILED" } : event,
        ),
      );
    }
  };

  return (
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <QueueStreamPanel
        queueIds={queueIds}
        streamEvents={streamEvents}
        onProcessQueueItem={handleProcessQueueItem}
      />
      <section className="bucket-grid" aria-label="Success and failure buckets">
        <SuccessBucket items={successItems} />
        <FailureBucket items={failureItems} />
      </section>

      <RefundSelectionTable
        refunds={tableRefunds}
        processing={isProcessingSelection}
        onProcessSelected={handleProcessSelected}
      />
    </Stack>
  );
}
