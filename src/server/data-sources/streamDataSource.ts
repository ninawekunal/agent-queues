import type { AgentStreamEvent } from "@/shared/types/refund";

type StreamListener = (event: AgentStreamEvent) => void;

class StreamDataSource {
  private readonly listenersByAgent = new Map<string, Set<StreamListener>>();

  public subscribe(agentId: string, listener: StreamListener): () => void {
    const listeners = this.listenersByAgent.get(agentId) ?? new Set<StreamListener>();
    listeners.add(listener);
    this.listenersByAgent.set(agentId, listeners);

    return () => {
      const currentListeners = this.listenersByAgent.get(agentId);
      if (!currentListeners) {
        return;
      }

      currentListeners.delete(listener);
      if (currentListeners.size === 0) {
        this.listenersByAgent.delete(agentId);
      }
    };
  }

  public publish(agentId: string, event: AgentStreamEvent): void {
    const listeners = this.listenersByAgent.get(agentId);
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __streamDataSourceSingleton: StreamDataSource | undefined;
}

export const streamDataSource = globalThis.__streamDataSourceSingleton ?? new StreamDataSource();

if (process.env.NODE_ENV !== "production") {
  globalThis.__streamDataSourceSingleton = streamDataSource;
}
