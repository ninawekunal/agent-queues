export const REST_ROUTE_NAMES = {
  REFUND_REQUESTS: "/api/refund-requests",
  PROCESS_BULK_REFUNDS: "/api/refund-requests/process",
  QUEUE_STATUS: "/api/queue/status",
  AGENT_STREAM: (agentId: string) => `/api/stream/${encodeURIComponent(agentId)}`,
} as const;
