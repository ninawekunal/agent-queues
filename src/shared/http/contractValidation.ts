import { z } from "zod";

interface ParseOk<T> {
  ok: true;
  data: T;
}

interface ParseErr {
  ok: false;
  errorCode: string;
  errorMessage: string;
}

export type ParseResult<T> = ParseOk<T> | ParseErr;

export async function parseJsonWithSchema<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  options?: {
    invalidJsonCode?: string;
    invalidSchemaCode?: string;
  },
): Promise<ParseResult<z.infer<TSchema>>> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      ok: false,
      errorCode: options?.invalidJsonCode ?? "INVALID_JSON_BODY",
      errorMessage: "Request body must be valid JSON.",
    };
  }

  const parseResult = schema.safeParse(rawBody);
  if (!parseResult.success) {
    return {
      ok: false,
      errorCode: options?.invalidSchemaCode ?? "INVALID_REQUEST_BODY",
      errorMessage: parseResult.error.issues.map((issue) => issue.message).join(" "),
    };
  }

  return {
    ok: true,
    data: parseResult.data,
  };
}
