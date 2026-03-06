import {
  Chip,
  Paper,
  Stack,
  Step,
  StepButton,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";

export interface StreamEvent {
  refundId: string;
  agentId: string;
  status: "PROCESSING" | "SUCCESS" | "FAILED";
  processedAt: string;
}

interface QueueStreamPanelProps {
  queueIds: string[];
  streamEvents: StreamEvent[];
  onProcessQueueItem: (refundId: string) => void;
}

function getRequestNumber(refundId: string): string {
  const match = refundId.match(/(\d+)$/);
  return match ? `#${match[1]}` : refundId;
}

export function QueueStreamPanel({
  queueIds,
  streamEvents,
  onProcessQueueItem,
}: QueueStreamPanelProps) {
  const streamColor = (status: StreamEvent["status"]): "default" | "info" | "success" | "error" => {
    if (status === "SUCCESS") {
      return "success";
    }
    if (status === "FAILED") {
      return "error";
    }
    if (status === "PROCESSING") {
      return "info";
    }
    return "default";
  };

  return (
    <section className="queue-stream-grid" aria-label="Queue and stream data">
      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
          <Typography variant="subtitle1">Queue</Typography>
          <Chip size="small" color="info" label={`${queueIds.length} queued`} />
        </Stack>

        {queueIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Queue is empty.
          </Typography>
        ) : (
          <Stepper alternativeLabel nonLinear activeStep={-1}>
            {queueIds.map((refundId) => (
              <Step key={refundId} completed={false}>
                <Tooltip title={`refund_id: ${refundId}`}>
                  <StepButton
                    color="inherit"
                    onClick={() => onProcessQueueItem(refundId)}
                    sx={{
                      borderRadius: 1.25,
                      transition: "all 150ms ease",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.12)",
                        color: "primary.main",
                      },
                    }}
                  >
                    {getRequestNumber(refundId)}
                  </StepButton>
                </Tooltip>
              </Step>
            ))}
          </Stepper>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
          <Typography variant="subtitle1">Stream</Typography>
          <Chip size="small" color="secondary" label={`${streamEvents.length} events`} />
        </Stack>

        <Stack spacing={0.5}>
          {streamEvents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No processed stream events yet.
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap">
              {streamEvents.map((event) => (
                <Tooltip key={`${event.refundId}-${event.processedAt}`} title={`refund_id: ${event.refundId}`}>
                  <Chip
                    size="small"
                    color={streamColor(event.status)}
                    label={`${getRequestNumber(event.refundId)} • ${event.status}`}
                    sx={{
                      transition: "all 150ms ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: 1,
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>
    </section>
  );
}
