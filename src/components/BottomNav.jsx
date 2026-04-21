// ============================================================
// BottomNav — Sticky bottom navigation bar (iOS/Android style)
//
// Tabs: Home | Dungeon | Study | Bag | Progress
//
// "Study" is active whenever the current view is any of:
//   study, vocab, grammar, reading
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

export default function BottomNav({ view, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur border-t border-gray-800"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(tab => {
          const active = isActive(tab.id, view);
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all btn-press ${
                active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active indicator dot */}
              <div className={`h-0.5 w-6 rounded-full mb-1 transition-all ${active ? 'bg-indigo-400' : 'bg-transparent'}`} />
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className={`text-xs font-medium mt-0.5 ${active ? 'text-indigo-400' : 'text-gray-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
