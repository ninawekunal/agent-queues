import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import {
  hasQStashConfig,
  qstashClient,
  qstashDestinationUrl,
} from "@/server/upstash/upstashClients";

interface QStashPublishResponse {
  queued: true;
  destinationUrl: string;
  result: unknown;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!hasQStashConfig || !qstashClient) {
    return jsonError(500, "QSTASH_NOT_CONFIGURED", "Missing QSTASH_TOKEN.");
  }

  if (!qstashDestinationUrl) {
    return jsonError(
      500,
      "QSTASH_DESTINATION_NOT_CONFIGURED",
      "Missing QSTASH_DESTINATION_URL.",
    );
  }

  let userPayload: unknown = null;
  try {
    userPayload = await request.json();
  } catch {
    userPayload = null;
  }

  try {
    const result = await qstashClient.publishJSON({
      url: qstashDestinationUrl,
      body: {
        source: "api/upstash/qstash-publish",
        timestamp: new Date().toISOString(),
        payload: userPayload,
      },
    });

    const payload: QStashPublishResponse = {
      queued: true,
      destinationUrl: qstashDestinationUrl,
      result,
    };

    return jsonOk(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown QStash error.";
    return jsonError(500, "QSTASH_PUBLISH_FAILED", message);
  }
}
