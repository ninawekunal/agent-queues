import { z } from "zod";

export const refundStatusSchema = z.enum(["PENDING", "PROCESSING", "SUCCESS", "FAILED"]);

export const refundRequestSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
  hotelName: z.string().min(1),
  bookingReference: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  reason: z.string().min(1),
  status: refundStatusSchema,
  createdAt: z.string().datetime(),
});

export const refundSeedInputSchema = z
  .object({
    agentId: z.string().min(1).default("agent-1"),
    count: z.number().int().min(1).max(50).default(10),
  })
  .strict();

export const refundSeedOutputSchema = z.object({
  seeded: z.literal(true),
  key: z.string().min(1),
  count: z.number().int().min(1),
  items: z.array(refundRequestSchema),
});

export const refundQueueEnqueueInputSchema = z
  .object({
    agentId: z.string().min(1),
    refundIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const refundQueueEnqueueOutputSchema = z.object({
  queued: z.literal(true),
  queueKey: z.string().min(1),
  queuedIds: z.array(z.string().min(1)),
  queueDepth: z.number().int().nonnegative(),
});

export const refundProcessInputSchema = z
  .object({
    agentId: z.string().min(1),
    refundId: z.string().min(1),
  })
  .strict();

export const refundProcessOutcomeSchema = z.enum(["SUCCESS", "FAILED"]);

export const refundProcessOutputSchema = z.object({
  processed: z.literal(true),
  refundId: z.string().min(1),
  agentId: z.string().min(1),
  status: refundProcessOutcomeSchema,
  processedAt: z.string().datetime(),
});

export type RefundRequest = z.infer<typeof refundRequestSchema>;
export type RefundSeedInput = z.infer<typeof refundSeedInputSchema>;
export type RefundSeedOutput = z.infer<typeof refundSeedOutputSchema>;
export type RefundQueueEnqueueInput = z.infer<typeof refundQueueEnqueueInputSchema>;
export type RefundQueueEnqueueOutput = z.infer<typeof refundQueueEnqueueOutputSchema>;
export type RefundProcessInput = z.infer<typeof refundProcessInputSchema>;
export type RefundProcessOutput = z.infer<typeof refundProcessOutputSchema>;
