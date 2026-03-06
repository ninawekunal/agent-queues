interface HeadingBannerProps {
  agentId: string;
  agentDisplayName: string;
  activeCount: number;
  queueDepth: number;
  successCount: number;
  failedCount: number;
  selectedCount: number;
  streamStatus: "connecting" | "connected" | "disconnected";
  onSwitchAgent: () => void;
  isSwitchingAgent: boolean;
}

export function HeadingBanner({
  agentId,
  agentDisplayName,
  activeCount,
  queueDepth,
  successCount,
  failedCount,
  selectedCount,
  streamStatus,
  onSwitchAgent,
  isSwitchingAgent,
}: HeadingBannerProps) {
  return (
    <header className="heading-banner">
      <div className="heading-copy">
        <p className="eyebrow">Queue + Stream Demo</p>
        <h1>Hotel Refund Processing Console</h1>
        <p>
          Signed in as <strong>{agentDisplayName}</strong> ({agentId}), subscribed to a partitioned backend stream.
        </p>
      </div>

      <div className="banner-metrics">
        <div className="metric-card">
          <span>Active Cards</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="metric-card">
          <span>Queue Depth</span>
          <strong>{queueDepth}</strong>
        </div>
        <div className="metric-card">
          <span>Selected</span>
          <strong>{selectedCount}</strong>
        </div>
        <div className="metric-card">
          <span>Success</span>
          <strong>{successCount}</strong>
        </div>
        <div className="metric-card">
          <span>Failed</span>
          <strong>{failedCount}</strong>
        </div>
      </div>

      <div className="banner-session-actions">
        <button type="button" onClick={onSwitchAgent} disabled={isSwitchingAgent}>
          {isSwitchingAgent ? "Switching..." : "Switch Agent"}
        </button>
      </div>

      <p className={`stream-pill stream-${streamStatus}`}>
        Stream: {streamStatus === "connected" ? "Connected" : streamStatus === "connecting" ? "Connecting" : "Reconnecting"}
      </p>
    </header>
  );
}
