"use client";

import { useEffect, useState } from "react";
import { RedisStatusCard } from "@/components/RedisStatusCard";
import { QStashStatusCard } from "@/components/QStashStatusCard";
import type { ApiEnvelope } from "@/shared/types/api";
import type { QStashStatusResponse } from "@/shared/contracts/systemStatus";

interface RedisPingData {
  key: string;
  writtenAt: string;
  readBack: string | null;
}

interface RedisStatusState {
  connected: boolean;
  endpointName: string;
  lastCheckedAt: string;
  detail?: string;
}

interface QStashStatusState {
  connected: boolean;
  destinationUrl: string;
  lastPublishAt: string;
  detail?: string;
}

const INITIAL_TIMESTAMP = "not checked";

export function SystemStatusPanel() {
  const [redisStatus, setRedisStatus] = useState<RedisStatusState>({
    connected: false,
    endpointName: "/api/upstash/redis-ping",
    lastCheckedAt: INITIAL_TIMESTAMP,
    detail: "Checking...",
  });

  const [qstashStatus, setQstashStatus] = useState<QStashStatusState>({
    connected: false,
    destinationUrl: "not configured",
    lastPublishAt: INITIAL_TIMESTAMP,
    detail: "Checking...",
  });

  useEffect(() => {
    async function loadStatuses() {
      const now = new Date().toISOString();

      try {
        const redisResponse = await fetch("/api/upstash/redis-ping", {
          method: "GET",
          cache: "no-store",
        });
        const redisBody = (await redisResponse.json()) as ApiEnvelope<RedisPingData>;

        if (redisBody.ok) {
          setRedisStatus({
            connected: true,
            endpointName: "/api/upstash/redis-ping",
            lastCheckedAt: redisBody.data.writtenAt,
          });
        } else {
          setRedisStatus({
            connected: false,
            endpointName: "/api/upstash/redis-ping",
            lastCheckedAt: now,
            detail: redisBody.error.message,
          });
        }
      } catch (error) {
        setRedisStatus({
          connected: false,
          endpointName: "/api/upstash/redis-ping",
          lastCheckedAt: now,
          detail: error instanceof Error ? error.message : "Unknown Redis status error.",
        });
      }

      try {
        const qstashResponse = await fetch("/api/upstash/qstash-status", {
          method: "GET",
          cache: "no-store",
        });
        const qstashBody = (await qstashResponse.json()) as ApiEnvelope<QStashStatusResponse>;

        if (qstashBody.ok) {
          setQstashStatus({
            connected: qstashBody.data.connected,
            destinationUrl: qstashBody.data.destinationUrl ?? "not configured",
            lastPublishAt: qstashBody.data.checkedAt,
            detail: qstashBody.data.detail,
          });
        } else {
          setQstashStatus({
            connected: false,
            destinationUrl: "not configured",
            lastPublishAt: now,
            detail: qstashBody.error.message,
          });
        }
      } catch (error) {
        setQstashStatus({
          connected: false,
          destinationUrl: "not configured",
          lastPublishAt: now,
          detail: error instanceof Error ? error.message : "Unknown QStash status error.",
        });
      }
    }

    loadStatuses();
  }, []);

  return (
    <section className="status-grid">
      <RedisStatusCard
        connected={redisStatus.connected}
        endpointName={redisStatus.endpointName}
        lastCheckedAt={redisStatus.lastCheckedAt}
        detail={redisStatus.detail}
      />
      <QStashStatusCard
        connected={qstashStatus.connected}
        destinationUrl={qstashStatus.destinationUrl}
        lastPublishAt={qstashStatus.lastPublishAt}
        detail={qstashStatus.detail}
      />
    </section>
  );
}
