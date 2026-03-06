import { streamDataSource } from "@/server/data-sources/streamDataSource";
import type { AgentStreamEvent, StreamConnectedEvent } from "@/shared/types/refund";

function encodeStreamEvent(encoder: TextEncoder, event: AgentStreamEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function openAgentStreamRoute(request: Request, agentId: string): Response {
  const encoder = new TextEncoder();

  let tearDown = (): void => undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: AgentStreamEvent): void => {
        controller.enqueue(encodeStreamEvent(encoder, event));
      };

      const connectedEvent: StreamConnectedEvent = {
        type: "STREAM_CONNECTED",
        agentId,
        timestamp: new Date().toISOString(),
      };

      send(connectedEvent);

      const unsubscribe = streamDataSource.subscribe(agentId, send);
      const keepAliveId = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive ${Date.now()}\n\n`));
      }, 15000);

      const closeStream = (): void => {
        clearInterval(keepAliveId);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // The stream can already be closed; ignore this case.
        }
      };

      tearDown = closeStream;
      request.signal.addEventListener("abort", closeStream);
    },
    cancel() {
      tearDown();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
