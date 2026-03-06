import { z } from "zod";

export const qstashStatusResponseSchema = z.object({
  connected: z.boolean(),
  destinationUrl: z.string().nullable(),
  checkedAt: z.string().datetime(),
  detail: z.string().optional(),
});

export type QStashStatusResponse = z.infer<typeof qstashStatusResponseSchema>;
