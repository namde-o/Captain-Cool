import ConfidenceMeter from './ConfidenceMeter';

export default function AgentCard({ config, text, isLoading, isComplete, isPending, isHarsha, isBumrah, parsedData, error, onRetry }) {
  const borderStyle = isHarsha
    ? { borderColor: config.color, boxShadow: `0 0 20px ${config.color}33`, '--glow-color': config.color }
    : isBumrah
    ? { borderColor: `${config.color}66`, '--glow-color': config.color }
    : { '--glow-color': config.color };

  const cardClass = `agent-card ${!isPending ? 'agent-card-enter' : ''} ${isLoading ? 'agent-card-loading-glow' : ''} ${isHarsha ? 'harsha-card' : ''} ${isBumrah ? 'bumrah-card' : ''}`;

  return (
    <div className={cardClass} style={borderStyle}>
      <div className="agent-card-header">
        <div className="agent-avatar" style={{ background: config.colorLight, color: config.color }}>
          {config.avatar}
        </div>
        <div className="agent-info">
          <div className="agent-name" style={{ color: config.color }}>{config.name}</div>
          <div className="agent-role">{config.role}</div>
        </div>
        {isHarsha && isComplete && (
          <div className="captains-call-badge">🏆 Captain&apos;s Call</div>
        )}
        {isPending && (
          <div className="agent-status" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
            <span className="pulsing-dot" /> Pending...
          </div>
        )}
        {isLoading && !isPending && (
          <div className="agent-status" style={{ background: config.colorLight, color: config.color }}>
            <span className="spinner-dot" /> Analyzing...
          </div>
        )}
        {isComplete && !isLoading && !isPending && !error && (
          <div className="agent-status" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }}>
            <span className="checkmark-spring">✓</span> Complete
          </div>
        )}
        {error && (
          <div className="agent-status" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>
            ⚠️ Error
          </div>
        )}
      </div>
      <div className="agent-card-body">
        {error ? (
          <div style={{ color: 'var(--red)' }}>
            <p>{error}</p>
            {onRetry && (
              <button onClick={onRetry} style={{ marginTop: 8, padding: '4px 12px', background: 'var(--red)', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                Retry
              </button>
            )}
          </div>
        ) : (isLoading || isPending) && !text ? (
          <>
            <div className="skeleton" style={{ width: '90%' }} />
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        ) : (
          <>
            {text}
            {isLoading && <span className="typing-cursor" style={{ color: config.color }} />}
          </>
        )}
      </div>
      {isHarsha && isComplete && parsedData?.confidenceScore != null && (
        <ConfidenceMeter score={parsedData.confidenceScore} />
      )}
    </div>
  );
}
