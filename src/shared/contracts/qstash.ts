import { z } from "zod";

export const qstashPublishInputSchema = z
  .object({
    agentId: z.string().min(1, "agentId is required."),
    refundRequestId: z.string().min(1, "refundRequestId is required."),
    amount: z.number().nonnegative("amount must be >= 0."),
    currency: z.string().min(3).max(3).default("USD"),
  })
  .strict();

export const qstashPublishOutputSchema = z.object({
  queued: z.literal(true),
  destinationUrl: z.string().url(),
  messageId: z.string().min(1),
});

export type QStashPublishInput = z.infer<typeof qstashPublishInputSchema>;
export type QStashPublishOutput = z.infer<typeof qstashPublishOutputSchema>;
