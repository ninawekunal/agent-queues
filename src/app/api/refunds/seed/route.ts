import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import { parseJsonWithSchema } from "@/shared/http/contractValidation";
import {
  refundSeedInputSchema,
  refundSeedOutputSchema,
  type RefundRequest,
  type RefundSeedOutput,
} from "@/shared/contracts/refunds";
import { hasRedisConfig, redisClient } from "@/server/upstash/upstashClients";

const HOTEL_NAMES = [
  "Grand Horizon Hotel",
  "Seabreeze Suites",
  "Maple Crown Inn",
  "Aurora Bay Resort",
  "Summit Peak Lodge",
  "Golden Palm Retreat",
  "Riverstone Hotel",
  "Skyline Central",
  "Bluewater Boutique",
  "Evergreen Palace",
];

const REFUND_REASONS = [
  "Duplicate booking charge",
  "Flight cancellation impacted stay",
  "Room unavailable at check-in",
  "Incorrect billing amount",
  "Customer canceled within policy window",
];

export const dynamic = "force-dynamic";

function generateRefund(agentId: string, index: number): RefundRequest {
  const now = new Date();
  const createdAt = new Date(now.getTime() - index * 60_000).toISOString();

  return {
    id: `rr_${agentId}_${index + 1}`,
    agentId,
    hotelName: HOTEL_NAMES[index % HOTEL_NAMES.length],
    bookingReference: `BK${String(100000 + index)}`,
    amount: Number((89 + (index + 1) * 17.35).toFixed(2)),
    currency: "USD",
    reason: REFUND_REASONS[index % REFUND_REASONS.length],
    status: "PENDING",
    createdAt,
  };
}

export async function POST(request: Request): Promise<Response> {
  if (!hasRedisConfig || !redisClient) {
    return jsonError(
      500,
      "UPSTASH_REDIS_NOT_CONFIGURED",
      "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  const parseResult = await parseJsonWithSchema(request, refundSeedInputSchema, {
    invalidJsonCode: "INVALID_JSON_BODY",
    invalidSchemaCode: "INVALID_REFUND_SEED_INPUT",
  });
  if (!parseResult.ok) {
    return jsonError(
      400,
      parseResult.errorCode,
      parseResult.errorMessage,
    );
  }

  const input = parseResult.data;
  const items = Array.from({ length: input.count }, (_, index) =>
    generateRefund(input.agentId, index),
  );

  const key = `refunds:agent:${input.agentId}:pending`;

  try {
    await redisClient.set(key, JSON.stringify(items));

    const payload: RefundSeedOutput = {
      seeded: true,
      key,
      count: items.length,
      items,
    };

    refundSeedOutputSchema.parse(payload);

    return jsonOk(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Redis write error.";

    return jsonError(500, "REFUND_SEED_WRITE_FAILED", message);
  }
}
