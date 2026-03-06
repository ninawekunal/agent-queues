import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

interface RedisStatusCardProps {
  connected: boolean;
  endpointName: string;
  lastCheckedAt: string;
  detail?: string;
}

export function RedisStatusCard({
  connected,
  endpointName,
  lastCheckedAt,
  detail,
}: RedisStatusCardProps) {
  const stateLabel = connected ? "CONNECTED" : "DISCONNECTED";
  const chipColor = connected ? "success" : "error";

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }} aria-label="Redis status">
      <CardContent>
        <Typography variant="h6">Redis Status</Typography>
        <Stack spacing={0.8} sx={{ mt: 0.8 }}>
          <Chip label={stateLabel} color={chipColor} size="small" sx={{ width: "fit-content" }} />
          <div>
            <Typography variant="caption" color="text.secondary">
              Endpoint
            </Typography>
            <Typography variant="body2">{endpointName}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Last Checked
            </Typography>
            <Typography variant="body2">{lastCheckedAt}</Typography>
          </div>
          {detail ? (
            <div>
              <Typography variant="caption" color="text.secondary">
                Detail
              </Typography>
              <Typography variant="body2">{detail}</Typography>
            </div>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
