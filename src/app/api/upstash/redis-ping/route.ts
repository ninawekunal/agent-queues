import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import { hasRedisConfig, redisClient } from "@/server/upstash/upstashClients";

interface RedisPingResponse {
  key: string;
  writtenAt: string;
  readBack: string | null;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!hasRedisConfig || !redisClient) {
    return jsonError(
      500,
      "UPSTASH_REDIS_NOT_CONFIGURED",
      "Missing UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  try {
    const key = "upstash:redis-ping";
    const writtenAt = new Date().toISOString();

    await redisClient.set(key, writtenAt, { ex: 60 });
    const readBack = await redisClient.get<string>(key);

    const payload: RedisPingResponse = {
      key,
      writtenAt,
      readBack,
    };

    return jsonOk(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Redis error.";
    return jsonError(500, "UPSTASH_REDIS_PING_FAILED", message);
  }
}
