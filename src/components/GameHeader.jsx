import { getPlayerClass } from '../hooks/useGameState';

export default function GameHeader({ player, xpPercent, xpToNextLevel, onNavigate, view, state }) {
  const cls = getPlayerClass(player.level);
  const readingUnlocked = (state?.skills?.vocabulary?.level ?? 0) >= 5;
  const hp    = state?.rpg?.hp    ?? 100;
  const maxHp = state?.rpg?.maxHp ?? 100;
  const hpPct = Math.min(100, (hp / maxHp) * 100);
  const hpColor = hpPct > 50 ? 'from-green-600 to-green-400'
                : hpPct > 25 ? 'from-yellow-600 to-yellow-400'
                :               'from-red-700 to-red-500';

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {/* Logo */}
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 mr-1">
          <span className="text-2xl">🏰</span>
          <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent tracking-tight">
            LexRise
          </span>
        </button>

        {/* XP Bar */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold text-amber-400">Lvl {player.level} <span className="text-gray-500">{cls.emoji}</span></span>
            <span>{player.xp} / {xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full xp-bar-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 ml-2">
          {/* HP mini-bar */}
          <button onClick={() => onNavigate('inventory')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <span className="text-xs text-red-400">❤️</span>
            <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${hpColor} rounded-full transition-all`}
                   style={{ width: `${hpPct}%` }} />
            </div>
          </button>
          <div className="flex items-center gap-1 text-sm">
            <span>💎</span>
            <span className="font-bold text-cyan-400">{player.gems}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>🔥</span>
            <span className="font-bold text-orange-400">{player.streak}</span>
          </div>
          {/* Shop quick-access */}
          <button
            onClick={() => onNavigate('shop')}
            className="text-sm hover:opacity-80 transition-opacity"
            title="Shop"
          >
            🏪
          </button>
        </div>
      </div>

      {/* Nav tabs */}
      <div className="max-w-2xl mx-auto flex gap-1 mt-2">
        {[
          { id: 'dashboard',  label: '🏠'     },
          { id: 'vocab',      label: '📖'     },
          { id: 'grammar',    label: '✍️'     },
          ...(readingUnlocked ? [{ id: 'reading', label: '📜' }] : []),
          { id: 'dungeon',    label: '⚔️'     },
          { id: 'inventory',  label: '🎒'     },
          { id: 'shop',       label: '🏪'     },
          { id: 'progress',   label: '🗺️'     },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex-1 text-sm py-1.5 rounded-lg font-medium transition-all btn-press ${
              view === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
