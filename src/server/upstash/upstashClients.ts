import { Client as QStashClient } from "@upstash/qstash";
import { Redis } from "@upstash/redis";

interface UpstashConfig {
  redisUrl: string | null;
  redisToken: string | null;
  qstashToken: string | null;
  qstashDestinationUrl: string | null;
}

function readConfig(): UpstashConfig {
  return {
    redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? null,
    redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? null,
    qstashToken: process.env.QSTASH_TOKEN ?? null,
    qstashDestinationUrl: process.env.QSTASH_DESTINATION_URL ?? null,
  };
}

const config = readConfig();

export const hasRedisConfig = Boolean(config.redisUrl && config.redisToken);
export const hasQStashConfig = Boolean(config.qstashToken);

export const redisClient = hasRedisConfig ? Redis.fromEnv() : null;
export const qstashClient = hasQStashConfig
  ? new QStashClient({ token: config.qstashToken! })
  : null;

export const qstashDestinationUrl = config.qstashDestinationUrl;
