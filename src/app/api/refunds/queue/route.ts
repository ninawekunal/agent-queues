import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import { parseJsonWithSchema } from "@/shared/http/contractValidation";
import {
  refundQueueEnqueueInputSchema,
  refundQueueEnqueueOutputSchema,
  type RefundQueueEnqueueOutput,
} from "@/shared/contracts/refunds";
import { hasRedisConfig, redisClient } from "@/server/upstash/upstashClients";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!hasRedisConfig || !redisClient) {
    return jsonError(
      500,
      "UPSTASH_REDIS_NOT_CONFIGURED",
      "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  const parseResult = await parseJsonWithSchema(request, refundQueueEnqueueInputSchema, {
    invalidJsonCode: "INVALID_JSON_BODY",
    invalidSchemaCode: "INVALID_REFUND_QUEUE_INPUT",
  });

  if (!parseResult.ok) {
    return jsonError(400, parseResult.errorCode, parseResult.errorMessage);
  }

  const input = parseResult.data;
  const queueKey = `refunds:agent:${input.agentId}:queue`;

  try {
    await redisClient.rpush(queueKey, ...input.refundIds);
    const depthRaw = await redisClient.llen(queueKey);
    const queueDepth = Number(depthRaw ?? 0);

    const payload: RefundQueueEnqueueOutput = {
      queued: true,
      queueKey,
      queuedIds: input.refundIds,
      queueDepth,
    };

    refundQueueEnqueueOutputSchema.parse(payload);

    return jsonOk(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown queue enqueue error.";
    return jsonError(500, "REFUND_QUEUE_ENQUEUE_FAILED", message);
  }
}
