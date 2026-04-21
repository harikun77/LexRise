import { getPlayerClass } from '../hooks/useGameState';
import { getCurrentBoss } from '../data/bossBattles';

const AVATAR_FRAMES = ['⚔️', '🔍', '⚔️', '🛡️', '🔮', '📚', '👑', '🏆'];

function HeroCard({ player, xpPercent, xpToNextLevel }) {
  const cls = getPlayerClass(player.level);
  const accuracy = player.totalQuestionsAnswered > 0
    ? Math.round((player.totalCorrect / player.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-5 glow-gold mb-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-4xl animate-float shadow-lg">
            {cls.emoji}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-gray-900">
            {player.level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-0.5">{cls.title}</div>
          <h2 className="text-xl font-bold text-white truncate">{player.name}</h2>

          {/* XP Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>XP to Level {player.level + 1}</span>
              <span>{player.xp} / {xpToNextLevel}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full xp-bar-fill"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatBadge label="Questions" value={player.totalQuestionsAnswered} icon="❓" color="blue" />
        <StatBadge label="Accuracy" value={`${accuracy}%`} icon="🎯" color="green" />
        <StatBadge label="Best Streak" value={player.longestStreak} icon="🔥" color="orange" />
      </div>
    </div>
  );
}

function StatBadge({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-900/40 border-blue-700/50 text-blue-300',
    green: 'bg-green-900/40 border-green-700/50 text-green-300',
    orange: 'bg-orange-900/40 border-orange-700/50 text-orange-300',
  };
  return (
    <div className={`rounded-xl p-3 border text-center ${colors[color]}`}>
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

function QuestCard({ quest }) {
  const pct = Math.min(100, Math.floor((quest.progress / quest.target) * 100));
  return (
    <div className={`rounded-xl p-4 border transition-all ${
      quest.completed
        ? 'bg-green-900/30 border-green-600/50'
        : 'bg-gray-800/60 border-gray-700'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-white truncate">{quest.title}</span>
            {quest.completed
              ? <span className="text-green-400 text-xs font-bold flex-shrink-0">✓ DONE</span>
              : <span className="text-xs text-gray-400 flex-shrink-0">+{quest.xpReward} XP</span>
            }
          </div>
          <div className="text-xs text-gray-400 mb-2">{quest.description}</div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${quest.completed ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{quest.progress} / {quest.target}</div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ name, icon, skill, color, onClick }) {
  const pct = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;
  const colors = {
    indigo: 'from-indigo-900/80 to-indigo-800/60 border-indigo-600/50 hover:border-indigo-500',
    purple: 'from-purple-900/80 to-purple-800/60 border-purple-600/50 hover:border-purple-500',
    cyan:   'from-cyan-900/80 to-cyan-800/60 border-cyan-600/50 hover:border-cyan-500',
  };
  const barColors = {
    indigo: 'from-indigo-500 to-blue-400',
    purple: 'from-purple-500 to-pink-400',
    cyan:   'from-cyan-500 to-teal-400',
  };
  return (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-br ${colors[color]} border rounded-xl p-4 text-left card-hover btn-press transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-xs text-gray-400">Level {skill.level} · {skill.correct} mastered</div>
        </div>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColors[color]} rounded-full xp-bar-fill`}
          style={{ width: `${Math.min(100, skill.xp % 200 / 2)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1.5">
        <span>Accuracy: {pct}%</span>
        <span className="text-amber-400 font-semibold">PLAY →</span>
      </div>
    </button>
  );
}

export default function Dashboard({ state, xpPercent, xpToNextLevel, onNavigate, bossAvailable }) {
  const { player, skills, dailyQuests } = state;
  const completedCount  = dailyQuests.filter(q => q.completed).length;
  const vocabLevel      = skills.vocabulary.level;
  const readingUnlocked = vocabLevel >= 5;
  const boss            = getCurrentBoss(player.level);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <HeroCard player={player} xpPercent={xpPercent} xpToNextLevel={xpToNextLevel} />

      {/* Daily Quests */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-lg">⚡ Daily Quests</h2>
          <span className="text-sm text-gray-400">{completedCount}/{dailyQuests.length} complete</span>
        </div>
        {completedCount === dailyQuests.length && dailyQuests.length > 0 && (
          <div className="bg-green-900/30 border border-green-600/50 rounded-xl p-3 mb-3 text-center text-green-300 text-sm font-semibold">
            🎉 All quests completed! Come back tomorrow for more.
          </div>
        )}
        <div className="space-y-3">
          {dailyQuests.map(q => <QuestCard key={q.id} quest={q} />)}
        </div>
      </section>

      {/* Boss Battle — shows at level 5+ */}
      {boss && (
        <section>
          <h2 className="font-bold text-white text-lg mb-3">⚔️ Weekly Boss Battle</h2>
          {bossAvailable ? (
            <button
              onClick={() => onNavigate('boss')}
              className="w-full bg-gradient-to-br from-red-950/80 to-gray-900 border border-red-800/60 hover:border-red-600 rounded-xl p-4 text-left card-hover btn-press transition-all"
              style={{ boxShadow: '0 0 20px rgba(239,68,68,0.1)' }}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-float">{boss.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">⚔️ New Challenge Available!</span>
                  </div>
                  <div className="font-bold text-white text-base">{boss.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{boss.description}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-amber-400 font-semibold">+{boss.xpReward} XP</span>
                    <span className="text-xs text-cyan-400 font-semibold">+{boss.gemReward} 💎</span>
                    <span className="text-xs text-gray-500">10 questions · 3 min</span>
                  </div>
                </div>
                <div className="text-red-400 font-bold text-lg">→</div>
              </div>
            </button>
          ) : (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 opacity-70">
              <div className="flex items-center gap-4">
                <div className="text-4xl opacity-50">{boss.emoji}</div>
                <div>
                  <div className="font-bold text-white">{boss.name}</div>
                  <div className="text-xs text-green-400 mt-0.5">✅ Defeated this week</div>
                  <div className="text-xs text-gray-500 mt-1">Returns next week · Come back and challenge again</div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Dungeon Entry */}
      <section>
        <h2 className="font-bold text-white text-lg mb-3">⚔️ Dungeons</h2>
        <button
          onClick={() => onNavigate('dungeon')}
          className="w-full bg-gradient-to-br from-indigo-950/80 to-gray-900 border border-indigo-700/60 hover:border-indigo-500 rounded-xl p-4 text-left card-hover btn-press transition-all"
          style={{ boxShadow: '0 0 20px rgba(99,102,241,0.1)' }}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-float">🏰</div>
            <div className="flex-1">
              <div className="font-bold text-white text-base">Enter Dungeon</div>
              <div className="text-xs text-gray-400 mt-0.5">Battle enemies, earn XP & gems</div>
              <div className="text-xs text-indigo-400 mt-1">Answer questions → attack enemies</div>
            </div>
            <div className="text-indigo-400 font-bold text-lg">→</div>
          </div>
        </button>
      </section>

      {/* Quick Actions — Shop + Inventory */}
      <section>
        <h2 className="font-bold text-white text-lg mb-3">⚔️ Dungeon Prep</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('shop')}
            className="bg-gradient-to-br from-yellow-900/60 to-amber-900/40 border border-yellow-700/50 hover:border-yellow-500 rounded-xl p-4 text-left card-hover btn-press transition-all"
          >
            <div className="text-3xl mb-2">🏪</div>
            <div className="font-bold text-white text-sm">Shop</div>
            <div className="text-xs text-yellow-400">Buy weapons, armor, potions</div>
            <div className="text-xs text-gray-500 mt-1">💎 {player.gems} gems</div>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="bg-gradient-to-br from-amber-900/60 to-orange-900/40 border border-amber-700/50 hover:border-amber-500 rounded-xl p-4 text-left card-hover btn-press transition-all"
          >
            <div className="text-3xl mb-2">🎒</div>
            <div className="font-bold text-white text-sm">Inventory</div>
            <div className="text-xs text-amber-400">Manage gear + use potions</div>
            <div className="text-xs text-gray-500 mt-1">
              {state.inventory?.bag?.length ?? 0} items in bag
            </div>
          </button>
        </div>
      </section>

      {/* Skill branches */}
      <section>
        <h2 className="font-bold text-white text-lg mb-3">🗺️ Skill Branches</h2>
        <div className="space-y-3">
          <SkillCard
            name="Vocabulary Forge"
            icon="📖"
            skill={skills.vocabulary}
            color="indigo"
            onClick={() => onNavigate('vocab')}
          />
          <SkillCard
            name="Grammar Dojo"
            icon="✍️"
            skill={skills.grammar}
            color="purple"
            onClick={() => onNavigate('grammar')}
          />
          {readingUnlocked ? (
            <SkillCard
              name="Reading Citadel"
              icon="📜"
              skill={skills.reading}
              color="cyan"
              onClick={() => onNavigate('reading')}
            />
          ) : (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 opacity-60">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📜</span>
                <div>
                  <div className="font-bold text-white">Reading Citadel</div>
                  <div className="text-xs text-amber-400">🔒 Unlocks at Vocabulary Level 5</div>
                  <div className="text-xs text-gray-500 mt-0.5">Current: Vocab Level {vocabLevel}</div>
                </div>
              </div>
              {/* Progress bar toward unlock */}
              <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (vocabLevel / 5) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">{vocabLevel}/5 Vocab levels</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
