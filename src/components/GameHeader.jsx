import { getPlayerClass } from '../hooks/useGameState';

export default function GameHeader({ player, xpPercent, xpToNextLevel, onNavigate, view, state }) {
  const cls    = getPlayerClass(player.level);
  const hp     = state?.rpg?.hp    ?? 100;
  const maxHp  = state?.rpg?.maxHp ?? 100;
  const hpPct  = Math.min(100, (hp / maxHp) * 100);
  const hpColor = hpPct > 50 ? 'from-green-600 to-green-400'
                : hpPct > 25 ? 'from-yellow-600 to-yellow-400'
                :               'from-red-700 to-red-500';

  return (
    <header
      className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
        {/* Logo / home */}
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 mr-1 flex-shrink-0">
          <span className="text-2xl">🏰</span>
          <span className="font-bold text-lg bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent tracking-tight">
            LexRise
          </span>
        </button>

        {/* XP Bar */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span className="font-semibold text-amber-400">
              Lvl {player.level} <span className="text-gray-500">{cls.emoji}</span>
            </span>
            <span>{player.xp} / {xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full xp-bar-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Right-side stats */}
        <div className="flex items-center gap-2 ml-1 flex-shrink-0">
          {/* HP mini-bar → inventory */}
          <button
            onClick={() => onNavigate('inventory')}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            title="Inventory"
          >
            <span className="text-xs">❤️</span>
            <div className="w-10 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${hpColor} rounded-full transition-all`}
                   style={{ width: `${hpPct}%` }} />
            </div>
          </button>

          {/* Gems */}
          <div className="flex items-center gap-1 text-sm">
            <span>💎</span>
            <span className="font-bold text-cyan-400">{player.gems}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 text-sm">
            <span>🔥</span>
            <span className="font-bold text-orange-400">{player.streak}</span>
          </div>

          {/* Shop */}
          <button
            onClick={() => onNavigate('shop')}
            className="text-base hover:opacity-80 transition-opacity"
            title="Shop"
          >
            🏪
          </button>
        </div>
      </div>
    </header>
  );
}
