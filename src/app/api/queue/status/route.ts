import { getQueueStatusRoute } from "@/server/api-routes/queueRoutes";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return getQueueStatusRoute(request);
}
