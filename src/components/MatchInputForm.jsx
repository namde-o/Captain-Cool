import { useState, useEffect } from 'react';

const IPL_TEAMS = [
  'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bengaluru',
  'Kolkata Knight Riders', 'Delhi Capitals', 'Rajasthan Royals',
  'Sunrisers Hyderabad', 'Punjab Kings', 'Gujarat Titans', 'Lucknow Super Giants',
];

const VENUES = [
  'Wankhede Stadium, Mumbai', 'MA Chidambaram Stadium, Chennai',
  'M. Chinnaswamy Stadium, Bengaluru', 'Eden Gardens, Kolkata',
  'Arun Jaitley Stadium, Delhi', 'Sawai Mansingh Stadium, Jaipur',
  'Rajiv Gandhi Intl Stadium, Hyderabad', 'Mohali, Punjab',
  'Narendra Modi Stadium, Ahmedabad', 'BRSABV Ekana Stadium, Lucknow',
  'Dharamsala', 'Guwahati',
];

const PITCH_TYPES = ['Flat', 'Turning', 'Seaming', 'Two-Paced'];
const DEW_OPTIONS = ['None', 'Light', 'Heavy'];

function getPhase(over) {
  if (over <= 6) return 'Powerplay';
  if (over <= 15) return 'Middle';
  return 'Death';
}

