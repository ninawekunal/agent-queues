"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { RefundRequest } from "@/shared/contracts/refunds";

interface RefundSelectionTableProps {
  refunds: RefundRequest[];
  processing?: boolean;
  onProcessSelected: (selectedIds: string[]) => void;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function RefundSelectionTable({
  refunds,
  processing = false,
  onProcessSelected,
}: RefundSelectionTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => refunds.map((refund) => refund.id), [refunds]);
  const selectedCount = selectedIds.size;
  const allSelected = refunds.length > 0 && selectedCount === refunds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(allIds));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (allIds.includes(id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [allIds]);

  const handleProcessSelected = () => {
    if (selectedIds.size === 0) {
      return;
    }

    onProcessSelected(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <Stack spacing={1}>
      <Stack
        direction={isMobile ? "column" : "row"}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="subtitle2">
          {selectedCount} selected / {refunds.length} total
        </Typography>
        <Button
          variant="contained"
          size="small"
          disabled={selectedCount === 0 || processing}
          onClick={handleProcessSelected}
          sx={isMobile ? { width: "100%" } : undefined}
        >
          Process Selected
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table size="small" aria-label="Refund request selection table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  inputProps={{ "aria-label": "select all refund requests" }}
                />
              </TableCell>
              <TableCell>Request</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>Amount</TableCell>
              {!isMobile ? <TableCell>Status</TableCell> : null}
              {!isMobile ? <TableCell>Reason</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.map((refund) => {
              const isSelected = selectedIds.has(refund.id);
              return (
                <TableRow key={refund.id} hover selected={isSelected} sx={isMobile ? { height: 58 } : undefined}>
                  <TableCell padding="checkbox" sx={isMobile ? { py: 0.5, px: 1 } : undefined}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleOne(refund.id)}
                      inputProps={{ "aria-label": `select ${refund.id}` }}
                    />
                  </TableCell>
                  <TableCell sx={isMobile ? { py: 0.5, px: 1 } : undefined}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {refund.hotelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {refund.id} | {refund.bookingReference}
                    </Typography>
                  </TableCell>
                  <TableCell sx={isMobile ? { py: 0.5, px: 1 } : undefined}>
                    <Typography variant="body2">{formatAmount(refund.amount, refund.currency)}</Typography>
                  </TableCell>
                  {!isMobile ? (
                    <TableCell>
                      <Chip label={refund.status} size="small" color="warning" />
                    </TableCell>
                  ) : null}
                  {!isMobile ? (
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {refund.reason}
                      </Typography>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
