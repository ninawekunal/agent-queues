import {
  Box,
  Chip,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { BucketItem } from "@/components/SuccessBucket";

interface FailureBucketProps {
  items: BucketItem[];
}

function formatProcessedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function FailureBucket({ items }: FailureBucketProps) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
        <Typography variant="subtitle1">Failed</Typography>
        <Chip size="small" color="error" label={`${items.length}`} />
      </Stack>
      <List dense sx={{ p: 0 }}>
        {items.length === 0 ? (
          <ListItem disableGutters>
            <Typography variant="body2" color="text.secondary">
              No failed refunds yet.
            </Typography>
          </ListItem>
        ) : (
          items.map((item) => (
            <ListItem key={`${item.refundId}-${item.processedAt}`} disableGutters sx={{ py: 0.4 }}>
              <Box
                sx={{
                  width: "100%",
                  p: 0.9,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "error.light",
                  backgroundColor: "rgba(211, 47, 47, 0.06)",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.refundId}
                  </Typography>
                  <Chip label="FAILED" size="small" color="error" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Processed at {formatProcessedAt(item.processedAt)}
                </Typography>
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
