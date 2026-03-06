interface QueueSimulationComponentProps {
  queuedRequestIds: string[];
  processingRequestId: string | null;
  queueTimeline: string[];
}

export function QueueSimulationComponent({
  queuedRequestIds,
  processingRequestId,
  queueTimeline,
}: QueueSimulationComponentProps) {
  return (
    <section className="panel queue-panel">
      <div className="panel-header">
        <div>
          <h2>Queue Simulation</h2>
          <p>Live server events show enqueue, consume, and completion transitions.</p>
        </div>
      </div>

      <div className="queue-rows">
        <div className="queue-column">
          <h3>Queued Messages</h3>
          {queuedRequestIds.length === 0 ? (
            <p className="empty-state">Queue is currently empty.</p>
          ) : (
            <ul>
              {queuedRequestIds.map((requestId) => (
                <li key={requestId}>{requestId}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="queue-column worker-column">
          <h3>Backend Worker</h3>
          {processingRequestId ? (
            <p>
              Processing <strong>{processingRequestId}</strong>
            </p>
          ) : (
            <p className="empty-state">Worker is idle.</p>
          )}
        </div>

        <div className="queue-column">
          <h3>Queue Event Log</h3>
          {queueTimeline.length === 0 ? (
            <p className="empty-state">Stream log will appear here.</p>
          ) : (
            <ul>
              {queueTimeline.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