export default function MatchInputForm({ onStrategize, isRunning, onChange, matchState }) {
  const [form, setForm] = useState(matchState || {
    innings: '1st',
    over: 10,
    ball: 1,
    battingTeam: IPL_TEAMS[0],
    bowlingTeam: IPL_TEAMS[1],
    currentScore: '85/2',
    striker: '',
    nonStriker: '',
    target: 180,
    pitchType: 'Flat',
    dewFactor: 'None',
    venue: VENUES[0],
    impactPlayerAvailable: true,
    bowlers: [{ name: '', oversLeft: '4' }],
    cricbuzzUrl: '',
  });

  // Sync form if external matchState updates (e.g. from Live Score)
  useEffect(() => {
    if (matchState) {
      setForm(prev => {
        // Deep compare or just merge if different?
        // To avoid infinite loops with onChange, only update fields that actually differ
        const hasDiff = Object.keys(matchState).some(k => matchState[k] !== prev[k]);
        return hasDiff ? { ...prev, ...matchState } : prev;
      });
    }
  }, [matchState]);

  const phase = getPhase(form.over);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) onStrategize({ ...form, phase });
      }
      // Cmd/Ctrl + K to focus over
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('over-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, phase, isRunning, onStrategize]);

  useEffect(() => {
    if (onChange) onChange({ ...form, phase });
  }, [form, phase, onChange]);

  const addBowler = () => {
    setForm(prev => ({ ...prev, bowlers: [...prev.bowlers, { name: '', oversLeft: '4' }] }));
  };

  const removeBowler = (i) => {
    setForm(prev => ({ ...prev, bowlers: prev.bowlers.filter((_, idx) => idx !== i) }));
  };

  const updateBowler = (i, key, val) => {
    setForm(prev => {
      const bowlers = [...prev.bowlers];
      bowlers[i] = { ...bowlers[i], [key]: val };
      return { ...prev, bowlers };
    });
  };

  const getBowlerColor = (overs) => {
    const o = parseInt(overs) || 0;
    if (o === 0) return 'var(--red)';
    if (o <= 2) return 'var(--yellow)';
    return 'var(--green)';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStrategize({ ...form, phase });
  };

  return (
    <form onSubmit={handleSubmit} className="match-input-form" style={{ position: 'relative', overflow: 'hidden' }}>
      {form.dewFactor === 'Heavy' && (
        <div className="heavy-dew-overlay" />
      )}
      
      {/* Innings & Over */}
      <div className="form-section form-group-animate" style={{ animationDelay: '0ms' }}>
        <div className="form-section-title">🏏 Match Situation</div>
        <div className="form-row">
          <div className="form-group">
            <label>Innings</label>
            <div className="toggle-group">
              {['1st', '2nd'].map(inn => (
                <button type="button" key={inn} className={`toggle-btn ${form.innings === inn ? 'active' : ''}`}
                  onClick={() => update('innings', inn)}>{inn}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Over <span className="range-value">{form.over}</span></label>
            <input type="range" id="over-input" min="1" max="20" value={form.over}
              onChange={e => update('over', parseInt(e.target.value))}
              onWheel={e => {
                const delta = e.deltaY < 0 ? 1 : -1;
                update('over', Math.max(1, Math.min(20, form.over + delta)));
              }} />
          </div>
          <div className="form-group" style={{ maxWidth: 80 }}>
            <label>Ball</label>
            <select value={form.ball} onChange={e => update('ball', parseInt(e.target.value))}>
              {[1,2,3,4,5,6].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Phase</label>
            <span className={`phase-badge phase-${phase.toLowerCase()}`}>{phase}</span>
          </div>
          <div className="form-group">
            <label>Score</label>
            <input type="text" value={form.currentScore} placeholder="142/3"
              onChange={e => update('currentScore', e.target.value)} />
          </div>
          {form.innings === '2nd' && (
            <div className="form-group">
              <label>Target</label>
              <input type="number" value={form.target} min="1"
                onChange={e => update('target', parseInt(e.target.value) || 0)} />
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="form-section form-group-animate" style={{ animationDelay: '100ms' }}>
        <div className="form-section-title">👥 Teams</div>
        <div className="form-row">
          <div className="form-group">
            <label>Batting Team</label>
            <select value={form.battingTeam} onChange={e => update('battingTeam', e.target.value)}>
              {IPL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Bowling Team</label>
            <select value={form.bowlingTeam} onChange={e => update('bowlingTeam', e.target.value)}>
              {IPL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>Striker</label>
            <input type="text" value={form.striker} placeholder="e.g. Virat Kohli"
              onChange={e => update('striker', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Non-Striker</label>
            <input type="text" value={form.nonStriker} placeholder="e.g. Faf du Plessis"
              onChange={e => update('nonStriker', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="form-section form-group-animate" style={{ animationDelay: '200ms' }}>
        <div className="form-section-title">🌤️ Conditions</div>
        <div className="form-row">
          <div className="form-group">
            <label>Venue</label>
            <select value={form.venue} onChange={e => update('venue', e.target.value)}>
              {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1.5 }}>
            <label>Pitch</label>
            <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
              {PITCH_TYPES.map(p => (
                <button type="button" key={p} className={`toggle-btn ${form.pitchType === p ? 'active' : ''}`}
                  onClick={() => update('pitchType', p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Dew Factor</label>
            <div className="toggle-group">
              {DEW_OPTIONS.map(d => (
                <button type="button" key={d} className={`toggle-btn ${form.dewFactor === d ? 'active' : ''}`}
                  onClick={() => update('dewFactor', d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Impact Player</label>
            <div className="toggle-group">
              {['Yes', 'No'].map(opt => (
                <button type="button" key={opt}
                  className={`toggle-btn ${(form.impactPlayerAvailable ? 'Yes' : 'No') === opt ? 'active' : ''}`}
                  onClick={() => update('impactPlayerAvailable', opt === 'Yes')}>{opt}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bowlers */}
      <div className="form-section form-group-animate" style={{ animationDelay: '300ms' }}>
        <div className="form-section-title">🎳 Bowler Quota Tracker</div>
        {form.bowlers.map((b, i) => {
          const color = getBowlerColor(b.oversLeft);
          const isDone = parseInt(b.oversLeft) === 0;
          return (
            <div key={i} className={`bowler-row ${isDone ? 'bowler-done' : ''}`}>
              <input type="text" placeholder="Bowler name" value={b.name}
                style={{ textDecoration: isDone ? 'line-through' : 'none' }}
                onChange={e => updateBowler(i, 'name', e.target.value)} />
              <input type="number" placeholder="Overs left" value={b.oversLeft} min="0" max="4"
                style={{ maxWidth: 80, color, borderColor: color }}
                onChange={e => updateBowler(i, 'oversLeft', e.target.value)} />
              <label className="death-specialist-toggle">
                <input type="checkbox" checked={b.isDeathSpecialist || false}
                  onChange={e => updateBowler(i, 'isDeathSpecialist', e.target.checked)} />
                <span style={{ fontSize: '0.8rem', color: b.isDeathSpecialist ? 'var(--gold)' : 'var(--text-muted)' }}>Death Specialist</span>
              </label>
              {form.bowlers.length > 1 && (
                <button type="button" className="remove-btn" onClick={() => removeBowler(i)}>×</button>
              )}
            </div>
          );
        })}
        <button type="button" className="add-bowler-btn" onClick={addBowler}>+ Add Bowler</button>
      </div>

      {/* URL Context */}
      <div className="form-section form-group-animate" style={{ animationDelay: '400ms' }}>
        <div className="form-section-title">🔗 Live Match URL (Optional)</div>
        <div className="form-group">
          <label>Cricbuzz / ESPNcricinfo URL</label>
          <input type="text" value={form.cricbuzzUrl} placeholder="Paste match URL for live context..."
            onChange={e => update('cricbuzzUrl', e.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn-strategize form-group-animate" style={{ animationDelay: '500ms' }} disabled={isRunning}>
        {isRunning ? (
          'AGENTS DELIBERATING...'
        ) : (
          <>
            <span className="btn-shimmer" />
            🎯 STRATEGIZE
          </>
        )}
      </button>
    </form>
  );
}
