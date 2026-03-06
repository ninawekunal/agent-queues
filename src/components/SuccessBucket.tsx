import {
  Chip,
  List,
  ListItem,
  ListItemText,
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
            <ListItemText primary="No successful refunds yet." />
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
