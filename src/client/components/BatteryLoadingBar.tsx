interface BatteryLoadingBarProps {
  progress: number;
}

export function BatteryLoadingBar({ progress }: BatteryLoadingBarProps) {
  return (
    <div className="battery-loader" role="status" aria-live="polite">
      <p>Bootstrapping refund cards from backend...</p>
      <div className="battery-shell" aria-label="Initial loading progress">
        <div
          className="battery-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <span>{Math.round(progress)}%</span>
    </div>
  );
}
