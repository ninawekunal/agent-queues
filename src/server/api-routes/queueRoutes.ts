import { queueDataSource } from "@/server/data-sources/queueDataSource";
import { DEFAULT_AGENT_ID } from "@/shared/constants/agents";
import type { QueueStatusResponse } from "@/shared/types/refund";

function jsonResponse<T>(payload: T, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function getQueueStatusRoute(request: Request): Promise<Response> {
  const searchParams = new URL(request.url).searchParams;
  const agentId = searchParams.get("agentId")?.trim() || DEFAULT_AGENT_ID;

  const queueSnapshot: QueueStatusResponse = queueDataSource.getQueueSnapshot(agentId);
  return jsonResponse(queueSnapshot);
}
