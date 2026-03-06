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
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.2,
        p: { xs: 1.15, sm: 1.6 },
        borderColor: "rgba(25, 118, 210, 0.25)",
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.09) 0%, rgba(255,255,255,0.96) 35%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Stack spacing={1.1}>
        <div>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              letterSpacing: "0.09em",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            REFUND OPERATIONS
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mt: 0.45,
              fontSize: "clamp(1.12rem, 2.3vw, 1.62rem)",
              lineHeight: 1.18,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.55,
              fontSize: "clamp(0.86rem, 1.55vw, 0.98rem)",
              lineHeight: 1.45,
              maxWidth: 880,
            }}
          >
            {description}
          </Typography>
        </div>
        <Stack direction="row" spacing={0.85} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            color={chipColorForState(redisState)}
            label={chipLabelForState("Redis", redisState)}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            size="small"
            color={chipColorForState(qstashState)}
            label={chipLabelForState("QStash", qstashState)}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
