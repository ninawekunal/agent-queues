import { jsonOk } from "@/shared/http/apiResponse";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@/shared/contracts/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const payload: HealthResponse = {
    service: "agent-queues",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  };

  healthResponseSchema.parse(payload);

  return jsonOk(payload);
}
