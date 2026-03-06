import type { ApiEnvelope } from "@/shared/types/api";

interface JsonResponseOptions {
  status?: number;
  cacheControl?: string;
  headers?: HeadersInit;
}

const DEFAULT_NO_STORE = "no-store";

function buildHeaders(options?: JsonResponseOptions): HeadersInit {
  const headers = new Headers(options?.headers);

  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", options?.cacheControl ?? DEFAULT_NO_STORE);
  }

  return headers;
}

export function jsonOk<TData>(
  data: TData,
  options?: JsonResponseOptions,
): Response {
  const body: ApiEnvelope<TData> = {
    ok: true,
    data,
  };

  return Response.json(body, {
    status: options?.status ?? 200,
    headers: buildHeaders(options),
  });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  options?: Omit<JsonResponseOptions, "status">,
): Response {
  const body: ApiEnvelope<never> = {
    ok: false,
    error: {
      code,
      message,
    },
  };

  return Response.json(body, {
    status,
    headers: buildHeaders(options),
  });
}
