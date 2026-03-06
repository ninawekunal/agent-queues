"use client";

import { useEffect, useState } from "react";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import type { ApiEnvelope } from "@/shared/types/api";
import type { RedisPingResponse } from "@/shared/contracts/upstash";
import type { QStashStatusResponse } from "@/shared/contracts/systemStatus";

interface HeadingBannerProps {
  title: string;
  description: string;
}

type ConnectionState = "checking" | "connected" | "disconnected";

function chipColorForState(state: ConnectionState): "default" | "success" | "error" {
  if (state === "connected") {
    return "success";
  }
  if (state === "disconnected") {
    return "error";
  }
  return "default";
}

function chipLabelForState(name: string, state: ConnectionState): string {
  if (state === "connected") {
    return `${name}: Connected`;
  }
  if (state === "disconnected") {
    return `${name}: Disconnected`;
  }
  return `${name}: Checking`;
}

export function HeadingBanner({ title, description }: HeadingBannerProps) {
  const [redisState, setRedisState] = useState<ConnectionState>("checking");
  const [qstashState, setQstashState] = useState<ConnectionState>("checking");

  useEffect(() => {
    async function loadStatuses() {
      try {
        const redisResponse = await fetch("/api/upstash/redis-ping", {
          method: "GET",
          cache: "no-store",
        });
        const redisBody = (await redisResponse.json()) as ApiEnvelope<RedisPingResponse>;
        setRedisState(redisBody.ok ? "connected" : "disconnected");
      } catch {
        setRedisState("disconnected");
      }

      try {
        const qstashResponse = await fetch("/api/upstash/qstash-status", {
          method: "GET",
          cache: "no-store",
        });
        const qstashBody = (await qstashResponse.json()) as ApiEnvelope<QStashStatusResponse>;
        setQstashState(qstashBody.ok && qstashBody.data.connected ? "connected" : "disconnected");
      } catch {
        setQstashState("disconnected");
      }
    }

    loadStatuses();
  }, []);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: { xs: 1.1, sm: 1.5 } }}>
      <Stack spacing={1}>
        <div>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </div>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            color={chipColorForState(redisState)}
            label={chipLabelForState("Redis", redisState)}
          />
          <Chip
            size="small"
            color={chipColorForState(qstashState)}
            label={chipLabelForState("QStash", qstashState)}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
