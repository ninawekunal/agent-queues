import { jsonOk } from "@/shared/http/apiResponse";
import {
  qstashStatusResponseSchema,
  type QStashStatusResponse,
} from "@/shared/contracts/systemStatus";
import {
  hasQStashConfig,
  qstashClient,
  qstashDestinationUrl,
} from "@/server/upstash/upstashClients";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const checkedAt = new Date().toISOString();

  if (!hasQStashConfig || !qstashClient) {
    const payload: QStashStatusResponse = {
      connected: false,
      destinationUrl: qstashDestinationUrl,
      checkedAt,
      detail: "QSTASH_TOKEN is missing.",
    };
    qstashStatusResponseSchema.parse(payload);
    return jsonOk(payload);
  }

  try {
    await qstashClient.logs({ filter: { count: 1 } });

    const payload: QStashStatusResponse = {
      connected: true,
      destinationUrl: qstashDestinationUrl,
      checkedAt,
    };

    qstashStatusResponseSchema.parse(payload);
    return jsonOk(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown QStash connection error.";

    const payload: QStashStatusResponse = {
      connected: false,
      destinationUrl: qstashDestinationUrl,
      checkedAt,
      detail: message,
    };

    qstashStatusResponseSchema.parse(payload);
    return jsonOk(payload);
  }
}
