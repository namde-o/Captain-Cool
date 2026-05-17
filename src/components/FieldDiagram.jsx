import { useMemo } from 'react';

const POSITIONS = [
  { id: 'wicketkeeper', label: 'WK', x: 200, y: 280 },
  { id: 'slip', label: 'Slip', x: 240, y: 260 },
  { id: 'gully', label: 'Gully', x: 265, y: 230 },
  { id: 'point', label: 'Point', x: 310, y: 175 },
  { id: 'cover', label: 'Cover', x: 310, y: 120 },
  { id: 'extra-cover', label: 'X Cover', x: 280, y: 80 },
  { id: 'mid-off', label: 'Mid Off', x: 230, y: 50 },
  { id: 'mid-on', label: 'Mid On', x: 170, y: 50 },
  { id: 'mid-wicket', label: 'Mid Wkt', x: 120, y: 80 },
  { id: 'square-leg', label: 'Sq Leg', x: 90, y: 175 },
  { id: 'fine-leg', label: 'Fine Leg', x: 135, y: 260 },
  { id: 'third-man', label: '3rd Man', x: 285, y: 310 },
  { id: 'long-on', label: 'Long On', x: 130, y: 20 },
  { id: 'long-off', label: 'Long Off', x: 270, y: 20 },
  { id: 'deep-mid-wicket', label: 'D Mid', x: 55, y: 100 },
  { id: 'deep-square', label: 'D Sq', x: 40, y: 200 },
  { id: 'deep-cover', label: 'D Cov', x: 350, y: 100 },
  { id: 'deep-point', label: 'D Pt', x: 360, y: 200 },
  { id: 'long-leg', label: 'Long Leg', x: 90, y: 320 },
];

const KEYWORDS_MAP = {
  'wicketkeeper': ['wicketkeeper', 'keeper', 'wk'],
  'slip': ['slip', 'slips', 'first slip', 'second slip'],
  'gully': ['gully'],
  'point': ['point', 'backward point'],
  'cover': ['cover', 'covers', 'extra cover'],
  'extra-cover': ['extra cover', 'extra-cover'],
  'mid-off': ['mid-off', 'mid off', 'midoff'],
  'mid-on': ['mid-on', 'mid on', 'midon'],
  'mid-wicket': ['mid-wicket', 'midwicket', 'mid wicket'],
  'square-leg': ['square leg', 'square-leg'],
  'fine-leg': ['fine leg', 'fine-leg'],
  'third-man': ['third man', 'third-man'],
  'long-on': ['long-on', 'long on'],
  'long-off': ['long-off', 'long off'],
  'deep-mid-wicket': ['deep mid-wicket', 'deep midwicket', 'deep mid wicket'],
  'deep-square': ['deep square', 'deep square leg'],
  'deep-cover': ['deep cover', 'deep extra cover'],
  'deep-point': ['deep point', 'deep backward point'],
  'long-leg': ['long leg', 'long-leg'],
};

export default function FieldDiagram({ highlightText = '' }) {
  const activePositions = useMemo(() => {
    if (!highlightText) return new Set();
    const lower = highlightText.toLowerCase();
    const active = new Set();
    for (const [id, keywords] of Object.entries(KEYWORDS_MAP)) {
      if (keywords.some(kw => lower.includes(kw))) {
        active.add(id);
      }
    }
    return active;
  }, [highlightText]);

  return (
    <div className="field-diagram-container">
      <div className="field-diagram-title">🏏 Field Setting</div>
      <svg viewBox="0 0 400 340" className="field-svg">
        {/* Ground */}
        <ellipse cx="200" cy="170" rx="190" ry="165" fill="#1a472a" stroke="#2d5a3a" strokeWidth="2" />
        <ellipse cx="200" cy="170" rx="140" ry="120" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="5,5" />
        {/* Inner circle */}
        <ellipse cx="200" cy="170" rx="70" ry="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* Pitch */}
        <rect x="192" y="145" width="16" height="55" rx="2" fill="#c4a265" opacity="0.8" stroke="rgba(0,0,0,0.3)" />
        {/* Creases */}
        <line x1="190" y1="150" x2="210" y2="150" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
        <line x1="190" y1="195" x2="210" y2="195" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
        {/* Bowling End Arrow */}
        <path d="M200 210 L200 220 M195 215 L200 210 L205 215" stroke="var(--gold)" strokeWidth="1.5" fill="none" />
        {/* Positions */}
        {POSITIONS.map(pos => {
          const isActive = activePositions.has(pos.id);
          return (
            <g key={pos.id} className={`field-position ${isActive ? 'active' : ''}`}>
              <circle
                cx={pos.x} cy={pos.y} r={isActive ? 8 : 5}
                fill={isActive ? 'var(--gold)' : 'rgba(255,255,255,0.25)'}
                style={isActive ? { filter: 'drop-shadow(0 0 6px var(--gold))' } : { cursor: 'pointer' }}
              />
              <title>{pos.id.replace('-', ' ').toUpperCase()}</title>
              <text
                x={pos.x} y={pos.y - 11} textAnchor="middle"
                fill={isActive ? '#ffd700' : 'rgba(255,255,255,0.4)'}
                fontSize={isActive ? '8.5' : '7.5'} fontFamily="var(--font-mono)"
                fontWeight={isActive ? '700' : '400'}
              >
                {pos.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
