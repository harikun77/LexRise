import { useEffect, useState } from 'react';
import { getPlayerClass } from '../hooks/useGameState';

/**
 * STACKING HIERARCHY
 *   UI chrome (GameHeader, BottomNav, InstallBanner)  ... z-50
 *   Overlays  (these four)                            ... z-[100]
 *
 * Everything here uses z-[100] so overlays always win against sticky
 * headers and fixed nav. Previously the NameSetupModal was at z-50 and
 * ordered before GameHeader in App.jsx, so the header silently stacked
 * on top and swallowed the first-launch popup.
 */

export function XPPopups({ popups }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {popups.map(p => (
        <div
          key={p.id}
          className="absolute animate-xp-pop font-bold text-amber-400 text-lg"
          style={{
            left: '50%',
            top: '40%',
            transform: 'translateX(-50%)',
            textShadow: '0 2px 4px rgba(0,0,0,0.7)',
          }}
        >
          +{p.amount} XP ⚡
        </div>
      ))}
    </div>
  );
}

export function LevelUpModal({ level, onClose }) {
  const cls = getPlayerClass(level);
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      aria-describedby="levelup-body"
    >
      <div className="bg-gradient-to-br from-amber-900/90 to-yellow-900/80 border-2 border-amber-500 rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce-in glow-gold">
        <div className="text-6xl mb-3 animate-float" aria-hidden="true">{cls.emoji}</div>
        <div className="t-micro font-bold uppercase tracking-widest text-amber-400 mb-1">Level Up!</div>
        <div id="levelup-title" className="font-display t-display text-white mb-2">Level {level}</div>
        <div className="text-xl font-bold text-amber-300 mb-4">{cls.title}</div>
        <div id="levelup-body" className="text-gray-300 t-small">You're getting closer to SAT mastery. Keep going!</div>
        <div className="mt-4 t-micro text-amber-500">Tap anywhere to continue</div>
      </div>
    </div>
  );
}

export function QuestCompleteModal({ quest, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-[100] backdrop-blur-sm pb-8"
      onClick={onClose}
      role="status"
      aria-live="polite"
    >
      <div className="bg-gradient-to-br from-green-900/90 to-teal-900/80 border border-green-500 rounded-2xl p-5 max-w-sm w-full mx-4 animate-bounce-in glow-green">
        <div className="flex items-center gap-4">
          <div className="text-4xl" aria-hidden="true">{quest.icon}</div>
          <div>
            <div className="t-micro font-bold uppercase tracking-wider text-green-400">Quest Complete!</div>
            <div className="text-white font-bold text-lg">{quest.title}</div>
            <div className="text-green-300 t-small">+{quest.xpReward} XP · +{quest.gemReward} 💎</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NameSetupModal({ onSave }) {
  const [name, setName] = useState('');
  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-title"
    >
      {/* Uses the new .surface utility (inset highlight + dark base +
          outer shadow) to feel like a proper dialog object. */}
      <div
        className="surface p-8 max-w-sm w-full mx-4 animate-bounce-in"
        style={{ borderColor: 'var(--lx-accent)' }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 animate-float" aria-hidden="true">🏰</div>
          <h2
            id="name-title"
            className="font-display t-display text-white"
            style={{ letterSpacing: '0.02em' }}
          >
            Welcome to LexRise
          </h2>
          <p className="text-gray-400 t-small mt-2">
            Your SAT English adventure begins. What shall we call our scholar?
          </p>
        </div>
        <label htmlFor="player-name-input" className="sr-only">Your name</label>
        <input
          id="player-name-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
          placeholder="Enter your name..."
          maxLength={20}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-center text-lg font-bold mb-4"
          autoFocus
        />
        <button
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 font-black text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:from-amber-400 hover:to-yellow-300 transition-all btn-press"
        >
          Begin the Quest →
        </button>
      </div>
    </div>
  );
}
