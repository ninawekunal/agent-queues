import { queueDataSource } from "@/server/data-sources/queueDataSource";
import { refundRequestDataSource } from "@/server/data-sources/refundRequestDataSource";
import { DEFAULT_AGENT_ID } from "@/shared/constants/agents";
import type {
  ApiErrorResponse,
  BulkProcessRequestBody,
  BulkProcessResponse,
  RefundDashboardResponse,
} from "@/shared/types/refund";

function jsonResponse<T>(payload: T, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  const payload: ApiErrorResponse = { error: message };
  return jsonResponse(payload, status);
}

function resolveAgentId(request: Request): string {
  const searchParams = new URL(request.url).searchParams;
  const agentId = searchParams.get("agentId")?.trim();
  return agentId && agentId.length > 0 ? agentId : DEFAULT_AGENT_ID;
}

export async function getRefundRequestsRoute(request: Request): Promise<Response> {
  const agentId = resolveAgentId(request);
  const dashboard: RefundDashboardResponse = refundRequestDataSource.getDashboard(agentId);
  return jsonResponse(dashboard);
}

export async function processBulkRefundRequestsRoute(request: Request): Promise<Response> {
  let body: BulkProcessRequestBody | null = null;

  try {
    body = (await request.json()) as BulkProcessRequestBody;
  } catch {
    return errorResponse("Invalid JSON body.");
  }

  const agentId = body?.agentId?.trim();
  const requestIds = Array.isArray(body?.requestIds)
    ? body.requestIds.filter((requestId): requestId is string => typeof requestId === "string")
    : [];

  if (!agentId) {
    return errorResponse("agentId is required.");
  }

  if (requestIds.length === 0) {
    return errorResponse("requestIds must contain at least one refund request id.");
  }

  const enqueueResult = queueDataSource.enqueueBulk(agentId, requestIds);

  const responsePayload: BulkProcessResponse = {
    agentId,
    enqueuedRequestIds: enqueueResult.accepted,
    rejectedRequestIds: enqueueResult.rejected,
    queueDepth: queueDataSource.getQueueDepth(agentId),
  };

  return jsonResponse(responsePayload);
}
