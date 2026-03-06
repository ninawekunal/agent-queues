"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { refundApiClient } from "@/client/controllers/refundApiClient";
import { REST_ROUTE_NAMES } from "@/shared/routes/restRouteNames";
import type {
  AgentStreamEvent,
  ProcessedRefund,
  RefundRequestWithStatus,
} from "@/shared/types/refund";

type StreamStatus = "connecting" | "connected" | "disconnected";

function renderClock(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export interface RefundQueueControllerState {
  isInitialLoading: boolean;
  loadingProgress: number;
  activeRefunds: RefundRequestWithStatus[];
  selectedRequestIds: string[];
  queuedRequestIds: string[];
  processingRequestId: string | null;
  successBucket: ProcessedRefund[];
  failedBucket: ProcessedRefund[];
  queueTimeline: string[];
  streamStatus: StreamStatus;
  isBulkSubmitting: boolean;
  errorMessage: string | null;
  selectionCount: number;
  pendingSelectableCount: number;
  toggleRequestSelection: (requestId: string) => void;
  toggleSelectAllPending: () => void;
  submitSelectedRefunds: () => Promise<void>;
}

export function useRefundQueueController(agentId: string): RefundQueueControllerState {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(3);
  const [activeRefunds, setActiveRefunds] = useState<RefundRequestWithStatus[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [queuedRequestIds, setQueuedRequestIds] = useState<string[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [successBucket, setSuccessBucket] = useState<ProcessedRefund[]>([]);
  const [failedBucket, setFailedBucket] = useState<ProcessedRefund[]>([]);
  const [queueTimeline, setQueueTimeline] = useState<string[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("connecting");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeRefundIdsRef = useRef<Set<string>>(new Set());

  const appendQueueTimeline = useCallback((message: string): void => {
    setQueueTimeline((currentTimeline) => [message, ...currentTimeline].slice(0, 18));
  }, []);

  const applyStreamEvent = useCallback(
    (event: AgentStreamEvent): void => {
      if (event.type === "STREAM_CONNECTED") {
        appendQueueTimeline(`${renderClock(event.timestamp)} stream subscribed for ${event.agentId}`);
        return;
      }

      if (event.type === "QUEUE_ENQUEUED") {
        setQueuedRequestIds((currentIds) =>
          currentIds.includes(event.requestId) ? currentIds : [...currentIds, event.requestId],
        );

        setActiveRefunds((currentRefunds) =>
          currentRefunds.map((refund) =>
            refund.id === event.requestId ? { ...refund, status: "QUEUED" } : refund,
          ),
        );

        appendQueueTimeline(
          `${renderClock(event.timestamp)} ${event.requestId} entered queue (depth ${event.queueDepth})`,
        );
        return;
      }

      if (event.type === "QUEUE_PROCESSING") {
        setProcessingRequestId(event.requestId);
        setQueuedRequestIds((currentIds) =>
          currentIds.filter((requestId) => requestId !== event.requestId),
        );

        setActiveRefunds((currentRefunds) =>
          currentRefunds.map((refund) =>
            refund.id === event.requestId ? { ...refund, status: "PROCESSING" } : refund,
          ),
        );

        appendQueueTimeline(
          `${renderClock(event.timestamp)} worker picked ${event.requestId} (depth ${event.queueDepth})`,
        );
        return;
      }

      setActiveRefunds((currentRefunds) =>
        currentRefunds.filter((refund) => refund.id !== event.requestId),
      );

      setSelectedRequestIds((currentIds) =>
        currentIds.filter((requestId) => requestId !== event.requestId),
      );

      setQueuedRequestIds((currentIds) =>
        currentIds.filter((requestId) => requestId !== event.requestId),
      );

      setProcessingRequestId((currentId) => (currentId === event.requestId ? null : currentId));

      if (event.result === "SUCCESS") {
        setSuccessBucket((currentBucket) => [event.processedRefund, ...currentBucket]);
      } else {
        setFailedBucket((currentBucket) => [event.processedRefund, ...currentBucket]);
      }

      appendQueueTimeline(
        `${renderClock(event.timestamp)} ${event.requestId} ${event.result.toLowerCase()} (${event.processedRefund.processorMessage})`,
      );
    },
    [appendQueueTimeline],
  );

  useEffect(() => {
    let cancelled = false;

    const progressTimer = window.setInterval(() => {
      setLoadingProgress((currentProgress) => {
        if (currentProgress >= 90) {
          return currentProgress;
        }

        return Math.min(currentProgress + Math.floor(Math.random() * 8) + 2, 90);
      });
    }, 170);

    const loadData = async (): Promise<void> => {
      setErrorMessage(null);
      setIsInitialLoading(true);
      setStreamStatus("connecting");

      try {
        const [dashboard, queueStatus] = await Promise.all([
          refundApiClient.getDashboard(agentId),
          refundApiClient.getQueueStatus(agentId),
        ]);

        if (cancelled) {
          return;
        }

        setActiveRefunds(dashboard.activeRefunds);
        setSuccessBucket(dashboard.successBucket);
        setFailedBucket(dashboard.failedBucket);
        setQueuedRequestIds(queueStatus.queuedRequestIds);
        setProcessingRequestId(queueStatus.processingRequestId);
        setQueueTimeline([]);
        setSelectedRequestIds([]);

        activeRefundIdsRef.current = new Set(dashboard.activeRefunds.map((refund) => refund.id));
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load dashboard.";
        setErrorMessage(message);
      } finally {
        if (cancelled) {
          return;
        }

        setLoadingProgress(100);
        window.setTimeout(() => {
          if (!cancelled) {
            setIsInitialLoading(false);
          }
        }, 320);
        window.clearInterval(progressTimer);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
    };
  }, [agentId]);

  useEffect(() => {
    activeRefundIdsRef.current = new Set(activeRefunds.map((refund) => refund.id));
  }, [activeRefunds]);

  useEffect(() => {
    if (isInitialLoading) {
      return;
    }

    const streamUrl = REST_ROUTE_NAMES.AGENT_STREAM(agentId);
    const eventSource = new EventSource(streamUrl);

    eventSource.onopen = () => {
      setStreamStatus("connected");
    };

    eventSource.onmessage = (messageEvent): void => {
      try {
        const streamEvent = JSON.parse(messageEvent.data) as AgentStreamEvent;
        applyStreamEvent(streamEvent);
      } catch {
        appendQueueTimeline(`${renderClock(new Date().toISOString())} malformed stream event dropped`);
      }
    };

    eventSource.onerror = () => {
      setStreamStatus("disconnected");
    };

    return () => {
      setStreamStatus("disconnected");
      eventSource.close();
    };
  }, [agentId, appendQueueTimeline, applyStreamEvent, isInitialLoading]);

  const pendingSelectableCount = useMemo(
    () => activeRefunds.filter((refund) => refund.status === "PENDING").length,
    [activeRefunds],
  );

  const toggleRequestSelection = useCallback(
    (requestId: string): void => {
      const targetRefund = activeRefunds.find((refund) => refund.id === requestId);
      if (!targetRefund || targetRefund.status !== "PENDING") {
        return;
      }

      setSelectedRequestIds((currentIds) =>
        currentIds.includes(requestId)
          ? currentIds.filter((currentId) => currentId !== requestId)
          : [...currentIds, requestId],
      );
    },
    [activeRefunds],
  );

  const toggleSelectAllPending = useCallback((): void => {
    const pendingIds = activeRefunds
      .filter((refund) => refund.status === "PENDING")
      .map((refund) => refund.id);

    if (pendingIds.length === 0) {
      return;
    }

    setSelectedRequestIds((currentIds) => {
      const currentlyAllSelected = pendingIds.every((pendingId) => currentIds.includes(pendingId));
      if (currentlyAllSelected) {
        return currentIds.filter((currentId) => !pendingIds.includes(currentId));
      }

      return Array.from(new Set([...currentIds, ...pendingIds]));
    });
  }, [activeRefunds]);

  const submitSelectedRefunds = useCallback(async (): Promise<void> => {
    const pendingSelection = selectedRequestIds.filter((requestId) => activeRefundIdsRef.current.has(requestId));

    if (pendingSelection.length === 0) {
      return;
    }

    setErrorMessage(null);
    setIsBulkSubmitting(true);

    try {
      const response = await refundApiClient.processBulk(agentId, pendingSelection);

      if (response.enqueuedRequestIds.length > 0) {
        setActiveRefunds((currentRefunds) =>
          currentRefunds.map((refund) =>
            response.enqueuedRequestIds.includes(refund.id)
              ? {
                  ...refund,
                  status: "QUEUED",
                }
              : refund,
          ),
        );

        setQueuedRequestIds((currentIds) =>
          Array.from(new Set([...currentIds, ...response.enqueuedRequestIds])),
        );
      }

      setSelectedRequestIds((currentIds) =>
        currentIds.filter((requestId) => !response.enqueuedRequestIds.includes(requestId)),
      );

      appendQueueTimeline(
        `${renderClock(new Date().toISOString())} dispatched ${response.enqueuedRequestIds.length} card(s) to queue`,
      );

      if (response.rejectedRequestIds.length > 0) {
        appendQueueTimeline(
          `${renderClock(new Date().toISOString())} skipped ${response.rejectedRequestIds.length} already-active card(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to queue requests.";
      setErrorMessage(message);
    } finally {
      setIsBulkSubmitting(false);
    }
  }, [agentId, appendQueueTimeline, selectedRequestIds]);

  return {
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
    selectionCount: selectedRequestIds.length,
    pendingSelectableCount,
    toggleRequestSelection,
    toggleSelectAllPending,
    submitSelectedRefunds,
  };
}
