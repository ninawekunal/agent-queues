"use client";

import { useEffect, useRef, useState } from "react";
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
  const [blinkingQueueIds, setBlinkingQueueIds] = useState<string[]>([]);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [successItems, setSuccessItems] = useState<BucketItem[]>([]);
  const [failureItems, setFailureItems] = useState<BucketItem[]>([]);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scheduledTimersRef = useRef<Map<string, number>>(new Map());
  const processingIdsRef = useRef<Set<string>>(new Set());
  const queueSectionRef = useRef<HTMLDivElement | null>(null);
  const previousQueueLengthRef = useRef<number>(0);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

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
    if (processingIdsRef.current.has(refundId)) {
      return;
    }

    processingIdsRef.current.add(refundId);
    const timerId = scheduledTimersRef.current.get(refundId);
    if (timerId) {
      window.clearTimeout(timerId);
      scheduledTimersRef.current.delete(refundId);
    }

    setBlinkingQueueIds((prev) => [...prev, refundId]);
    await delay(600);
    setBlinkingQueueIds((prev) => prev.filter((id) => id !== refundId));
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
        processingIdsRef.current.delete(refundId);
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
        processingIdsRef.current.delete(refundId);
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
      processingIdsRef.current.delete(refundId);
    }
  };

  useEffect(() => {
    const previousLength = previousQueueLengthRef.current;
    const nextLength = queueIds.length;
    previousQueueLengthRef.current = nextLength;

    if (nextLength <= previousLength) {
      return;
    }

    if (!window.matchMedia("(max-width: 600px)").matches) {
      return;
    }

    queueSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    queueSectionRef.current?.focus({ preventScroll: true });
  }, [queueIds]);

  useEffect(() => {
    for (const refundId of queueIds) {
      if (scheduledTimersRef.current.has(refundId) || processingIdsRef.current.has(refundId)) {
        continue;
      }

      const timeoutId = window.setTimeout(() => {
        scheduledTimersRef.current.delete(refundId);
        void handleProcessQueueItem(refundId);
      }, 1000);

      scheduledTimersRef.current.set(refundId, timeoutId);
    }

    return () => {
      for (const [refundId, timeoutId] of scheduledTimersRef.current) {
        if (!queueIds.includes(refundId)) {
          window.clearTimeout(timeoutId);
          scheduledTimersRef.current.delete(refundId);
        }
      }
    };
  }, [queueIds]);

  useEffect(() => {
    return () => {
      for (const timeoutId of scheduledTimersRef.current.values()) {
        window.clearTimeout(timeoutId);
      }
      scheduledTimersRef.current.clear();
    };
  }, []);

  return (
    <Stack spacing={2}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <div ref={queueSectionRef} tabIndex={-1}>
        <QueueStreamPanel
          queueIds={queueIds}
          streamEvents={streamEvents}
          onProcessQueueItem={handleProcessQueueItem}
          blinkingQueueIds={blinkingQueueIds}
        />
      </div>
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
