import {
  Chip,
  Paper,
  Stack,
  Step,
  StepButton,
  Stepper,
  Typography,
} from "@mui/material";

export interface StreamEvent {
  refundId: string;
  agentId: string;
  status: "PROCESSED";
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
                <StepButton color="inherit" onClick={() => onProcessQueueItem(refundId)}>
                  {getRequestNumber(refundId)}
                </StepButton>
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
            streamEvents.map((event) => (
              <Typography key={`${event.refundId}-${event.processedAt}`} variant="body2">
                {getRequestNumber(event.refundId)} | {event.status} | {event.processedAt}
              </Typography>
            ))
          )}
        </Stack>
      </Paper>
    </section>
  );
}
