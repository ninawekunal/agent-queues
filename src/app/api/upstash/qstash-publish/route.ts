import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import {
  qstashPublishInputSchema,
  qstashPublishOutputSchema,
  type QStashPublishOutput,
} from "@/shared/contracts/qstash";
import {
  hasQStashConfig,
  qstashClient,
  qstashDestinationUrl,
} from "@/server/upstash/upstashClients";

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

  let rawBody: unknown = null;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON_BODY", "Request body must be valid JSON.");
  }

  const parseResult = qstashPublishInputSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return jsonError(
      400,
      "INVALID_QSTASH_PUBLISH_INPUT",
      parseResult.error.issues.map((issue) => issue.message).join(" "),
    );
  }

  const input = parseResult.data;

  try {
    const result = await qstashClient.publishJSON({
      url: qstashDestinationUrl,
      body: {
        source: "api/upstash/qstash-publish",
        timestamp: new Date().toISOString(),
        payload: input,
      },
    });

    const messageId =
      result && typeof result === "object" && "messageId" in result
        ? (result.messageId as string)
        : null;

    if (!messageId) {
      return jsonError(
        500,
        "QSTASH_PUBLISH_INVALID_RESPONSE",
        "QStash publish did not return a messageId.",
      );
    }

    const payload: QStashPublishOutput = {
      queued: true,
      destinationUrl: qstashDestinationUrl,
      messageId,
    };

    qstashPublishOutputSchema.parse(payload);

    return jsonOk(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown QStash error.";
    return jsonError(500, "QSTASH_PUBLISH_FAILED", message);
  }
}
