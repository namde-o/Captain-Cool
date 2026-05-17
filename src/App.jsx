import { useState, useCallback, useRef, useEffect } from 'react';
import './styles/theme.css';
import MatchInputForm from './components/MatchInputForm';
import LiveScoreHeader from './components/LiveScoreHeader';
import DebateFeed from './components/DebateFeed';
import SettingsModal from './components/SettingsModal';
import SplashScreen from './components/SplashScreen';
import { runSanjay } from './agents/sanjay';
import { runRohit } from './agents/rohit';
import { runBumrah } from './agents/bumrah';
import { runHarsha } from './agents/harsha';
import { fetchLiveScore } from './agents/liveScore';

const INITIAL_AGENT = { active: false, loading: false, complete: false, text: '', parsed: null, raw: '', error: null };

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !reducedMotion && !sessionStorage.getItem('captainCoolSplashSeen');
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [currentMatchState, setCurrentMatchState] = useState(null);
  const [overHistory, setOverHistory] = useState([]);
  const [agentStates, setAgentStates] = useState({
    sanjay: { ...INITIAL_AGENT },
    rohit: { ...INITIAL_AGENT },
    bumrah: { ...INITIAL_AGENT },
    harsha: { ...INITIAL_AGENT },
  });
  
  const [liveUrl, setLiveUrl] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [autoRefreshLive, setAutoRefreshLive] = useState(false);
  
  const abortControllerRef = useRef(null);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsRunning(false);
      setError("Pipeline cancelled by user.");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isRunning) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, handleCancel]);

  const updateAgent = useCallback((agent, updates) => {
    setAgentStates(prev => ({ ...prev, [agent]: { ...prev[agent], ...updates } }));
  }, []);

  const handleFetchLiveScore = useCallback(async (url, isAutoRefresh = false) => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }
    if (!isAutoRefresh) setIsLiveConnecting(true);
    try {
      const data = await fetchLiveScore(apiKey, url, abortControllerRef.current?.signal);
      setCurrentMatchState(prev => {
        // Only update if it's different, or just merge
        return { ...prev, ...data };
      });
      setIsLiveMode(true);
      setLiveUrl(url);
    } catch (err) {
      if (!isAutoRefresh) setError("Live score failed: " + err.message);
      setIsLiveMode(false);
    } finally {
      if (!isAutoRefresh) setIsLiveConnecting(false);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (isLiveMode && autoRefreshLive && liveUrl) {
      intervalId = setInterval(() => {
        handleFetchLiveScore(liveUrl, true);
      }, 120000);
    }
    return () => clearInterval(intervalId);
  }, [isLiveMode, autoRefreshLive, liveUrl, handleFetchLiveScore]);

  const runPipeline = useCallback(async (matchState) => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    setIsRunning(true);
    setError(null);
    setAgentStates({
      sanjay: { ...INITIAL_AGENT },
      rohit: { ...INITIAL_AGENT },
      bumrah: { ...INITIAL_AGENT },
      harsha: { ...INITIAL_AGENT },
    });

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let currentAgent = null;

    try {
      // ── Agent 1: Sanjay ──
      currentAgent = 'sanjay';
      updateAgent('sanjay', { active: true, loading: true });
      const sanjayResult = await runSanjay(apiKey, matchState, (chunk, full) => {
        updateAgent('sanjay', { text: full });
      }, signal);
      updateAgent('sanjay', { loading: false, complete: true, parsed: sanjayResult.parsed, raw: sanjayResult.raw });

      // ── Agent 2: Rohit ──
      currentAgent = 'rohit';
      updateAgent('rohit', { active: true, loading: true });
      const rohitInput = sanjayResult.parsed || sanjayResult.raw;
      const rohitResult = await runRohit(apiKey, matchState, rohitInput, (chunk, full) => {
        updateAgent('rohit', { text: full });
      }, signal);
      updateAgent('rohit', { loading: false, complete: true, parsed: rohitResult.parsed, raw: rohitResult.raw });

      // ── Agent 3: Bumrah ──
      currentAgent = 'bumrah';
      updateAgent('bumrah', { active: true, loading: true });
      const bumrahInput = rohitResult.parsed || rohitResult.raw;
      const bumrahResult = await runBumrah(apiKey, matchState, bumrahInput, (chunk, full) => {
        updateAgent('bumrah', { text: full });
      }, signal);
      updateAgent('bumrah', { loading: false, complete: true, parsed: bumrahResult.parsed, raw: bumrahResult.raw });

      // ── Agent 4: Harsha ──
      currentAgent = 'harsha';
      updateAgent('harsha', { active: true, loading: true });
      const harshaResult = await runHarsha(
        apiKey, matchState,
        rohitResult.parsed || rohitResult.raw,
        bumrahResult.parsed || bumrahResult.raw,
        (chunk, full) => {
          updateAgent('harsha', { text: full });
        },
        signal
      );
      updateAgent('harsha', { loading: false, complete: true, parsed: harshaResult.parsed, raw: harshaResult.raw });

      // Add to over history
      const decision = harshaResult.parsed?.finalDecision || 'Analyzed';
      const finalStates = {
        sanjay: { active: true, loading: false, complete: true, text: sanjayResult.raw, parsed: sanjayResult.parsed, raw: sanjayResult.raw },
        rohit: { active: true, loading: false, complete: true, text: rohitResult.raw, parsed: rohitResult.parsed, raw: rohitResult.raw },
        bumrah: { active: true, loading: false, complete: true, text: bumrahResult.raw, parsed: bumrahResult.parsed, raw: bumrahResult.raw },
        harsha: { active: true, loading: false, complete: true, text: harshaResult.raw, parsed: harshaResult.parsed, raw: harshaResult.raw },
      };
      
      setOverHistory(prev => {
        const newHistory = [...prev, {
          over: matchState.over,
          ball: matchState.ball,
          decision: typeof decision === 'string' ? decision.substring(0, 30) : 'Decision made',
          states: finalStates,
          matchState: matchState
        }];
        return newHistory.slice(-20); // Max 20 pills
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        if (currentAgent) updateAgent(currentAgent, { loading: false, text: 'Pipeline stopped.' });
        // Optional: toast or log for cancellation
      } else {
        if (currentAgent) updateAgent(currentAgent, { loading: false, error: err.message });
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [updateAgent]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-main-container">
      <header className="app-header app-entry-header">
        <div className="app-logo">
          <div className="app-logo-icon">🏏</div>
          <div>
            <h1>Captain Cool</h1>
            <div className="subtitle">AI IPL Match Strategist</div>
          </div>
        </div>
        <div className="header-actions">
          {isLiveMode && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.75rem', marginRight: 16 }}>
              <input type="checkbox" checked={autoRefreshLive} onChange={e => setAutoRefreshLive(e.target.checked)} />
              Auto-refresh 2m
            </label>
          )}
          <button className="btn-settings" onClick={() => setSettingsOpen(true)}>
            ⚙️ API Key
          </button>
        </div>
      </header>

      <LiveScoreHeader 
        matchState={currentMatchState} 
        isEmpty={!currentMatchState}
        isLive={isLiveMode}
        isConnecting={isLiveConnecting}
        onConnectLive={handleFetchLiveScore}
        onDisconnectLive={() => { setIsLiveMode(false); setAutoRefreshLive(false); }}
      />

      <div className="app-layout">
        <div className="panel-left app-entry-left">
          <MatchInputForm onStrategize={runPipeline} isRunning={isRunning} onChange={setCurrentMatchState} matchState={currentMatchState} />
          {isRunning && (
            <button className="btn-modal btn-modal-secondary" style={{ marginTop: 12, width: '100%' }} onClick={handleCancel}>
              ⏹️ Stop Generation (Esc)
            </button>
          )}
        </div>
        <div className="panel-right app-entry-right">
          <DebateFeed 
            agentStates={agentStates} 
            overHistory={overHistory} 
            matchState={currentMatchState} 
            onLoadHistory={(states, ms) => {
              setAgentStates(states);
              setCurrentMatchState(ms);
            }} 
          />
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {error && (
        <div className="toast toast-error">
          ⚠️ {error}
          <button className="toast-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      <div className="shortcuts-legend">
        <span><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd> Strategize</span>
        <span><kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> Focus Over</span>
        <span><kbd>Esc</kbd> Stop</span>
      </div>
    </div>
  );
}
