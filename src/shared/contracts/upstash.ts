import { z } from "zod";

export const redisPingResponseSchema = z.object({
  key: z.string().min(1),
  writtenAt: z.string().datetime(),
  readBack: z.string().nullable(),
});

export const qstashReceiverInputSchema = z.unknown();

export const qstashReceiverResponseSchema = z.object({
  received: z.literal(true),
  timestamp: z.string().datetime(),
  payload: z.unknown(),
});

export type RedisPingResponse = z.infer<typeof redisPingResponseSchema>;
export type QStashReceiverInput = z.infer<typeof qstashReceiverInputSchema>;
export type QStashReceiverResponse = z.infer<typeof qstashReceiverResponseSchema>;
