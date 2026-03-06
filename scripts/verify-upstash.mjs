import { Client as QStashClient } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function readEnv() {
  return {
    redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    qstashToken: process.env.QSTASH_TOKEN ?? "",
  };
}

function logInfo(message) {
  console.log(`[upstash-check] ${message}`);
}

function logError(message) {
  console.error(`[upstash-check] ${message}`);
}

export async function verifyUpstashConnections(mode = "startup") {
  logInfo(`Starting Upstash verification for mode=${mode}`);

  const env = readEnv();
  const missing = [];

  if (!env.redisUrl) missing.push("UPSTASH_REDIS_REST_URL");
  if (!env.redisToken) missing.push("UPSTASH_REDIS_REST_TOKEN");
  if (!env.qstashToken) missing.push("QSTASH_TOKEN");

  if (missing.length > 0) {
    const msg = `Missing required env vars: ${missing.join(", ")}`;
    logError(msg);
    throw new Error(msg);
  }

  const redis = new Redis({ url: env.redisUrl, token: env.redisToken });
  const qstash = new QStashClient({ token: env.qstashToken });

  const checkKey = "upstash:startup-check";
  const checkValue = new Date().toISOString();

  try {
    await redis.set(checkKey, checkValue, { ex: 30 });
    const readBack = await redis.get(checkKey);

    if (readBack !== checkValue) {
      throw new Error("Redis set/get verification mismatch.");
    }

    logInfo("Redis connection OK (set/get succeeded).");
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Unknown Redis connectivity failure.";
    logError(`Redis connection failed: ${msg}`);
    throw new Error(`Redis connection failed: ${msg}`);
  }

  try {
    await qstash.logs({ filter: { count: 1 } });
    logInfo("QStash connection OK (logs API reachable).");
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : "Unknown QStash connectivity failure.";
    logError(`QStash connection failed: ${msg}`);
    throw new Error(`QStash connection failed: ${msg}`);
  }

  logInfo("Upstash verification passed.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
  const mode = modeArg ? modeArg.replace("--mode=", "") : "startup";

  verifyUpstashConnections(mode)
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}
