import {
  type ProcessedRefund,
  type RefundDashboardResponse,
  type RefundLifecycleStatus,
  type RefundOutcomeStatus,
  type RefundRequest,
  type RefundRequestWithStatus,
} from "@/shared/types/refund";
import { HOTEL_REFUND_SEED_DATA } from "@/server/data-sources/refundSeedData";

interface AgentRefundState {
  requests: RefundRequest[];
  statuses: Map<string, RefundLifecycleStatus>;
  processedSuccess: ProcessedRefund[];
  processedFailed: ProcessedRefund[];
}

class RefundRequestDataSource {
  private readonly statesByAgent = new Map<string, AgentRefundState>();

  private ensureAgentState(agentId: string): AgentRefundState {
    const existing = this.statesByAgent.get(agentId);
    if (existing) {
      return existing;
    }

    const requests: RefundRequest[] = HOTEL_REFUND_SEED_DATA.map((seed) => ({
      ...seed,
      agentId,
    }));

    const statuses = new Map<string, RefundLifecycleStatus>();
    for (const request of requests) {
      statuses.set(request.id, "PENDING");
    }

    const newState: AgentRefundState = {
      requests,
      statuses,
      processedSuccess: [],
      processedFailed: [],
    };

    this.statesByAgent.set(agentId, newState);
    return newState;
  }

  public getStatus(agentId: string, requestId: string): RefundLifecycleStatus | null {
    const state = this.ensureAgentState(agentId);
    return state.statuses.get(requestId) ?? null;
  }

  public setQueueStatus(
    agentId: string,
    requestId: string,
    status: Extract<RefundLifecycleStatus, "PENDING" | "QUEUED" | "PROCESSING">,
  ): boolean {
    const state = this.ensureAgentState(agentId);
    if (!state.statuses.has(requestId)) {
      return false;
    }

    state.statuses.set(requestId, status);
    return true;
  }

  public completeRequest(
    agentId: string,
    requestId: string,
    outcome: RefundOutcomeStatus,
    processorMessage: string,
  ): ProcessedRefund | null {
    const state = this.ensureAgentState(agentId);
    const refundRequest = state.requests.find((request) => request.id === requestId);

    if (!refundRequest) {
      return null;
    }

    state.statuses.set(requestId, outcome);

    const processedRefund: ProcessedRefund = {
      ...refundRequest,
      status: outcome,
      processedAt: new Date().toISOString(),
      processorMessage,
    };

    if (outcome === "SUCCESS") {
      state.processedSuccess = [processedRefund, ...state.processedSuccess];
      return processedRefund;
    }

    state.processedFailed = [processedRefund, ...state.processedFailed];
    return processedRefund;
  }

  public getDashboard(agentId: string): RefundDashboardResponse {
    const state = this.ensureAgentState(agentId);

    const activeRefunds: RefundRequestWithStatus[] = state.requests
      .map((request) => {
        const status = state.statuses.get(request.id);
        if (status === "SUCCESS" || status === "FAILED") {
          return null;
        }

        return {
          ...request,
          status: status ?? "PENDING",
        };
      })
      .filter((request): request is RefundRequestWithStatus => request !== null)
      .sort((left, right) => left.requestedAt.localeCompare(right.requestedAt));

    return {
      agentId,
      activeRefunds,
      successBucket: state.processedSuccess,
      failedBucket: state.processedFailed,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __refundRequestDataSourceSingleton: RefundRequestDataSource | undefined;
}

export const refundRequestDataSource =
  globalThis.__refundRequestDataSourceSingleton ?? new RefundRequestDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__refundRequestDataSourceSingleton = refundRequestDataSource;
}
