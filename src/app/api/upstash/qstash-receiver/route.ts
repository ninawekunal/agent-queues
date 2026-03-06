import { jsonError, jsonOk } from "@/shared/http/apiResponse";
import { parseJsonWithSchema } from "@/shared/http/contractValidation";
import {
  qstashReceiverInputSchema,
  qstashReceiverResponseSchema,
  type QStashReceiverResponse,
} from "@/shared/contracts/upstash";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const parseResult = await parseJsonWithSchema(request, qstashReceiverInputSchema, {
    invalidJsonCode: "INVALID_JSON_BODY",
    invalidSchemaCode: "INVALID_QSTASH_RECEIVER_INPUT",
  });
  if (!parseResult.ok) {
    return jsonError(400, parseResult.errorCode, parseResult.errorMessage);
  }

  const payload = parseResult.data;

  const response: QStashReceiverResponse = {
    received: true,
    timestamp: new Date().toISOString(),
    payload,
  };

  qstashReceiverResponseSchema.parse(response);

  return jsonOk(response);
}
