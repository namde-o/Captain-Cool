import { useEffect, useState } from 'react';
import '../styles/splash.css';

export default function SplashScreen({ onComplete }) {
  const [beat, setBeat] = useState(0);
  // beat 0 = black, 1 = ball drop, 2 = shockwave+bg, 
  // 3 = text reveal, 4 = subtitle+line, 5 = badge+dots, 6 = fadeout

  useEffect(() => {
    const timings = [0, 100, 700, 1500, 2300, 2900, 3500];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setBeat(i), delay)
    );
    // Auto-complete at 3900ms
    const done = setTimeout(() => {
      sessionStorage.setItem('captainCoolSplashSeen', '1');
      onComplete();
    }, 3900);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  const handleSkip = () => {
    sessionStorage.setItem('captainCoolSplashSeen', '1');
    onComplete();
  };

  return (
    <div className={`splash-root beat-${beat}`}>
      {/* Background */}
      <div className="splash-bg" />
      
      {/* Shockwave ring */}
      <div className="splash-shockwave" />
      
      {/* Cricket ball */}
      <div className="splash-ball">🏏</div>
      
      {/* Title */}
      <div className="splash-title-row">
        <span className="splash-word splash-captain">CAPTAIN</span>
        <span className="splash-word splash-cool">COOL</span>
      </div>
      
      {/* Subtitle */}
      <div className="splash-subtitle">Your AI IPL Strategist</div>
      <div className="splash-line" />
      
      {/* Gemini badge */}
      <div className="splash-badge">⚡ Powered by Gemini</div>
      
      {/* Team dots */}
      <div className="splash-dots">
        <span className="splash-dot dot-mi" />
        <span className="splash-dot dot-csk" />
        <span className="splash-dot dot-rcb" />
      </div>
      
      {/* Skip */}
      {beat >= 1 && (
        <button className="splash-skip" onClick={handleSkip}>Skip →</button>
      )}
    </div>
  );
}
