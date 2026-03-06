import { z } from "zod";

export const versionResponseSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  node: z.string().min(1),
  timestamp: z.string().datetime(),
});

export type VersionResponse = z.infer<typeof versionResponseSchema>;
