import { getPlayerClass } from '../hooks/useGameState';
import { VOCAB_WORDS, GRAMMAR_CHALLENGES } from '../data/index';
import { useRef, useState } from 'react';

const CLASS_MILESTONES = [
  { level: 1, title: 'Apprentice Scholar', emoji: '📜', desc: 'Your journey begins' },
  { level: 5, title: 'Word Seeker', emoji: '🔍', desc: 'You know 12+ SAT words' },
  { level: 10, title: 'Lexicon Warrior', emoji: '⚔️', desc: 'Vocabulary is your weapon' },
  { level: 15, title: 'Grammar Knight', emoji: '🛡️', desc: 'Errors fear your correction' },
  { level: 20, title: 'Syntax Mage', emoji: '🔮', desc: 'You bend language to your will' },
  { level: 30, title: 'Rhetoric Sage', emoji: '📚', desc: 'Arguments bow before you' },
  { level: 40, title: 'Master Linguist', emoji: '👑', desc: 'Near SAT mastery' },
  { level: 50, title: 'SAT Champion', emoji: '🏆', desc: 'The final boss is defeated' },
];

function MilestoneNode({ milestone, currentLevel, isLast }) {
  const unlocked = currentLevel >= milestone.level;
  const current = getPlayerClass(currentLevel).title === milestone.title;

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
          unlocked
            ? current
              ? 'bg-amber-500/30 border-amber-400 animate-level-up'
              : 'bg-gray-700 border-gray-500'
            : 'bg-gray-900 border-gray-700 opacity-40'
        }`}>
          {unlocked ? milestone.emoji : '🔒'}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-8 mt-1 ${unlocked ? 'bg-gray-500' : 'bg-gray-800'}`} />
        )}
      </div>
      <div className={`pb-6 ${unlocked ? '' : 'opacity-40'}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{milestone.title}</span>
          {current && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Current</span>}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{milestone.desc}</div>
        <div className="text-xs text-gray-600 mt-0.5">Level {milestone.level}</div>
      </div>
    </div>
  );
}

function SkillStats({ name, icon, skill, total, color }) {
  const accuracy = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;
  const pct = (skill.masteredIds.length / total) * 100;
  const barGradients = {
    indigo: 'from-indigo-500 to-blue-400',
    purple: 'from-purple-500 to-pink-400',
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-white">{name}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className="text-lg font-bold text-white">{skill.masteredIds.length}</div>
          <div className="text-xs text-gray-500">Mastered</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">{accuracy}%</div>
          <div className="text-xs text-gray-500">Accuracy</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">{skill.total}</div>
          <div className="text-xs text-gray-500">Attempted</div>
        </div>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barGradients[color]} rounded-full xp-bar-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">{skill.masteredIds.length} / {total} mastered</div>
    </div>
  );
}

export default function ProgressView({ state, exportSave, importSave }) {
  const { player, skills } = state;
  const cls              = getPlayerClass(player.level);
  const fileInputRef     = useRef(null);
  const [saveMsg, setSaveMsg] = useState(null);  // { type: 'success'|'error', text }

  const nextMilestone  = CLASS_MILESTONES.find(m => m.level > player.level);
  const levelsToNext   = nextMilestone ? nextMilestone.level - player.level : 0;

  // ── Export reminder ──────────────────────────────────────
  const lastExportDate = localStorage.getItem('lexrise_last_export');
  const daysSinceExport = lastExportDate
    ? Math.floor((Date.now() - new Date(lastExportDate).getTime()) / 86400000)
    : null;
  // Warn after 5 days, urgent after 10 days
  const exportWarning = daysSinceExport === null
    ? 'never'
    : daysSinceExport >= 10 ? 'urgent'
    : daysSinceExport >= 5  ? 'warn'
    : null;

  const handleExport = () => {
    const result = exportSave();
    if (result.ok) {
      // Record export date for the reminder badge
      localStorage.setItem('lexrise_last_export', new Date().toISOString().split('T')[0]);
    }
    setSaveMsg(result.ok
      ? { type: 'success', text: '✅ Save file downloaded! Keep it somewhere safe.' }
      : { type: 'error',   text: `❌ Export failed: ${result.error}` }
    );
    setTimeout(() => setSaveMsg(null), 4000);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected
    try {
      const result = await importSave(file);
      setSaveMsg({ type: 'success', text: `✅ Progress restored for ${result.playerName}!` });
    } catch (err) {
      setSaveMsg({ type: 'error', text: `❌ ${err.message}` });
    }
    setTimeout(() => setSaveMsg(null), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-white">🗺️ Your Journey</h1>

      {/* Current status */}
      <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-700/40 rounded-2xl p-5 glow-gold">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{cls.emoji}</div>
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Current Rank</div>
            <div className="text-2xl font-bold text-white">{cls.title}</div>
            <div className="text-sm text-gray-400 mt-0.5">Level {player.level}</div>
            {nextMilestone && (
              <div className="text-xs text-amber-300 mt-1">
                {levelsToNext} more level{levelsToNext !== 1 ? 's' : ''} to <strong>{nextMilestone.title}</strong> {nextMilestone.emoji}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skill stats */}
      <section>
        <h2 className="font-bold text-white mb-3">📊 Skill Stats</h2>
        <div className="space-y-3">
          <SkillStats name="Vocabulary Forge" icon="📖" skill={skills.vocabulary} total={VOCAB_WORDS.length} color="indigo" />
          <SkillStats name="Grammar Dojo" icon="✍️" skill={skills.grammar} total={GRAMMAR_CHALLENGES.length} color="purple" />
        </div>
      </section>

      {/* Overall stats */}
      <section>
        <h2 className="font-bold text-white mb-3">🏅 Overall Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Questions', value: player.totalQuestionsAnswered, icon: '❓' },
            { label: 'Total Correct', value: player.totalCorrect, icon: '✅' },
            { label: 'Gems Earned', value: player.gems, icon: '💎' },
            { label: 'Best Streak', value: player.longestStreak, icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestone path */}
      <section>
        <h2 className="font-bold text-white mb-4">⚔️ Rank Path</h2>
        <div className="pl-2">
          {CLASS_MILESTONES.map((m, i) => (
            <MilestoneNode
              key={m.level}
              milestone={m}
              currentLevel={player.level}
              isLast={i === CLASS_MILESTONES.length - 1}
            />
          ))}
        </div>
      </section>

      {/* SAT countdown */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center">
        <div className="text-2xl mb-2">🎯</div>
        <div className="font-bold text-white">SAT Goal Tracker</div>
        <div className="text-sm text-gray-400 mt-1">Rising Freshman → SAT in ~3 years</div>
        <div className="mt-3 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full xp-bar-fill"
            style={{ width: `${Math.min(100, (player.level / 50) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">Level {player.level} / 50 — {Math.round((player.level / 50) * 100)}% of the journey</div>
      </div>

      {/* ── Save Management ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">💾 Save Management</h2>
          {exportWarning && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              exportWarning === 'urgent' ? 'bg-red-900/60 text-red-300 border border-red-700/50 animate-pulse'
              : exportWarning === 'warn'  ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
            }`}>
              {exportWarning === 'never'  ? '⚠️ Never exported'
               : exportWarning === 'urgent' ? `🔴 ${daysSinceExport}d since export`
               : `⚠️ ${daysSinceExport}d since export`}
            </span>
          )}
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4">

          {/* Dynamic iOS warning */}
          {exportWarning ? (
            <div className={`rounded-xl p-3 ${
              exportWarning === 'urgent'
                ? 'bg-red-900/30 border border-red-700/50'
                : 'bg-amber-900/20 border border-amber-700/40'
            }`}>
              <div className={`text-xs font-bold mb-1 ${
                exportWarning === 'urgent' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {exportWarning === 'urgent' ? '🔴 Backup Overdue!' : exportWarning === 'never' ? '⚠️ No Backup Yet' : '⚠️ Backup Recommended'}
              </div>
              <div className="text-xs text-gray-300 leading-relaxed">
                {exportWarning === 'never'
                  ? 'You haven\'t exported your save yet. iOS Safari may clear app data after 7 days of inactivity. Export now to protect your progress.'
                  : exportWarning === 'urgent'
                  ? `It\'s been ${daysSinceExport} days since your last backup. Export your save now before iOS clears your data.`
                  : `Last exported ${daysSinceExport} days ago. Consider downloading a fresh backup to stay safe.`
                }
              </div>
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-3">
              <div className="text-xs font-bold text-green-400 mb-1">✅ Backup Up-to-Date</div>
              <div className="text-xs text-gray-400">
                Last exported {daysSinceExport === 0 ? 'today' : `${daysSinceExport} day${daysSinceExport !== 1 ? 's' : ''} ago`}.
                Your progress is backed up. Export again before any long break.
              </div>
            </div>
          )}

          {/* Export */}
          <div>
            <div className="text-sm font-semibold text-white mb-1">Export Save</div>
            <div className="text-xs text-gray-400 mb-3">
              Downloads your progress as a <code className="text-indigo-400">.json</code> file.
              Save it to iCloud Drive, Notes, or email it to yourself.
            </div>
            <button
              onClick={handleExport}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-indigo-500 transition-all btn-press flex items-center justify-center gap-2"
            >
              <span>📥</span> Download Save File
            </button>
          </div>

          <div className="border-t border-gray-700" />

          {/* Import */}
          <div>
            <div className="text-sm font-semibold text-white mb-1">Restore Save</div>
            <div className="text-xs text-gray-400 mb-3">
              Select a previously exported <code className="text-indigo-400">lexrise-save-*.json</code> file to restore your progress.
              <span className="text-red-400"> This will overwrite your current progress.</span>
            </div>
            <button
              onClick={handleImportClick}
              className="w-full py-3 rounded-xl bg-gray-700 border border-gray-600 text-white font-semibold text-sm hover:bg-gray-600 transition-all btn-press flex items-center justify-center gap-2"
            >
              <span>📤</span> Restore from File
            </button>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Status message */}
          {saveMsg && (
            <div className={`rounded-xl p-3 text-sm animate-fade-in ${
              saveMsg.type === 'success'
                ? 'bg-green-900/40 border border-green-700/50 text-green-300'
                : 'bg-red-900/40 border border-red-700/50 text-red-300'
            }`}>
              {saveMsg.text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
