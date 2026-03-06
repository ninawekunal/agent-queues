import { refundRequestDataSource } from "@/server/data-sources/refundRequestDataSource";
import { streamDataSource } from "@/server/data-sources/streamDataSource";
import type {
  QueueStatusResponse,
  RefundOutcomeStatus,
  QueueEnqueuedEvent,
  QueueProcessingEvent,
  RefundProcessedEvent,
} from "@/shared/types/refund";

interface QueueJob {
  requestId: string;
  enqueuedAt: string;
}

class QueueDataSource {
  private readonly queuedByAgent = new Map<string, QueueJob[]>();
  private readonly processingByAgent = new Map<string, QueueJob | null>();

  public enqueueBulk(agentId: string, requestIds: string[]): {
    accepted: string[];
    rejected: string[];
  } {
    const accepted: string[] = [];
    const rejected: string[] = [];

    const queue = this.queuedByAgent.get(agentId) ?? [];

    for (const requestId of requestIds) {
      const status = refundRequestDataSource.getStatus(agentId, requestId);
      if (status !== "PENDING") {
        rejected.push(requestId);
        continue;
      }

      refundRequestDataSource.setQueueStatus(agentId, requestId, "QUEUED");

      queue.push({
        requestId,
        enqueuedAt: new Date().toISOString(),
      });

      accepted.push(requestId);

      const queueEvent: QueueEnqueuedEvent = {
        type: "QUEUE_ENQUEUED",
        agentId,
        requestId,
        queueDepth: this.getQueueDepth(agentId, queue),
        timestamp: new Date().toISOString(),
      };

      streamDataSource.publish(agentId, queueEvent);
    }

    this.queuedByAgent.set(agentId, queue);
    this.processNext(agentId);

    return {
      accepted,
      rejected,
    };
  }

  public getQueueSnapshot(agentId: string): QueueStatusResponse {
    const queue = this.queuedByAgent.get(agentId) ?? [];
    const processing = this.processingByAgent.get(agentId);

    return {
      agentId,
      queuedRequestIds: queue.map((job) => job.requestId),
      processingRequestId: processing?.requestId ?? null,
      queueDepth: this.getQueueDepth(agentId),
    };
  }

  public getQueueDepth(agentId: string, queueOverride?: QueueJob[]): number {
    const queue = queueOverride ?? this.queuedByAgent.get(agentId) ?? [];
    const processing = this.processingByAgent.get(agentId);
    return queue.length + (processing ? 1 : 0);
  }

  private processNext(agentId: string): void {
    const currentProcessing = this.processingByAgent.get(agentId);
    if (currentProcessing) {
      return;
    }

    const queue = this.queuedByAgent.get(agentId);
    if (!queue || queue.length === 0) {
      return;
    }

    const job = queue.shift();
    if (!job) {
      return;
    }

    this.queuedByAgent.set(agentId, queue);
    this.processingByAgent.set(agentId, job);
    refundRequestDataSource.setQueueStatus(agentId, job.requestId, "PROCESSING");

    const processingEvent: QueueProcessingEvent = {
      type: "QUEUE_PROCESSING",
      agentId,
      requestId: job.requestId,
      queueDepth: this.getQueueDepth(agentId),
      timestamp: new Date().toISOString(),
    };

    streamDataSource.publish(agentId, processingEvent);

    const processingDelayMs = this.simulateDelay(job.requestId);

    setTimeout(() => {
      const result = this.simulateProcessingResult(job.requestId);
      const processorMessage =
        result === "SUCCESS"
          ? "Payment partner accepted the refund transfer."
          : "Issuer timeout occurred while posting the refund.";

      const processedRefund = refundRequestDataSource.completeRequest(
        agentId,
        job.requestId,
        result,
        processorMessage,
      );

      this.processingByAgent.set(agentId, null);

      if (processedRefund) {
        const processedEvent: RefundProcessedEvent = {
          type: "REFUND_PROCESSED",
          agentId,
          requestId: job.requestId,
          result,
          queueDepth: this.getQueueDepth(agentId),
          timestamp: new Date().toISOString(),
          processedRefund,
        };

        streamDataSource.publish(agentId, processedEvent);
      }

      this.processNext(agentId);
    }, processingDelayMs);
  }

  private simulateDelay(requestId: string): number {
    const numericValue = Number(requestId.replace(/\D/g, "")) || 1;
    return 1200 + (numericValue % 5) * 550;
  }

  private simulateProcessingResult(requestId: string): RefundOutcomeStatus {
    const numericValue = Number(requestId.replace(/\D/g, "")) || 1;
    return numericValue % 4 === 0 ? "FAILED" : "SUCCESS";
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __queueDataSourceSingleton: QueueDataSource | undefined;
}

export const queueDataSource = globalThis.__queueDataSourceSingleton ?? new QueueDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__queueDataSourceSingleton = queueDataSource;
}
