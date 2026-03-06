import { jsonOk } from "@/shared/http/apiResponse";

interface QStashReceiverResponse {
  received: true;
  timestamp: string;
  payload: unknown;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown = null;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const response: QStashReceiverResponse = {
    received: true,
    timestamp: new Date().toISOString(),
    payload,
  };

  return jsonOk(response);
}
