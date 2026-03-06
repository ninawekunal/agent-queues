export type RefundQueueStatus = "PENDING" | "QUEUED" | "PROCESSING";
export type RefundOutcomeStatus = "SUCCESS" | "FAILED";
export type RefundLifecycleStatus = RefundQueueStatus | RefundOutcomeStatus;

export interface RefundRequest {
  id: string;
  agentId: string;
  hotelName: string;
  bookingId: string;
  guestName: string;
  amountUsd: number;
  reason: string;
  requestedAt: string;
}

export interface RefundRequestWithStatus extends RefundRequest {
  status: RefundQueueStatus;
}

export interface ProcessedRefund extends RefundRequest {
  status: RefundOutcomeStatus;
  processedAt: string;
  processorMessage: string;
}

export interface RefundDashboardResponse {
  agentId: string;
  activeRefunds: RefundRequestWithStatus[];
  successBucket: ProcessedRefund[];
  failedBucket: ProcessedRefund[];
}

export interface BulkProcessRequestBody {
  agentId: string;
  requestIds: string[];
}

export interface BulkProcessResponse {
  agentId: string;
  enqueuedRequestIds: string[];
  rejectedRequestIds: string[];
  queueDepth: number;
}

export interface QueueStatusResponse {
  agentId: string;
  queuedRequestIds: string[];
  processingRequestId: string | null;
  queueDepth: number;
}

export interface ApiErrorResponse {
  error: string;
}

interface StreamEventBase {
  type: string;
  agentId: string;
  timestamp: string;
}

export interface StreamConnectedEvent extends StreamEventBase {
  type: "STREAM_CONNECTED";
}

export interface QueueEnqueuedEvent extends StreamEventBase {
  type: "QUEUE_ENQUEUED";
  requestId: string;
  queueDepth: number;
}

export interface QueueProcessingEvent extends StreamEventBase {
  type: "QUEUE_PROCESSING";
  requestId: string;
  queueDepth: number;
}

export interface RefundProcessedEvent extends StreamEventBase {
  type: "REFUND_PROCESSED";
  requestId: string;
  result: RefundOutcomeStatus;
  queueDepth: number;
  processedRefund: ProcessedRefund;
}

export type AgentStreamEvent =
  | StreamConnectedEvent
  | QueueEnqueuedEvent
  | QueueProcessingEvent
  | RefundProcessedEvent;
