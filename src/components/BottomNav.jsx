// ============================================================
// BottomNav — Sticky bottom navigation bar (iOS/Android style)
//
// Tabs: Home | Dungeon | Study | Bag | Progress
//
// "Study" is active whenever the current view is any of:
//   study, vocab, grammar, reading
//
// LOCK MODE:
//   When `locked` is true (player is mid-dungeon-run), only the Dungeon
//   tab is enabled. Tapping another tab does nothing — the user must
//   finish or abandon the run to leave. This keeps run snapshots honest
//   and prevents the "prep-in-shop-mid-battle" exploit.
// ============================================================

const TABS = [
  { id: 'dashboard', icon: '🏠', label: 'Home'     },
  { id: 'dungeon',   icon: '⚔️', label: 'Dungeon'  },
  { id: 'study',     icon: '📚', label: 'Study'    },
  { id: 'inventory', icon: '🎒', label: 'Bag'      },
  { id: 'progress',  icon: '🗺️', label: 'Progress' },
];

const STUDY_VIEWS = new Set(['study', 'vocab', 'grammar', 'reading']);

function isActive(tabId, view) {
  if (tabId === 'study') return STUDY_VIEWS.has(view);
  return tabId === view;
}

export default function BottomNav({ view, onNavigate, locked = false }) {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur border-t transition-colors ${
           locked ? 'bg-red-950/60 border-red-900/60' : 'bg-gray-950/95 border-gray-800'
         }`}
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
         aria-label={locked ? 'Navigation locked — finish or abandon your dungeon run to leave' : 'Primary navigation'}>
      {locked && (
        <div className="max-w-2xl mx-auto px-4 pt-1 pb-0.5 text-center text-[10px] font-bold uppercase tracking-widest text-red-300/90">
          🔒 In dungeon — finish or abandon run to leave
        </div>
      )}
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(tab => {
          const active   = isActive(tab.id, view);
          const disabled = locked && tab.id !== 'dungeon';
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onNavigate(tab.id)}
              disabled={disabled}
              aria-disabled={disabled}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all btn-press ${
                disabled
                  ? 'text-gray-700 cursor-not-allowed opacity-50'
                  : active
                    ? 'text-indigo-400'
                    : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active indicator dot */}
              <div className={`h-0.5 w-6 rounded-full mb-1 transition-all ${active && !disabled ? 'bg-indigo-400' : 'bg-transparent'}`} />
              <span className="text-xl leading-none">{disabled ? '🔒' : tab.icon}</span>
              <span className={`text-xs font-medium mt-0.5 ${
                disabled ? 'text-gray-700' : active ? 'text-indigo-400' : 'text-gray-600'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
