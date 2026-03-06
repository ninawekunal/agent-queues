import {
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { BucketItem } from "@/components/SuccessBucket";

interface FailureBucketProps {
  items: BucketItem[];
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
            <ListItemText primary="No failed refunds yet." />
          </ListItem>
        ) : (
          items.map((item) => (
            <ListItem key={`${item.refundId}-${item.processedAt}`} disableGutters sx={{ py: 0.35 }}>
              <ListItemText
                primary={<Typography variant="body2">{item.refundId}</Typography>}
                secondary={item.processedAt}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
