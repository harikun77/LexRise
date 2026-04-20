import { useEffect, useState } from 'react';
import { getPlayerClass } from '../hooks/useGameState';

export function XPPopups({ popups }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {popups.map(p => (
        <div
          key={p.id}
          className="absolute animate-xp-pop font-bold text-amber-400 text-lg"
          style={{ left: '50%', top: '40%', transform: 'translateX(-50%)' }}
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gradient-to-br from-amber-900/90 to-yellow-900/80 border-2 border-amber-500 rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce-in glow-gold">
        <div className="text-6xl mb-3 animate-float">{cls.emoji}</div>
        <div className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-1">Level Up!</div>
        <div className="text-4xl font-black text-white mb-2">Level {level}</div>
        <div className="text-xl font-bold text-amber-300 mb-4">{cls.title}</div>
        <div className="text-gray-300 text-sm">You're getting closer to SAT mastery. Keep going!</div>
        <div className="mt-4 text-xs text-amber-500">Tap anywhere to continue</div>
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
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 backdrop-blur-sm pb-8" onClick={onClose}>
      <div className="bg-gradient-to-br from-green-900/90 to-teal-900/80 border border-green-500 rounded-2xl p-5 max-w-sm w-full mx-4 animate-bounce-in glow-green">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{quest.icon}</div>
          <div>
            <div className="text-green-400 font-bold text-xs uppercase tracking-wider">Quest Complete!</div>
            <div className="text-white font-bold text-lg">{quest.title}</div>
            <div className="text-green-300 text-sm">+{quest.xpReward} XP · +{quest.gemReward} 💎</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NameSetupModal({ onSave }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full mx-4 animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏰</div>
          <h2 className="text-2xl font-black text-white">Welcome to LexRise</h2>
          <p className="text-gray-400 text-sm mt-2">Your SAT English adventure begins. What shall we call our scholar?</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim())}
          placeholder="Enter your name..."
          maxLength={20}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-center text-lg font-bold mb-4"
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
