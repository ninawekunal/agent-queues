import { processBulkRefundRequestsRoute } from "@/server/api-routes/refundRequestRoutes";

export async function POST(request: Request): Promise<Response> {
  return processBulkRefundRequestsRoute(request);
}
