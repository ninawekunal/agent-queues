import type { RefundRequest } from "@/shared/contracts/refunds";
import { Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";

interface InvoiceCardProps {
  invoice: RefundRequest;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const chipColor =
    invoice.status === "SUCCESS"
      ? "success"
      : invoice.status === "FAILED"
        ? "error"
        : invoice.status === "PROCESSING"
          ? "info"
          : "warning";

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="h6">{invoice.hotelName}</Typography>
          <Chip label={invoice.status} color={chipColor} size="small" />
        </Stack>

        <Grid container spacing={1.2} sx={{ mt: 0.8 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Refund ID
            </Typography>
            <Typography variant="body2">{invoice.id}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Booking Ref
            </Typography>
            <Typography variant="body2">{invoice.bookingReference}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Agent
            </Typography>
            <Typography variant="body2">{invoice.agentId}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body2">{formatAmount(invoice.amount, invoice.currency)}</Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" color="text.secondary">
              Reason
            </Typography>
            <Typography variant="body2">{invoice.reason}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
