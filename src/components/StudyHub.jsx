// ============================================================
// StudyHub — Study branch picker screen
// Shown when player taps the 📚 Study tab in BottomNav.
// Navigates to VocabForge, GrammarDojo, or ReadingCitadel.
// ============================================================

import { getPlayerClass } from '../hooks/useGameState';

function BranchCard({ name, icon, skill, color, locked, lockMsg, onClick }) {
  const pct     = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;
  const xpPct   = Math.min(100, (skill.xp % 200) / 2);
  const colors  = {
    indigo: 'from-indigo-900/80 to-indigo-800/60 border-indigo-600/50 hover:border-indigo-400',
    purple: 'from-purple-900/80 to-purple-800/60 border-purple-600/50 hover:border-purple-400',
    cyan:   'from-cyan-900/80   to-cyan-800/60   border-cyan-600/50   hover:border-cyan-400',
  };
  const barColors = {
    indigo: 'from-indigo-500 to-blue-400',
    purple: 'from-purple-500 to-pink-400',
    cyan:   'from-cyan-500   to-teal-400',
  };

  if (locked) {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 opacity-60">
        <div className="flex items-center gap-3">
          <span className="text-3xl opacity-50">{icon}</span>
          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-xs text-amber-400 mt-0.5">🔒 {lockMsg}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-br ${colors[color]} border rounded-xl p-4 text-left card-hover btn-press transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white">{name}</div>
          <div className="text-xs text-gray-400">Level {skill.level} · {skill.masteredIds.length} mastered</div>
        </div>
        <span className="text-xs text-amber-400 font-bold">PLAY →</span>
      </div>

      {/* XP bar */}
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full bg-gradient-to-r ${barColors[color]} rounded-full xp-bar-fill`}
          style={{ width: `${xpPct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>Accuracy: <span className="text-white font-medium">{pct}%</span></span>
        <span>Attempted: <span className="text-white font-medium">{skill.total}</span></span>
      </div>
    </button>
  );
}

export default function StudyHub({ state, onNavigate }) {
  const { player, skills } = state;
  const vocabLevel      = skills.vocabulary.level;
  const readingUnlocked = vocabLevel >= 5;
  const cls             = getPlayerClass(player.level);

  // Tips by tier availability
  const availableTier = player.level < 5 ? 1 : player.level < 12 ? 2 : 3;
  const tierLabels    = { 1: '8th Grade', 2: '9th–10th', 3: 'SAT Level' };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">📚 Study Branches</h1>
        <p className="text-xs text-gray-400 mt-1">
          Current tier: <span className="text-amber-400 font-semibold">{tierLabels[availableTier]}</span>
          {availableTier < 3 && <span className="text-gray-600"> — level up to unlock harder questions</span>}
        </p>
      </div>

      <div className="space-y-3">
        <BranchCard
          name="Vocabulary Forge"
          icon="📖"
          skill={skills.vocabulary}
          color="indigo"
          onClick={() => onNavigate('vocab')}
        />

        <BranchCard
          name="Grammar Dojo"
          icon="✍️"
          skill={skills.grammar}
          color="purple"
          onClick={() => onNavigate('grammar')}
        />

        <BranchCard
          name="Reading Citadel"
          icon="📜"
          skill={skills.reading}
          color="cyan"
          locked={!readingUnlocked}
          lockMsg={`Unlocks at Vocabulary Level 5 (you're at ${vocabLevel})`}
          onClick={() => onNavigate('reading')}
        />
      </div>

      {/* Tip */}
      <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <div className="font-semibold text-gray-300 mb-2">💡 How Study Works</div>
        <div>• Answer questions to earn XP and level up your skills</div>
        <div>• The SM-2 algorithm schedules due reviews first</div>
        <div>• Mastered words reappear less often — focus shifts to weak spots</div>
        <div>• Dungeon enemies pull from the same question bank — the more you study, the easier dungeons get!</div>
      </div>
    </div>
  );
}
