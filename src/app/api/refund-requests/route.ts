import { getRefundRequestsRoute } from "@/server/api-routes/refundRequestRoutes";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return getRefundRequestsRoute(request);
}
