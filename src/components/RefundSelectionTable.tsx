"use client";

import { useMemo, useState } from "react";
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
} from "@mui/material";
import type { RefundRequest } from "@/shared/contracts/refunds";

interface RefundSelectionTableProps {
  refunds: RefundRequest[];
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function RefundSelectionTable({ refunds }: RefundSelectionTableProps) {
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

  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">
          {selectedCount} selected / {refunds.length} total
        </Typography>
        <Button variant="contained" size="small" disabled={selectedCount === 0}>
          Process Selected
        </Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
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
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.map((refund) => {
              const isSelected = selectedIds.has(refund.id);
              return (
                <TableRow key={refund.id} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleOne(refund.id)}
                      inputProps={{ "aria-label": `select ${refund.id}` }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {refund.hotelName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {refund.id} | {refund.bookingReference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatAmount(refund.amount, refund.currency)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={refund.status} size="small" color="warning" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {refund.reason}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
