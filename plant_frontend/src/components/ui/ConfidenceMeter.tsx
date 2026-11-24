export interface ConfidenceMeterProps {
  value: number;
  label?: string;
}

function toPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value * 100));
}

export function ConfidenceMeter({ value, label }: ConfidenceMeterProps) {
  const percent = toPercent(value);
  const display = `${percent.toFixed(1)}%`;

  return (
    <div
      className="confidence-meter"
      role="progressbar"
      aria-label={label ?? "Prediction confidence"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(percent.toFixed(1))}
      aria-valuetext={display}
    >
      <div className="confidence-meter__meta">
        <span className="confidence-meter__label">{label ?? "CONFIDENCE"}</span>
        <span className="confidence-meter__value">{display}</span>
      </div>
      <div className="confidence-meter__track">
        <div className="confidence-meter__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default ConfidenceMeter;
