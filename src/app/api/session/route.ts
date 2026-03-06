import { cookies } from "next/headers";
import {
  DEFAULT_AGENT_ID,
  SESSION_COOKIE_NAME,
  isKnownAgentId,
} from "@/shared/constants/agents";

interface SessionRequestBody {
  agentId?: string;
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function POST(request: Request): Promise<Response> {
  let body: SessionRequestBody | null = null;

  try {
    body = (await request.json()) as SessionRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const requestedAgentId = body?.agentId?.trim() ?? DEFAULT_AGENT_ID;

  if (!isKnownAgentId(requestedAgentId)) {
    return Response.json({ error: "Unknown agent id." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, requestedAgentId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  return Response.json({ agentId: requestedAgentId }, { status: 200 });
}

export async function DELETE(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true }, { status: 200 });
}
