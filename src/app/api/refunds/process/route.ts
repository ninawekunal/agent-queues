import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import { parseJsonWithSchema } from "@/shared/http/contractValidation";
import {
  refundProcessInputSchema,
  refundProcessOutputSchema,
  type RefundProcessOutput,
} from "@/shared/contracts/refunds";
import { hasRedisConfig, redisClient } from "@/server/upstash/upstashClients";

export const dynamic = "force-dynamic";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function pickOutcome(refundId: string): "SUCCESS" | "FAILED" {
  const numericTail = Number(refundId.match(/(\d+)$/)?.[1] ?? "1");
  return numericTail % 2 === 0 ? "SUCCESS" : "FAILED";
}

export async function POST(request: Request): Promise<Response> {
  if (!hasRedisConfig || !redisClient) {
    return jsonError(
      500,
      "UPSTASH_REDIS_NOT_CONFIGURED",
      "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  const parseResult = await parseJsonWithSchema(request, refundProcessInputSchema, {
    invalidJsonCode: "INVALID_JSON_BODY",
    invalidSchemaCode: "INVALID_REFUND_PROCESS_INPUT",
  });

  if (!parseResult.ok) {
    return jsonError(400, parseResult.errorCode, parseResult.errorMessage);
  }

  const input = parseResult.data;
  const queueKey = `refunds:agent:${input.agentId}:queue`;

  try {
    await redisClient.lrem(queueKey, 1, input.refundId);

    // Backend processing simulation delay.
    await delay(1800);

    const payload: RefundProcessOutput = {
      processed: true,
      refundId: input.refundId,
      agentId: input.agentId,
      status: pickOutcome(input.refundId),
      processedAt: new Date().toISOString(),
    };

    refundProcessOutputSchema.parse(payload);

    return jsonOk(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown refund processing error.";
    return jsonError(500, "REFUND_PROCESS_FAILED", message);
  }
}
