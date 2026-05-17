import { useState } from 'react';
import confetti from 'canvas-confetti';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function SettingsModal({ isOpen, onClose }) {
  const [key, setKey] = useState(localStorage.getItem('gemini-api-key') || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!key.trim()) return;
    setIsValidating(true);
    setError(null);
    try {
      const genAI = new GoogleGenerativeAI(key.trim());
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent("Test call");
      
      localStorage.setItem('gemini-api-key', key.trim());
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#0a2342', '#3b82f6', '#22c55e']
      });
      setTimeout(() => {
        setIsValidating(false);
        onClose();
      }, 1000);
    } catch (err) {
      let msg = err.message || "Unknown error";
      if (msg.includes('429') || msg.includes('quota')) {
        msg = "Quota exceeded or rate limited. Please check your plan on Google AI Studio.";
      } else if (msg.includes('400') || msg.includes('API_KEY_INVALID') || msg.includes('expired')) {
        msg = "API key expired or invalid. Please generate a new key on Google AI Studio.";
      }
      setError("Validation Failed: " + msg);
      setIsValidating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="bouncing-ball" style={{ display: 'inline-block' }}>🏏</span> Settings
        </h2>
        <label style={{ display: 'block', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Gemini API Key
        </label>
        <input
          className="modal-input"
          type="password"
          placeholder="Paste your Gemini API key..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>AI Studio</a>. Stored in localStorage only.
        </p>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 12, wordBreak: 'break-word', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        <div className="modal-actions" style={{ marginTop: 24 }}>
          {localStorage.getItem('gemini-api-key') && (
            <button className="btn-modal btn-modal-secondary" onClick={onClose} disabled={isValidating}>Cancel</button>
          )}
          <button className="btn-modal btn-modal-primary" onClick={handleSave} disabled={isValidating || !key.trim()}>
            {isValidating ? (
              <>
                <span className="spinner-dot" /> Validating...
              </>
            ) : 'Save Key'}
          </button>
        </div>
      </div>
    </div>
  );
}
