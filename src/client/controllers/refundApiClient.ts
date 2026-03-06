import { REST_ROUTE_NAMES } from "@/shared/routes/restRouteNames";
import type {
  BulkProcessResponse,
  QueueStatusResponse,
  RefundDashboardResponse,
} from "@/shared/types/refund";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Unexpected server error.";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep fallback message when JSON body is unavailable.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const refundApiClient = {
  async getDashboard(agentId: string): Promise<RefundDashboardResponse> {
    const url = `${REST_ROUTE_NAMES.REFUND_REQUESTS}?agentId=${encodeURIComponent(agentId)}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    return parseJsonResponse<RefundDashboardResponse>(response);
  },

  async getQueueStatus(agentId: string): Promise<QueueStatusResponse> {
    const url = `${REST_ROUTE_NAMES.QUEUE_STATUS}?agentId=${encodeURIComponent(agentId)}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    return parseJsonResponse<QueueStatusResponse>(response);
  },

  async processBulk(agentId: string, requestIds: string[]): Promise<BulkProcessResponse> {
    const response = await fetch(REST_ROUTE_NAMES.PROCESS_BULK_REFUNDS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId,
        requestIds,
      }),
    });

    return parseJsonResponse<BulkProcessResponse>(response);
  },
};
