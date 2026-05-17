import { useMemo, useState, useEffect, useRef } from 'react';

function getPhase(over) {
  if (over <= 6) return 'Powerplay';
  if (over <= 15) return 'Middle';
  return 'Death';
}

function parseScore(scoreStr) {
  if (!scoreStr) return 0;
  const parts = scoreStr.split('/');
  return parseInt(parts[0]) || 0;
}

function RollingNumber({ value }) {
  const prevRef = useRef(value);
  const [rolling, setRolling] = useState(false);
  const [displayPrev, setDisplayPrev] = useState(value);
  const [displayNext, setDisplayNext] = useState(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setDisplayPrev(prevRef.current);
      setDisplayNext(value);
      setRolling(true);
      prevRef.current = value;
      const timer = setTimeout(() => setRolling(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  if (!rolling) {
    return <span>{value}</span>;
  }

  return (
    <span className="rolling-number-container" style={{ display: 'inline-flex', flexDirection: 'column', height: '1em', overflow: 'hidden', position: 'relative' }}>
      <span className="rolling-old" style={{ position: 'absolute', top: 0 }}>{displayPrev}</span>
      <span className="rolling-new">{displayNext}</span>
    </span>
  );
}

export default function LiveScoreHeader({ matchState, isEmpty, isLive, onConnectLive, onDisconnectLive, isConnecting }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [liveQuery, setLiveQuery] = useState('');

  const { battingTeam, bowlingTeam, currentScore, over, ball, innings, target, dataSource, fetchedAt } = matchState || {};

  const { rrr, rrrColor, needText } = useMemo(() => {
    if (isEmpty || innings !== '2nd' || !target) {
      return { rrr: null, rrrColor: '', needText: '' };
    }
    const currentRuns = parseScore(currentScore);
    const runsNeeded = target - currentRuns;
    // Calculate balls remaining (total 120)
    const ballsBowled = (over - 1) * 6 + ball;
    const ballsRemaining = 120 - ballsBowled;
    
    if (ballsRemaining <= 0 || runsNeeded <= 0) {
      return { rrr: 0, rrrColor: 'var(--green)', needText: runsNeeded <= 0 ? 'Target Reached' : 'Innings Over' };
    }

    const calculatedRrr = (runsNeeded / ballsRemaining) * 6;
    let color = 'var(--green)';
    if (calculatedRrr > 12) color = 'var(--red)';
    else if (calculatedRrr >= 8) color = 'var(--yellow)';

    return { 
      rrr: calculatedRrr.toFixed(2), 
      rrrColor: color, 
      needText: `Need ${runsNeeded} off ${ballsRemaining}` 
    };
  }, [innings, target, currentScore, over, ball, isEmpty]);

  if (isEmpty) {
    return (
      <div className="live-score-header">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '1.2rem', animation: 'livePulse 2s infinite' }}>🔍</span>
          <span style={{ fontStyle: 'italic' }}>Search a live match to see the scoreboard</span>
        </div>
        <div className="live-connect-container" style={{ position: 'relative' }}>
          <button 
            className="btn-connect-live" 
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            📡 Connect Live Score
          </button>
          {isPopoverOpen && (
            <div className="live-popover" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--surface-dark)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, zIndex: 100, width: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>🔍 Search Match:</div>
              <input 
                type="text" 
                value={liveQuery} 
                onChange={e => setLiveQuery(e.target.value)} 
                placeholder="e.g. MI vs CSK live score IPL 2025"
                style={{ width: '100%', padding: '6px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 4, marginBottom: 8 }}
                onKeyDown={e => e.key === 'Enter' && liveQuery.trim() && (onConnectLive(liveQuery.trim()), setIsPopoverOpen(false))}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setIsPopoverOpen(false)} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { if (liveQuery.trim()) { onConnectLive(liveQuery.trim()); setIsPopoverOpen(false); } }} disabled={isConnecting} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'var(--gold)', border: 'none', color: 'black', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                  {isConnecting ? '...' : 'Connect'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const phase = getPhase(over);
  const phaseColorClass = phase === 'Powerplay' ? 'phase-powerplay' : phase === 'Middle' ? 'phase-middle' : 'phase-death';

  const teamAbbreviations = {
    'Mumbai Indians': 'MI',
    'Chennai Super Kings': 'CSK',
    'Royal Challengers Bengaluru': 'RCB',
    'Kolkata Knight Riders': 'KKR',
    'Delhi Capitals': 'DC',
    'Rajasthan Royals': 'RR',
    'Sunrisers Hyderabad': 'SRH',
    'Punjab Kings': 'PBKS',
    'Gujarat Titans': 'GT',
    'Lucknow Super Giants': 'LSG'
  };

  const batAbbr = teamAbbreviations[battingTeam] || (battingTeam ? battingTeam.substring(0, 3).toUpperCase() : 'BAT');
  const bowlAbbr = teamAbbreviations[bowlingTeam] || (bowlingTeam ? bowlingTeam.substring(0, 3).toUpperCase() : 'BWL');

  const handleConnect = () => {
    if (liveQuery.trim()) {
      onConnectLive(liveQuery.trim());
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className={`live-score-header ${isLive ? 'is-live' : ''}`}>
      <div className="score-main">
        <span className="team-bat">{batAbbr}</span>
        <span className="score-val">
          {isLive ? <RollingNumber value={currentScore || 0} /> : currentScore}
        </span>
        <span className="over-val">
          ({isLive ? <RollingNumber value={over - 1} /> : over - 1}.{isLive ? <RollingNumber value={ball} /> : ball})
        </span>
      </div>
      
      <div className="score-balls">
        {[1, 2, 3, 4, 5, 6].map(b => (
          <div key={b} className={`ball-indicator ${b <= ball ? 'filled' : ''}`} />
        ))}
      </div>

      <div className="score-vs">
        <span className="vs-line"></span>
        <span className="vs-text">VS</span>
        <span className="vs-line"></span>
      </div>

      <div className="score-bowl">
        <span className="team-bowl">{bowlAbbr}</span>
        <span className="bowl-text">bowling</span>
      </div>

      {innings === '2nd' && target && (
        <div className="score-chase">
          <div className="need-text">{needText}</div>
          <div className="rrr-badge" style={{ color: rrrColor, borderColor: rrrColor }}>
            RRR: {rrr}
          </div>
        </div>
      )}

      <div className="score-phase" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span className={`phase-badge ${phaseColorClass}`}>{phase}</span>
        
        {isLive && dataSource && (
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Source: {dataSource} · {fetchedAt}
          </div>
        )}

        {isLive ? (
          <div className="live-badge-container" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-badge" style={{ color: 'var(--red)', fontWeight: 'bold', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
              LIVE
            </span>
            <button onClick={onDisconnectLive} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}>Disconnect</button>
          </div>
        ) : (
          <div className="live-connect-container" style={{ position: 'relative' }}>
            <button 
              className="btn-connect-live" 
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              📡 Connect Live Score
            </button>
            {isPopoverOpen && (
              <div className="live-popover" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--surface-dark)', border: '1px solid rgba(255,255,255,0.1)', padding: 12, borderRadius: 8, zIndex: 100, width: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>🔍 Search Match:</div>
                <input 
                  type="text" 
                  value={liveQuery} 
                  onChange={e => setLiveQuery(e.target.value)} 
                  placeholder="e.g. MI vs CSK live score IPL 2025"
                  style={{ width: '100%', padding: '6px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 4, marginBottom: 8 }}
                  onKeyDown={e => e.key === 'Enter' && handleConnect()}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setIsPopoverOpen(false)} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleConnect} disabled={isConnecting} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'var(--gold)', border: 'none', color: 'black', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>
                    {isConnecting ? '...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
