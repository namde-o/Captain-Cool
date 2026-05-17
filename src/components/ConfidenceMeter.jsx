export default function ConfidenceMeter({ score }) {
  const clamp = Math.max(0, Math.min(100, score || 0));
  const getColor = (v) => {
    if (v < 35) return 'var(--red)';
    if (v < 65) return 'var(--yellow)';
    return 'var(--green)';
  };
  return (
    <div className="confidence-meter">
      <div className="confidence-label">Confidence Score</div>
      <div className="confidence-bar-bg">
        <div
          className="confidence-bar-fill"
          style={{ width: `${clamp}%`, background: getColor(clamp) }}
        />
      </div>
      <div className="confidence-value" style={{ color: getColor(clamp) }}>{clamp}%</div>
    </div>
  );
}
