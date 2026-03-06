import { jsonOk } from "@/shared/http/apiResponse";

interface HealthResponseData {
  service: string;
  environment: string;
  timestamp: string;
}

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const payload: HealthResponseData = {
    service: "agent-queues",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  };

  return jsonOk(payload);
}
