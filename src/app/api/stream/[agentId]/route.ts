import { openAgentStreamRoute } from "@/server/api-routes/streamRoutes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface StreamRouteContext {
  params: Promise<{
    agentId: string;
  }>;
}

export async function GET(request: Request, context: StreamRouteContext): Promise<Response> {
  const params = await context.params;
  const agentId = params.agentId?.trim();

  if (!agentId) {
    return Response.json({ error: "agentId is required." }, { status: 400 });
  }

  return openAgentStreamRoute(request, agentId);
}
