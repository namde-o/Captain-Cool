export default function WinProbability({ matchState, impact }) {
  // Simple heuristic for base win probability based on RRR
  // RRR 0 = 100%, RRR 8 = 50%, RRR 16 = 0%
  let baseProb = 50;
  if (matchState && matchState.innings === '2nd' && matchState.target) {
    const currentRuns = parseInt(matchState.currentScore.split('/')[0]) || 0;
    const runsNeeded = matchState.target - currentRuns;
    const ballsBowled = (matchState.over - 1) * 6 + matchState.ball;
    const ballsRemaining = 120 - ballsBowled;
    
    if (ballsRemaining > 0 && runsNeeded > 0) {
      const rrr = (runsNeeded / ballsRemaining) * 6;
      baseProb = 100 - (rrr * 6.25);
      baseProb = Math.max(5, Math.min(95, baseProb));
    } else if (runsNeeded <= 0) {
      baseProb = 100;
    } else {
      baseProb = 0;
    }
  }
  
  const parsedImpact = parseFloat(impact) || 0;
  const finalProb = Math.max(1, Math.min(99, baseProb + parsedImpact));

  const getColor = (val) => {
    if (val < 40) return 'var(--red)';
    if (val < 60) return 'var(--yellow)';
    return 'var(--green)';
  };

  return (
    <div className="win-probability-container">
      <div className="win-probability-title">Win Probability Shift</div>
      <div className="win-probability-bars">
        <div className="prob-bar-group">
          <div className="prob-label">Before Strategy</div>
          <div className="prob-bar-bg">
            <div className="prob-bar-fill" style={{ width: `${baseProb}%`, background: getColor(baseProb) }} />
          </div>
          <div className="prob-val">{Math.round(baseProb)}%</div>
        </div>

        <div className="prob-arrow">→</div>

        <div className="prob-bar-group">
          <div className="prob-label">After Strategy</div>
          <div className="prob-bar-bg">
            <div className="prob-bar-fill" style={{ width: `${finalProb}%`, background: getColor(finalProb) }} />
          </div>
          <div className="prob-val" style={{ color: getColor(finalProb), fontWeight: 'bold' }}>
            {Math.round(finalProb)}%
            <span className="prob-impact">
              {parsedImpact > 0 ? `+${parsedImpact}` : parsedImpact}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
