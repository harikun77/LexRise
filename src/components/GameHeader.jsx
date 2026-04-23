import { getPlayerClass } from '../hooks/useGameState';

export default function GameHeader({ player, xpPercent, xpToNextLevel, onNavigate, view, state, locked = false }) {
  const cls    = getPlayerClass(player.level);
  const hp     = state?.rpg?.hp    ?? 100;
  const maxHp  = state?.rpg?.maxHp ?? 100;
  const hpPct  = Math.min(100, (hp / maxHp) * 100);
  const hpColor = hpPct > 50 ? 'from-green-600 to-green-400'
                : hpPct > 25 ? 'from-yellow-600 to-yellow-400'
                :               'from-red-700 to-red-500';

  // During an active dungeon run we disable all header shortcuts — the
  // logo (goes home), HP pill (goes to inventory), and Shop button — so
  // the player can't side-step the lock via the header.
  const nav = (dest) => () => { if (!locked) onNavigate(dest); };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        background: 'rgba(3, 7, 18, 0.92)',
        borderColor: 'var(--lx-stroke)',
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
        {/* Logo / home */}
        <button
          onClick={nav('dashboard')}
          disabled={locked}
          aria-disabled={locked}
          className={`flex items-center gap-2 mr-1 flex-shrink-0 ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
          title={locked ? 'Locked during dungeon run' : 'Home'}
        >
          <span className="text-2xl" aria-hidden="true">🏰</span>
          <span
            className="font-display font-bold bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent"
            style={{ fontSize: 'var(--t-title)', letterSpacing: '0.04em' }}
          >
            LexRise
          </span>
        </button>

        {/* Level + class (XP bar moved below the header as a dedicated strip) */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className="t-small font-semibold text-amber-400">
            Lvl {player.level}
          </span>
          <span className="t-micro text-gray-500 truncate" title={cls.title}>
            {cls.emoji} {cls.title}
          </span>
        </div>

        {/* Right-side stats */}
        <div className="flex items-center gap-2 ml-1 flex-shrink-0">
          {/* HP mini-bar → inventory */}
          <button
            onClick={nav('inventory')}
            disabled={locked}
            aria-disabled={locked}
            className={`flex items-center gap-1 transition-opacity ${locked ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}`}
            title={locked ? 'Inventory locked during dungeon run' : 'Inventory'}
          >
            <span className="text-xs" aria-hidden="true">❤️</span>
            <div className="w-10 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${hpColor} rounded-full transition-all`}
                   style={{ width: `${hpPct}%` }} />
            </div>
          </button>

          {/* Gems */}
          <div className="flex items-center gap-1 t-small">
            <span aria-hidden="true">💎</span>
            <span className="font-bold text-cyan-400">{player.gems}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 t-small">
            <span aria-hidden="true">🔥</span>
            <span className="font-bold text-orange-400">{player.streak}</span>
          </div>

          {/* Shop */}
          <button
            onClick={nav('shop')}
            disabled={locked}
            aria-disabled={locked}
            className={`text-base transition-opacity ${locked ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}`}
            title={locked ? 'Shop locked during dungeon run' : 'Shop'}
          >
            🏪
          </button>
        </div>
      </div>

      {/* ── Tier 3 #3: full-width XP progress strip
          Lives under the chrome so it's always visible but never competes
          with controls. 3px tall, amber, with current/next label overlay. */}
      <div className="relative h-[3px] bg-gray-900/70" aria-hidden="true">
        <div
          className="h-full xp-bar-fill"
          style={{
            width: `${xpPercent}%`,
            background: 'linear-gradient(90deg, var(--lx-accent-lo), var(--lx-accent-hi))',
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
          }}
        />
      </div>
      <div className="sr-only" aria-live="polite">
        Level {player.level}, {player.xp} of {xpToNextLevel} XP
      </div>
    </header>
  );
}
