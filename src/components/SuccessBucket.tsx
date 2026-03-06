import {
  Box,
  Chip,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

export interface BucketItem {
  refundId: string;
  processedAt: string;
}

interface SuccessBucketProps {
  items: BucketItem[];
}

function formatProcessedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function SuccessBucket({ items }: SuccessBucketProps) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
        <Typography variant="subtitle1">Successfully Processed</Typography>
        <Chip size="small" color="success" label={`${items.length}`} />
      </Stack>
      <List dense sx={{ p: 0 }}>
        {items.length === 0 ? (
          <ListItem disableGutters>
            <Typography variant="body2" color="text.secondary">
              No successful refunds yet.
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
                  borderColor: "success.light",
                  backgroundColor: "rgba(46, 125, 50, 0.06)",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {item.refundId}
                  </Typography>
                  <Chip label="SUCCESS" size="small" color="success" />
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
