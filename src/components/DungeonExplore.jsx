// ============================================================
// DungeonExplore — Full Dungeon System with Procedural Map
//
// FLOW:
//  select          → dungeon list (choose which dungeon)
//  confirm         → "no exit" warning before committing
//  map             → interactive path map (hub between encounters)
//  pre_battle      → enemy reveal + pre-fight info
//  battle          → Q&A combat
//  scroll_node     → single-question reward (no HP risk)
//  camp_node       → HP restore or study option
//  node_complete   → reward screen after encounter
//  dungeon_complete→ boss defeated, run finished
//  game_over       → HP = 0
//
// NO EXIT RULE:
//  On confirm, preDungeonSnapshot saved to hook state.
//  "Abandon" button restores snapshot (lose all run progress).
// ============================================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  DUNGEONS, getDungeon, getVisibleDungeons, isDungeonUnlocked,
  getDungeonQuestionConfig, pickDungeonEnemy, checkStudyGate,
} from '../data/rpg/dungeons';
import { VOCAB_WORDS, GRAMMAR_CHALLENGES } from '../data/index';
import { ALL_PASSAGES } from '../data/reading/index';
import { POTIONS_MAP } from '../data/rpg/items';
import { generateMap, getAvailableNodes, getNodeDifficulty, generateRunSeed, getNumPaths, getNumRows, NODE_TYPES } from '../utils/mapGen';
import { shuffleInPlace, shuffled, shuffleOptionsPreservingAnswer } from '../utils/shuffle';

// ── Daily focus: cycles vocab → grammar → reading each day ────
const DAILY_FOCUS = (() => {
  const day = Math.floor(Date.now() / 86400000);
  return ['vocab', 'grammar', 'reading'][day % 3];
})();
const FOCUS_LABEL = { vocab: '📖 Vocab', grammar: '✍️ Grammar', reading: '📜 Reading' };
import EnemySprite from './EnemySprite';
import DungeonMap from './DungeonMap';

// ── Question pool ────────────────────────────────────────────
function buildPool(dungeon) {
  const { tiers, types } = getDungeonQuestionConfig(dungeon);
  let pool = [];
  if (types.includes('vocab')) {
    let words = VOCAB_WORDS;
    if (tiers?.length) words = words.filter(w => tiers.includes(w.tier));
    pool.push(...words.map(w => ({ ...w, qtype: 'vocab' })));
  }
  if (types.includes('grammar')) {
    pool.push(...GRAMMAR_CHALLENGES.map(g => ({ ...g, qtype: 'grammar' })));
  }
  if (types.includes('reading')) {
    let passages = ALL_PASSAGES;
    if (tiers?.length) passages = passages.filter(p => tiers.includes(p.tier));
    passages.forEach(p => {
      const snippet = p.passage.length > 380 ? p.passage.slice(0, 380) + '…' : p.passage;
      p.questions.forEach(q => pool.push({ ...q, qtype: 'reading', passage: snippet, passageTitle: p.title }));
    });
  }
  return shuffleInPlace(pool);
}

// ── Unbiased shuffle helpers live in utils/shuffle.js ─────────
// We import shuffleInPlace, shuffled, and shuffleOptionsPreservingAnswer
// from there so VocabForge, GrammarDojo, ReadingCitadel, BossBattle, and
// DungeonExplore all use the same implementation (and in particular the
// same "B-bias" correction — 71% of authored answers land at index 1).

function pickQuestions(pool, n, usedIds) {
  const fresh = pool.filter(q => !usedIds.has(q.id));
  const src = fresh.length >= n ? fresh : pool;
  // Unbiased Fisher-Yates pick, then shuffle each question's options so the
  // correct-answer index is uniform across A/B/C/D.
  return shuffled(src).slice(0, n).map(shuffleOptionsPreservingAnswer);
}

function encounterLength(enemy, difficulty) {
  const hp = Math.round(enemy.hp * (difficulty.hpMult ?? 1));
  return Math.min(Math.ceil(hp / 6) + 2, 12);
}

// ── Colours ───────────────────────────────────────────────────
const TYPE_COLOR = { vocab: 'text-indigo-400', grammar: 'text-purple-400', reading: 'text-cyan-400' };
const TYPE_LABEL = { vocab: '📖 Vocab', grammar: '✍️ Grammar', reading: '📜 Reading' };
const TYPE_BG    = { vocab: 'bg-indigo-900/30 border-indigo-700/50', grammar: 'bg-purple-900/30 border-purple-700/50', reading: 'bg-cyan-900/30 border-cyan-700/50' };

// ── Shared sub-components ─────────────────────────────────────
function HpBar({ current, max, label }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const bar = pct > 50 ? 'from-green-600 to-green-400' : pct > 25 ? 'from-yellow-600 to-yellow-400' : 'from-red-700 to-red-500';
  return (
    <div>
      {label && <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{label}</span><span>{Math.max(0,current)}/{max}</span></div>}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        {/* Ghost fill — lags behind the real fill so the chunk of HP you
            just lost stays visible for ~1s as a translucent red block. */}
        <div
          className="absolute inset-y-0 left-0 hp-ghost-fill bg-red-900/60"
          style={{ width: `${pct}%` }}
        />
        {/* Real fill — instant-ish, reflects actual HP */}
        <div
          className={`relative h-full bg-gradient-to-r ${bar} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * FloatingDamage — transient combat number that rises from a point on
 * the enemy sprite. Used for both damage dealt (red) and XP gained
 * (amber). The parent key-swaps these via a Math.random() id so each
 * number replays the keyframes even when the value is identical.
 */
function FloatingDamage({ value, kind = 'damage', x = '50%' }) {
  const color = kind === 'damage' ? 'text-red-300'
              : kind === 'xp'     ? 'text-amber-300'
              :                     'text-white';
  const sign  = kind === 'damage' ? '-' : '+';
  return (
    <div
      className={`absolute pointer-events-none animate-combat-float font-black ${color}`}
      style={{
        left: x,
        top: '20%',
        fontSize: 'var(--t-title)',
        textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)',
      }}
    >
      {sign}{value}{kind === 'xp' ? ' XP' : ''}
    </div>
  );
}

// ── Dungeon Select ────────────────────────────────────────────
function DungeonSelectScreen({ state, rpgStats, onEnter, onBack }) {
  const { dungeonProgress = {}, skills } = state;
  const playerLevel = state.player.level;
  const visible = getVisibleDungeons(dungeonProgress);
  const toShow = visible.length ? visible : [DUNGEONS[0]];

  function statusOf(d) {
    const p = dungeonProgress[d.id];
    if (!p) return isDungeonUnlocked(d, dungeonProgress, playerLevel, skills) ? 'unlocked' : 'locked';
    if (p.bossDefeated) return 'completed';
    if (p.floorsCleared > 0) return 'in_progress';
    return isDungeonUnlocked(d, dungeonProgress, playerLevel, skills) ? 'unlocked' : 'locked';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm transition-colors">← Back</button>
        <h1 className="text-xl font-bold text-white">⚔️ Choose Dungeon</h1>
      </div>

      {/* Daily focus banner */}
      <div className="bg-amber-950/50 border border-amber-700/60 rounded-xl p-3 mb-3 flex items-center gap-2">
        <span className="text-lg">⭐</span>
        <div>
          <span className="text-xs font-bold text-amber-400">Today's Focus: {FOCUS_LABEL[DAILY_FOCUS]}</span>
          <span className="text-xs text-gray-400 ml-2">— questions earn 2× XP</span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 mb-5 flex gap-2 text-xs text-red-300">
        <span className="flex-shrink-0">⚠️</span>
        <span>Once you enter a dungeon, <strong>you cannot exit without losing all run progress</strong>. Retreating restores your pre-run state.</span>
      </div>

      {/* Player status */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 mb-5 flex items-center gap-4">
        <div className="flex-1">
          <HpBar current={rpgStats.hp} max={rpgStats.maxHp} label={`❤️ HP  •  ⚔️ ATK ${rpgStats.totalAttack}  •  🛡️ DEF ${rpgStats.totalDefense}`} />
        </div>
        <div className="text-xs text-amber-400 font-bold whitespace-nowrap">Lv {playerLevel}</div>
      </div>

      <div className="space-y-3">
        {toShow.map(d => {
          const status = statusOf(d);
          const locked = status === 'locked';
          const completed = status === 'completed';
          const prog   = dungeonProgress[d.id];
          // Run the gate even when the dungeon is already unlocked so we
          // can still show the progress indicator. It's cheap.
          const gate = checkStudyGate(d, skills);
          // Distinguish "locked by study gate" from "locked by player level"
          // so we can render the right hint.
          const blockedByStudy = locked && gate && gate.requirements.length > 0 && !gate.met
            && playerLevel >= d.requiredLevel
            && (!d.requiredDungeonId || dungeonProgress[d.requiredDungeonId]?.bossDefeated);

          return (
            <button
              key={d.id}
              disabled={locked}
              onClick={() => !locked && onEnter(d.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                locked
                  ? 'bg-gray-900/40 border-gray-700/40 opacity-50 cursor-not-allowed'
                  : completed
                    ? `bg-gradient-to-br ${d.bgGradient} ${d.borderColor} opacity-90 card-hover btn-press`
                    : `bg-gradient-to-br ${d.bgGradient} ${d.borderColor} card-hover btn-press`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${locked ? 'opacity-30' : ''}`}>{locked ? '🔒' : d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{d.name}</span>
                    {d.isDLC && <span className="text-xs bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 px-2 py-0.5 rounded-full">DLC</span>}
                    {completed && <span className="text-xs text-green-400 font-bold">✅ Cleared</span>}
                    {prog?.runCount > 1 && <span className="text-[10px] text-gray-500">· {prog.runCount} runs</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{d.subtitle}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>🗺️ {getNumRows(d.order ?? 1) - 1} floors</span>
                    <span>Lv {d.requiredLevel}+</span>
                    <span className="text-amber-400">+{d.completionXP} XP</span>
                    <span className="text-cyan-400">+{d.completionGems} 💎</span>
                  </div>

                  {locked && !blockedByStudy && (
                    <div className="text-xs text-amber-400 mt-1">
                      🔒 {playerLevel < d.requiredLevel
                        ? `Reach Level ${d.requiredLevel} first`
                        : 'Clear the previous dungeon first'}
                    </div>
                  )}

                  {blockedByStudy && (
                    <div className="mt-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/50">
                      <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                        📚 Study Mastery Required
                      </div>
                      <div className="space-y-1">
                        {gate.requirements.map(r => (
                          <div key={r.category} className="flex items-center gap-2 text-[11px]">
                            <span className={r.met ? 'text-green-400' : 'text-amber-400'}>
                              {r.met ? '✓' : '○'}
                            </span>
                            <span className="text-gray-300 flex-1">
                              {r.label}
                            </span>
                            <span className={`font-mono ${r.met ? 'text-green-400' : 'text-gray-400'}`}>
                              {r.current}/{r.target}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 text-[10px] text-gray-500 italic">
                        Study via the 📚 Study tab to unlock.
                      </div>
                    </div>
                  )}

                  {/* Even unlocked dungeons can show a tiny gate progress
                      summary so users see what's coming for the next tier. */}
                  {!locked && gate && gate.tierRequired && !gate.met && (
                    <div className="mt-1 text-[10px] text-indigo-400/70">
                      {gate.requirements.filter(r => r.met).length}/{gate.requirements.length} study requirements met
                    </div>
                  )}
                </div>

                {/* Run-again chip for cleared dungeons — shown on the right
                    side so the whole card stays clickable but the action is
                    unambiguous: "yes, re-enter this one". Farm XP is
                    automatically scaled down by getDungeonFarmMultiplier. */}
                {completed && (
                  <div className="flex-shrink-0 self-center flex flex-col items-center">
                    <div className="px-3 py-2 rounded-lg bg-indigo-900/60 border border-indigo-600/70 text-indigo-200 text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                      🔁 Run Again →
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">farm mode</div>
                  </div>
                )}
              </div>
              {!locked && !completed && <div className="mt-2 text-xs text-gray-500 italic leading-relaxed">{d.tipText}</div>}
              {completed && (
                <div className="mt-2 text-xs text-green-400/70 italic leading-relaxed">
                  ✨ Cleared! Re-running gives reduced XP but keeps your gear and unlocks farm mode.
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Confirm Entry Screen ──────────────────────────────────────
function ConfirmScreen({ dungeon, onConfirm, onBack }) {
  const numFloors = getNumRows(dungeon.order ?? 1) - 1;
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-900/60 rounded-2xl p-8 text-center"
           style={{ boxShadow: '0 0 40px rgba(239,68,68,0.1)' }}>
        <div className="text-6xl mb-4 animate-float">{dungeon.emoji}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{dungeon.name}</h2>
        <p className="text-sm text-gray-400 mb-6">{dungeon.subtitle}</p>

        <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">⚠️ Rules of the Dungeon</div>
          {[
            ['🗺️', `${numFloors} procedurally generated floors — the path changes every run`],
            ['⚔️', 'Answer questions to fight enemies — wrong answers deal damage'],
            ['🚪', 'Exiting mid-run restores your pre-run XP, level, and gems'],
            ['🏕️', 'Rest Sites restore HP. Scroll nodes give free XP (no combat)'],
            ['👑', 'Defeat the Boss on the final floor to complete the dungeon'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-start gap-2 text-xs text-gray-300">
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onBack}
            className="flex-1 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold transition-all btn-press hover:bg-gray-700">
            ← Back
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-700 to-orange-600 text-white font-bold text-lg transition-all btn-press hover:from-red-600"
            style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
            ⚔️ Enter!
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Camp Node Screen — SM-2 spaced repetition review ─────────
function CampScreen({ rpgStats, vocabSM2 = {}, vocabWords = [], onHeal, onContinue }) {
  const [mode, setMode]         = useState('choice');   // choice | review | done
  const [words, setWords]       = useState([]);
  const [wIdx, setWIdx]         = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory]   = useState([]);         // true/false per word

  const flatHeal = Math.floor(rpgStats.maxHp * 0.35);

  // Words due for SM-2 review right now
  const dueWords = (() => {
    const now = Date.now();
    return vocabWords.filter(w => {
      const sm = vocabSM2[w.id];
      return sm && sm.nextReview <= now;
    }).slice(0, 5);
  })();
  const hasDue = dueWords.length >= 2;

  function startReview() {
    // Shuffle the option order per word so review doesn't reward positional
    // memory from the pool's original authoring bias.
    setWords(dueWords.map(shuffleOptionsPreservingAnswer));
    setWIdx(0);
    setSelected(null);
    setFeedback(null);
    setHistory([]);
    setMode('review');
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    const w = words[wIdx];
    const ok = idx === w.answer;
    setSelected(idx);
    setFeedback(ok ? 'correct' : 'wrong');
    setHistory(h => [...h, ok]);
  }

  function nextWord() {
    if (wIdx + 1 >= words.length) {
      const correct = history.filter(Boolean).length + (feedback === 'correct' ? 1 : 0);
      const pct     = correct / words.length;
      const heal    = Math.round(rpgStats.maxHp * 0.65 * pct);
      if (heal > 0) onHeal(heal);
      setMode('done');
    } else {
      setWIdx(i => i + 1);
      setSelected(null);
      setFeedback(null);
    }
  }

  // ── Choice ────────────────────────────────────────────────
  if (mode === 'choice') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏕️</div>
          <h2 className="text-xl font-bold text-white">Rest Site</h2>
          <p className="text-sm text-gray-400 mt-1">A moment of quiet before the next battle.</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-5">
          <HpBar current={rpgStats.hp} max={rpgStats.maxHp} label="❤️ Current HP" />
        </div>

        <div className="space-y-3">
          {hasDue ? (
            <button onClick={startReview}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-amber-700 to-yellow-600 text-white transition-all btn-press text-left">
              <div className="font-bold text-lg">📚 Review Due Words</div>
              <div className="text-sm opacity-80 mt-0.5">
                {dueWords.length} words overdue · Heal up to {Math.round(rpgStats.maxHp * 0.65)} HP based on accuracy
              </div>
            </button>
          ) : null}

          <button onClick={() => { onHeal(flatHeal); onContinue(); }}
            className={`w-full p-5 rounded-2xl text-white transition-all btn-press text-left ${
              hasDue
                ? 'bg-gray-800 border border-gray-600'
                : 'bg-gradient-to-r from-green-700 to-emerald-600'
            }`}>
            <div className="font-bold text-lg">🩹 {hasDue ? 'Just Rest' : 'Rest & Recover'}</div>
            <div className="text-sm opacity-70 mt-0.5">Restore {flatHeal} HP · Skip review</div>
          </button>
        </div>
      </div>
    );
  }

  // ── Review ────────────────────────────────────────────────
  if (mode === 'review') {
    const w = words[wIdx];
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-amber-400">📚 Word Review</span>
          <span className="text-xs text-gray-400">{wIdx + 1} / {words.length}</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-5">
          {words.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < history.length
                ? history[i] ? 'bg-green-500' : 'bg-red-500'
                : i === wIdx ? 'bg-amber-400' : 'bg-gray-700'
            }`} />
          ))}
        </div>

        <div className={`bg-gray-900 border rounded-2xl p-5 mb-4 ${
          feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-amber-700/40'
        }`}>
          <div className="text-center mb-4">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
              Spaced Repetition · Due for Review
            </div>
            {w.word && <div className="text-3xl font-bold text-white">{w.word}</div>}
            {w.partOfSpeech && <div className="text-xs text-gray-500 mt-1">{w.partOfSpeech}</div>}
            {w.sentence && (
              <div className="mt-3 bg-gray-800/70 border border-gray-700 rounded-xl p-3 text-left">
                <div className="text-xs text-gray-500 mb-1">In context</div>
                <div className="text-sm text-gray-300 italic">"{w.sentence}"</div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-100 font-semibold mb-3">🤔 {w.question}</div>

          <div className="space-y-2">
            {(w.options ?? []).map((opt, idx) => {
              let cls = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700';
              if (selected !== null) {
                if (idx === w.answer)                   cls = 'bg-green-900/60 border-green-500 text-green-200';
                else if (idx === selected)              cls = 'bg-red-900/60 border-red-500 text-red-200';
                else                                    cls = 'bg-gray-800/40 border-gray-700 text-gray-500';
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all btn-press ${cls}`}>
                  <span className="inline-block w-6 text-center mr-2 opacity-60 font-bold">{['A','B','C','D'][idx]}</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && w.explanation && (
            <div className={`mt-3 p-3 rounded-xl text-xs animate-fade-in ${
              feedback === 'correct'
                ? 'bg-green-900/40 border border-green-700 text-green-200'
                : 'bg-red-900/40 border border-red-700 text-red-200'
            }`}>
              <div className="font-semibold mb-1">{feedback === 'correct' ? '✅ Correct!' : '❌ Wrong —'}</div>
              <div className="leading-relaxed opacity-90">{w.explanation}</div>
            </div>
          )}
        </div>

        {selected !== null && (
          <button onClick={nextWord}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all btn-press ${
              feedback === 'correct'
                ? 'bg-gradient-to-r from-green-700 to-emerald-600'
                : 'bg-gradient-to-r from-indigo-700 to-purple-600'
            }`}>
            {wIdx + 1 >= words.length ? '🏕️ Finish Review' : 'Next Word →'}
          </button>
        )}
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────
  if (mode === 'done') {
    const correct  = history.filter(Boolean).length;
    const pct      = Math.round((correct / words.length) * 100);
    const healGiven = Math.round(rpgStats.maxHp * 0.65 * (correct / words.length));
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
        <div className="text-5xl mb-3">✨</div>
        <h2 className="text-xl font-bold text-white mb-1">Review Complete</h2>
        <p className="text-sm text-gray-400 mb-5">{correct}/{words.length} correct — {pct}% accuracy</p>

        <div className="bg-green-900/30 border border-green-700/40 rounded-2xl p-5 mb-5">
          <div className="text-2xl font-bold text-green-400">+{healGiven} HP restored</div>
          <div className="text-xs text-gray-400 mt-1">Proportional to your accuracy</div>
        </div>

        <button onClick={onContinue}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-700 to-purple-600 transition-all btn-press">
          🗺️ Back to Map →
        </button>
      </div>
    );
  }

  return null;
}

// ── Main DungeonExplore ───────────────────────────────────────
export default function DungeonExplore({
  state, rpgStats,
  awardXP, recordWrong, updateQuestProgress,
  takeDamage, healPlayer, usePotion,
  startDungeonRun, abandonDungeonRun, completeDungeonNode, finishDungeonRun,
  equippedWeaponId, equippedArmorId,
  onBack,
}) {
  // ── Phase ───────────────────────────────────────────────────
  const [phase, setPhase]       = useState('select');
  const [pendingDungeon, setPending] = useState(null); // id awaiting confirm

  // ── Run state (local — mirrors what's in hook but fast) ────
  const [activeMap, setActiveMap]       = useState(null);  // generated map
  const [dungeonId, setDungeonId]       = useState(null);
  const [visitedIds, setVisitedIds]     = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [pendingNodeId, setPendingNodeId] = useState(null); // node clicked, about to enter

  // ── Combat state ────────────────────────────────────────────
  const [enemy, setEnemy]           = useState(null);
  const [difficulty, setDiff]       = useState({ hpMult: 1, xpMult: 1, gemMult: 1, tierBoost: 0 });
  const [enemyHp, setEnemyHp]       = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [isBossNode, setIsBossNode] = useState(false);
  const [questions, setQuestions]   = useState([]);
  const [qIdx, setQIdx]             = useState(0);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState(null);
  const [combatLog, setCombatLog]   = useState([]);
  const [nodeXP, setNodeXP]         = useState(0);
  const [nodeGems, setNodeGems]     = useState(0);
  const [weakCategory, setWeakCategory] = useState(null); // boss uses player's weakest category

  // ── Tier 2 combat feel ──────────────────────────────────────
  // Hit flash: when the player lands a correct answer, flip this to the
  // enemy's current hitId briefly so the sprite runs animate-enemy-hit.
  const [hitId, setHitId]               = useState(0);
  // Floating damage / XP numbers over the enemy sprite. Each entry has a
  // unique id so React can replay the keyframes when values repeat.
  const [floaters, setFloaters]         = useState([]);

  // Helper: spawn a floating number; auto-clears after the animation ends.
  const spawnFloater = useCallback((value, kind = 'damage') => {
    const id = Math.random().toString(36).slice(2);
    setFloaters(f => [...f, { id, value, kind, x: `${42 + Math.random() * 16}%` }]);
    setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 1200);
  }, []);

  // ── Educational mechanics refs ──────────────────────────────
  // Wrong-answer revenge queue — questions come back after 3 correct
  const revengeQueueRef        = useRef([]);
  const correctSinceRevengeRef = useRef(0);
  // Track wrong answers per category to feed boss fights
  const wrongCategoriesRef     = useRef({});  // { vocab: N, grammar: N, reading: N }

  // ── Question pool (whole run) ───────────────────────────────
  const poolRef   = useRef([]);
  const usedRef   = useRef(new Set());

  const dungeon  = dungeonId ? getDungeon(dungeonId) : null;
  const totalAtk = rpgStats.totalAttack;
  const totalDef = rpgStats.totalDefense;
  const curHp    = rpgStats.hp;
  const maxHp    = rpgStats.maxHp;

  // ── Available nodes (derived from map + visited + current) ──
  // Passing currentNodeId locks alternate forks once the player commits.
  const availableIds = useMemo(() => {
    if (!activeMap) return [];
    return getAvailableNodes(activeMap, visitedIds, currentNodeId);
  }, [activeMap, visitedIds, currentNodeId]);

  // ── 1. Enter dungeon (after confirm) ──────────────────────
  const enterDungeon = useCallback((id) => {
    const d = getDungeon(id);
    if (!d) return;
    const seed     = generateRunSeed();
    const numPaths = getNumPaths(d.order ?? 1);
    const numRows  = getNumRows(d.order ?? 1);
    const map      = generateMap(seed, numPaths, numRows);
    poolRef.current          = buildPool(d);
    usedRef.current          = new Set();
    revengeQueueRef.current  = [];
    wrongCategoriesRef.current = {};
    correctSinceRevengeRef.current = 0;
    setActiveMap(map);
    setDungeonId(id);
    setVisitedIds([]);
    setCurrentNodeId(null);
    setWeakCategory(null);
    startDungeonRun(id, seed);
    setPhase('map');
  }, [startDungeonRun]);

  // ── 2. Player taps a node on the map ──────────────────────
  const handleNodeSelect = useCallback((nodeId) => {
    if (!activeMap) return;
    const node = activeMap.nodes[nodeId];
    if (!node) return;
    setPendingNodeId(nodeId);

    if (node.type === 'camp') {
      setPhase('camp_node');
    } else if (node.type === 'scroll') {
      // Pick 1 question, show it
      const qs = pickQuestions(poolRef.current, 1, usedRef.current);
      qs.forEach(q => usedRef.current.add(q.id));
      setQuestions(qs);
      setQIdx(0);
      setSelected(null);
      setFeedback(null);
      setNodeXP(0);
      setNodeGems(0);
      setPhase('scroll_node');
    } else {
      // Monster / Elite / Boss — set up combat
      const diff = getNodeDifficulty(node.type);
      setDiff(diff);
      const isBoss = node.type === 'boss';
      setIsBossNode(isBoss);
      const foe = pickDungeonEnemy(dungeon, isBoss);
      if (!foe) return;
      const scaledHp = Math.round(foe.hp * diff.hpMult);
      const nQ = encounterLength(foe, diff);

      // Boss: pull questions from the player's weakest category
      let qs;
      if (isBoss) {
        const cats = wrongCategoriesRef.current;
        const sorted = Object.entries(cats).sort(([,a],[,b]) => b - a);
        const weak = sorted[0]?.[0] ?? null;
        setWeakCategory(weak);
        if (weak) {
          const weakPool = poolRef.current.filter(q => q.qtype === weak);
          qs = pickQuestions(weakPool.length >= nQ ? weakPool : poolRef.current, nQ, usedRef.current);
        } else {
          qs = pickQuestions(poolRef.current, nQ, usedRef.current);
        }
      } else {
        setWeakCategory(null);
        qs = pickQuestions(poolRef.current, nQ, usedRef.current);
      }

      qs.forEach(q => usedRef.current.add(q.id));
      revengeQueueRef.current = [];          // fresh queue per encounter
      correctSinceRevengeRef.current = 0;
      setEnemy({ ...foe, hp: scaledHp, xpReward: Math.round(foe.xpReward * diff.xpMult), gemReward: Math.round(foe.gemReward * diff.gemMult) });
      setEnemyHp(scaledHp);
      setEnemyMaxHp(scaledHp);
      setQuestions(qs);
      setQIdx(0);
      setSelected(null);
      setFeedback(null);
      setCombatLog([]);
      setNodeXP(0);
      setNodeGems(0);
      setPhase('pre_battle');
    }
  }, [activeMap, dungeon]);

  // ── 3. Mark a node as visited, advance ────────────────────
  const markNodeComplete = useCallback((nodeId) => {
    setVisitedIds(v => [...v, nodeId]);
    setCurrentNodeId(nodeId);
    completeDungeonNode(nodeId);
  }, [completeDungeonNode]);

  // ── Combat: handle answer ─────────────────────────────────
  const handleAnswer = useCallback((idx) => {
    if (selected !== null) return;
    const q         = questions[qIdx];
    const correct   = idx === q.answer;
    const isRevenge = q._revenge === true;
    const dailyMult = q.qtype === DAILY_FOCUS ? 2 : 1;
    setSelected(idx);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      correctSinceRevengeRef.current++;
      const dmg    = Math.max(5, totalAtk);
      const newEHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newEHp);
      // Tier 2 feedback: flash + shake the sprite, and float a damage
      // number plus an XP badge off the enemy position.
      setHitId(id => id + 1);
      spawnFloater(dmg, 'damage');
      setCombatLog(l => [`⚔️ Hit! ${enemy?.name} takes ${dmg} dmg.`, ...l.slice(0,2)]);
      const baseXP  = q.xp || 15;
      const xpGained = Math.round(baseXP * dailyMult);
      // Delay the XP floater slightly so numbers stagger, not overlap.
      setTimeout(() => spawnFloater(xpGained, 'xp'), 160);
      setNodeXP(x => x + xpGained);
      setNodeGems(g => g + Math.floor(xpGained / 10));
      const skill = q.qtype === 'vocab' ? 'vocabulary' : q.qtype === 'reading' ? 'reading' : 'grammar';
      awardXP(xpGained, skill, q.id);
      updateQuestProgress(q.qtype === 'vocab' ? 'vocab' : q.qtype);
      updateQuestProgress('any');
      if (newEHp <= 0) { setTimeout(() => setPhase('node_complete'), 500); return; }
    } else {
      correctSinceRevengeRef.current = 0;
      // Queue wrong questions for revenge (skip if already a revenge question)
      // We shuffle the options so the next appearance won't reward positional
      // memory — the user must recognize the content.
      if (!isRevenge) {
        const revenge = shuffleOptionsPreservingAnswer(q);
        revengeQueueRef.current.push({ ...revenge, _revenge: true });
        // Track weak category for boss fights
        wrongCategoriesRef.current[q.qtype] = (wrongCategoriesRef.current[q.qtype] || 0) + 1;
      }
      const dmg = Math.max(1, (enemy?.attack ?? 5) - totalDef);
      takeDamage(dmg);
      setCombatLog(l => [`💥 ${enemy?.name} hits you for ${dmg}!`, ...l.slice(0,2)]);
      recordWrong(q.qtype === 'vocab' ? 'vocabulary' : 'grammar');
      if (curHp - dmg <= 0) { setTimeout(() => setPhase('game_over'), 500); return; }
    }
  }, [selected, questions, qIdx, enemyHp, totalAtk, totalDef, curHp, enemy, awardXP, updateQuestProgress, takeDamage, recordWrong, spawnFloater]);

  const nextQuestion = useCallback(() => {
    const nextIdx = qIdx + 1;

    // After 3 correct in a row, surface a revenge question
    if (correctSinceRevengeRef.current >= 3 && revengeQueueRef.current.length > 0) {
      const revengeQ = revengeQueueRef.current.shift();
      correctSinceRevengeRef.current = 0;
      setQuestions(prev => {
        const copy = [...prev];
        copy.splice(nextIdx, 0, revengeQ);
        return copy;
      });
      setQIdx(nextIdx);
      setSelected(null);
      setFeedback(null);
      return;
    }

    if (nextIdx >= questions.length) {
      if (enemyHp > 0) {
        setNodeXP(x => Math.floor(x * 0.6));
        setNodeGems(g => Math.floor(g * 0.6));
      }
      setPhase('node_complete');
    } else {
      setQIdx(nextIdx);
      setSelected(null);
      setFeedback(null);
    }
  }, [qIdx, questions.length, enemyHp]);

  // ── After node complete: check boss / dungeon end ─────────
  const continueFromNode = useCallback(() => {
    markNodeComplete(pendingNodeId);
    if (isBossNode) {
      // Dungeon finished!
      finishDungeonRun(dungeonId, dungeon?.completionXP ?? 500, dungeon?.completionGems ?? 100);
      setPhase('dungeon_complete');
    } else {
      setPhase('map');
    }
  }, [pendingNodeId, isBossNode, markNodeComplete, finishDungeonRun, dungeonId, dungeon]);

  // ── Abandon (no exit) ────────────────────────────────────
  const handleAbandon = useCallback(() => {
    if (!window.confirm('⚠️ Abandoning will restore your pre-run stats (lose all XP/gems earned this run). Continue?')) return;
    abandonDungeonRun();
    setPhase('select');
    setDungeonId(null);
    setActiveMap(null);
    setVisitedIds([]);
  }, [abandonDungeonRun]);

  // ── Scroll node: single question answer ──────────────────
  const handleScrollAnswer = useCallback((idx) => {
    if (selected !== null || !questions[0]) return;
    const q = questions[0];
    const correct = idx === q.answer;
    setSelected(idx);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      const xp = Math.round((q.xp || 15) * 1.3); // scrolls give bonus XP
      setNodeXP(xp);
      awardXP(xp, q.qtype === 'vocab' ? 'vocabulary' : q.qtype === 'reading' ? 'reading' : 'grammar', q.id);
      updateQuestProgress(q.qtype === 'vocab' ? 'vocab' : q.qtype);
      updateQuestProgress('any');
    }
  }, [selected, questions, awardXP, updateQuestProgress]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  // ── SELECT ────────────────────────────────────────────────
  if (phase === 'select') {
    return <DungeonSelectScreen state={state} rpgStats={rpgStats} onEnter={(id) => { setPending(id); setPhase('confirm'); }} onBack={onBack} />;
  }

  // ── CONFIRM ───────────────────────────────────────────────
  if (phase === 'confirm' && pendingDungeon) {
    const d = getDungeon(pendingDungeon);
    if (!d) return null;
    return <ConfirmScreen dungeon={d} onConfirm={() => enterDungeon(pendingDungeon)} onBack={() => setPhase('select')} />;
  }
  // Confirm screen without dungeon set — recover
  if (phase === 'confirm') { setPhase('select'); return null; }

  // ── MAP ───────────────────────────────────────────────────
  if (phase === 'map') {
    return (
      // Full-width (no max-w constraint) so the SVG map uses the real viewport.
      // Previously `max-w-2xl` clamped the container to 672px while the inner
      // <svg width="100%" viewBox="0 0 svgW ..."> kept a svgW sized for the
      // full window → the browser scaled everything down, producing a
      // "squished" node map with tiny nodes.
      <div className="w-full flex flex-col animate-fade-in"
           style={{ height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 120px)' }}>
        <DungeonMap
          map={activeMap}
          visitedIds={visitedIds}
          currentId={currentNodeId}
          availableIds={availableIds}
          onSelectNode={handleNodeSelect}
          dungeonName={dungeon?.name ?? 'Dungeon'}
          dungeonEmoji={dungeon?.emoji ?? '🏰'}
          playerHp={curHp}
          playerMaxHp={maxHp}
        />
        {/* Abandon bar */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-800">
          <button onClick={handleAbandon}
            className="w-full py-2 rounded-xl text-xs text-gray-600 hover:text-red-400 border border-gray-800 hover:border-red-900 transition-all">
            🚪 Abandon Run (lose all run progress)
          </button>
        </div>
      </div>
    );
  }

  // ── CAMP NODE ─────────────────────────────────────────────
  if (phase === 'camp_node') {
    return (
      <CampScreen
        rpgStats={rpgStats}
        vocabSM2={state.vocabSM2 ?? {}}
        vocabWords={VOCAB_WORDS}
        onHeal={(amt) => healPlayer(amt)}
        onContinue={() => { markNodeComplete(pendingNodeId); setPhase('map'); }}
      />
    );
  }

  // ── SCROLL NODE ───────────────────────────────────────────
  if (phase === 'scroll_node') {
    const q = questions[0];
    if (!q) return null;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gradient-to-br from-cyan-950/60 to-gray-900 border border-cyan-800/50 rounded-2xl p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">📖</div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Ancient Scroll</div>
            <div className="text-sm text-gray-400 mt-1">Answer correctly for bonus XP — no HP risk!</div>
          </div>

          <div className={`rounded-xl p-4 border mb-4 ${TYPE_BG[q.qtype]}`}>
            <div className={`text-xs font-semibold mb-3 ${TYPE_COLOR[q.qtype]}`}>{TYPE_LABEL[q.qtype]}</div>
            {q.passage && (
              <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-3 mb-3">
                <div className="text-xs text-cyan-400 font-semibold mb-1">📜 {q.passageTitle}</div>
                <div className="text-xs text-gray-300 italic leading-relaxed max-h-24 overflow-y-auto">{q.passage}</div>
              </div>
            )}
            {q.sentence && <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-3"><div className="text-xs text-gray-500 mb-1">Sentence</div><div className="text-sm text-white italic">"{q.sentence}"</div></div>}
            {q.word && !q.sentence && <div className="text-center mb-3"><div className="text-3xl font-bold text-white">{q.word}</div></div>}
            <div className="text-sm text-gray-100 font-semibold mb-3">🤔 {q.question}</div>
            <div className="space-y-2">
              {(q.options ?? []).map((opt, idx) => {
                let cls = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700';
                if (selected !== null) {
                  if (idx === q.answer) cls = 'bg-green-900/60 border-green-500 text-green-200';
                  else if (idx === selected) cls = 'bg-red-900/60 border-red-500 text-red-200';
                  else cls = 'bg-gray-800/40 border-gray-700 text-gray-500';
                }
                return (
                  <button key={idx} onClick={() => handleScrollAnswer(idx)} disabled={selected !== null}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all btn-press ${cls}`}>
                    <span className="inline-block w-6 text-center mr-2 opacity-60 font-bold">{['A','B','C','D'][idx]}</span>{opt}
                  </button>
                );
              })}
            </div>
            {feedback && q.explanation && (
              <div className={`mt-3 p-3 rounded-xl text-xs ${feedback === 'correct' ? 'bg-green-900/40 border border-green-700 text-green-200' : 'bg-red-900/40 border border-red-700 text-red-200'}`}>
                <div className="font-semibold mb-1">{feedback === 'correct' ? `✅ Correct! +${nodeXP} XP` : '❌ Not quite —'}</div>
                <div className="leading-relaxed opacity-90">{q.explanation}</div>
              </div>
            )}
          </div>

          {selected !== null && (
            <button onClick={() => { markNodeComplete(pendingNodeId); setPhase('map'); }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-700 to-teal-600 text-white font-bold transition-all btn-press">
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── PRE-BATTLE ────────────────────────────────────────────
  if (phase === 'pre_battle' && enemy) {
    const potions = Object.entries(state.inventory?.potions ?? {})
      .filter(([, qty]) => qty > 0).map(([id, qty]) => ({ ...POTIONS_MAP[id], qty })).filter(p => p.id);
    const nodeType = pendingNodeId ? activeMap?.nodes[pendingNodeId]?.type : 'monster';
    const nodeDef  = NODE_TYPES[nodeType] ?? NODE_TYPES.monster;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isBossNode ? 'text-yellow-400 border-yellow-600/50 bg-yellow-900/20'
            : nodeType === 'elite' ? 'text-purple-400 border-purple-600/50 bg-purple-900/20'
            : 'text-gray-400 border-gray-600 bg-gray-800/40'
          }`}>
            {nodeDef.icon} {nodeDef.label}
          </div>
          <HpBar current={curHp} max={maxHp} label="" />
        </div>

        <div className={`rounded-2xl border p-6 text-center mb-5 ${
          isBossNode ? 'bg-gradient-to-br from-yellow-950/80 to-gray-900 border-yellow-700/60'
          : nodeType === 'elite' ? 'bg-gradient-to-br from-purple-950/80 to-gray-900 border-purple-700/60'
          : 'bg-gray-900/80 border-gray-700'
        }`}>
          {isBossNode && <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3 animate-pulse">👑 Boss Encounter!</div>}
          {nodeType === 'elite' && !isBossNode && <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">⚡ Elite Enemy!</div>}
          <div className="flex justify-center mb-4">
            <EnemySprite enemy={enemy} size={isBossNode ? 96 : 72} animated />
          </div>
          <div className="text-xl font-bold text-white mb-1">{enemy.name}</div>
          <div className="text-xs text-gray-400 mb-4 leading-relaxed">{enemy.description}</div>
          <div className="flex justify-center gap-5 text-xs text-gray-400">
            <span>❤️ {enemy.hp} HP</span>
            <span>⚔️ {enemy.attack} ATK</span>
            <span>🛡️ {enemy.defense} DEF</span>
          </div>
          <div className="mt-3 text-xs text-amber-400">+{enemy.xpReward} XP · +{enemy.gemReward} 💎</div>
        </div>

        {/* Boss weak category warning */}
        {isBossNode && weakCategory && (
          <div className="bg-red-950/50 border border-red-700/60 rounded-xl p-3 mb-3 flex gap-2 text-xs text-red-300">
            <span>⚠️</span>
            <span>The boss has studied your weaknesses! Expect <strong>{FOCUS_LABEL[weakCategory]}</strong> questions — your most missed category.</span>
          </div>
        )}

        {/* Word preview — upcoming vocab words */}
        {questions.filter(q => q.qtype === 'vocab' && q.word).slice(0, 3).length > 0 && (
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 mb-3">
            <div className="text-xs text-gray-500 mb-2">🔍 Words you'll face — study them now:</div>
            <div className="flex gap-2 flex-wrap">
              {questions.filter(q => q.qtype === 'vocab' && q.word).slice(0, 3).map(q => (
                <span key={q.id} className="text-sm font-bold text-indigo-300 bg-indigo-900/50 border border-indigo-700/50 px-2.5 py-1 rounded-lg">
                  {q.word}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 mb-4 text-xs text-gray-400 space-y-1">
          <div>⚔️ Your attack: <span className="text-green-400 font-bold">{Math.max(5, totalAtk)} dmg</span> per correct answer</div>
          <div>💥 Enemy attack: <span className="text-red-400 font-bold">{Math.max(1, (enemy.attack ?? 5) - totalDef)} dmg</span> if wrong</div>
          <div>📚 ~<span className="text-amber-400 font-bold">{Math.ceil(enemy.hp / Math.max(5, totalAtk))}</span> correct answers to win</div>
        </div>

        {potions.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Use a potion first?</div>
            <div className="flex gap-2 flex-wrap">
              {potions.map(p => (
                <button key={p.id} onClick={() => usePotion(p.id)}
                  className="flex items-center gap-1 bg-gray-800 border border-gray-700 hover:border-green-600 rounded-lg px-3 py-2 text-xs text-white btn-press transition-all">
                  {p.emoji} {p.name} <span className="text-gray-500">×{p.qty}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleAbandon} className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-500 hover:text-red-400 text-sm transition-all btn-press">🚪</button>
          <button onClick={() => setPhase('battle')}
            className={`flex-1 py-4 rounded-xl font-bold text-lg text-white transition-all btn-press ${
              isBossNode ? 'bg-gradient-to-r from-yellow-700 to-orange-600 hover:from-yellow-600'
              : nodeType === 'elite' ? 'bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-600'
              : 'bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600'
            }`}
            style={{ boxShadow: isBossNode ? '0 0 20px rgba(234,179,8,0.3)' : undefined }}>
            {isBossNode ? '👑 Challenge Boss!' : nodeType === 'elite' ? '⚡ Fight Elite!' : '⚔️ Fight!'}
          </button>
        </div>
      </div>
    );
  }

  // ── BATTLE ────────────────────────────────────────────────
  if (phase === 'battle') {
    const q = questions[qIdx];
    if (!q || !enemy) return null;
    const eHpPct = Math.max(0, (enemyHp / enemyMaxHp) * 100);
    const nodeType = pendingNodeId ? activeMap?.nodes[pendingNodeId]?.type : 'monster';
    const lowHp = maxHp > 0 && (curHp / maxHp) <= 0.25;

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
        {/* ── Battle scene: enemy stage ──────────────────────
            A dedicated relative container so floating damage numbers
            can position themselves against the sprite. The passive
            vignette adds atmosphere; low HP triggers a danger pulse. */}
        <div
          className={`relative overflow-hidden rounded-2xl surface battle-vignette mb-3 ${lowHp ? 'battle-vignette-danger' : ''}`}
          style={{
            padding: '14px 14px 12px',
            background: isBossNode
              ? 'radial-gradient(ellipse at 50% 20%, rgba(234,179,8,0.18), transparent 70%), linear-gradient(180deg, #14121a, #0b1220)'
              : nodeType === 'elite'
                ? 'radial-gradient(ellipse at 50% 20%, rgba(168,85,247,0.16), transparent 70%), linear-gradient(180deg, #0f0b1e, #0b1220)'
                : 'radial-gradient(ellipse at 50% 20%, rgba(99,102,241,0.14), transparent 70%), linear-gradient(180deg, #0e1424, #0b1220)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Sprite stage — idle breathing by default, replays hit flash
                whenever hitId changes. `key` resets the hit animation. */}
            <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
              <div
                key={hitId}
                className={`${hitId > 0 ? 'animate-enemy-hit' : ''}`}
                style={{ position: 'absolute', inset: 0 }}
              >
                <div className="animate-enemy-idle" style={{ width: 64, height: 64 }}>
                  <EnemySprite enemy={enemy} size={64} />
                </div>
              </div>
              {/* Floating combat numbers */}
              {floaters.map(f => (
                <FloatingDamage key={f.id} value={f.value} kind={f.kind} x={f.x} />
              ))}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className={`font-display font-bold t-title ${isBossNode ? 'text-yellow-300' : nodeType === 'elite' ? 'text-purple-300' : 'text-white'}`}>
                  {enemy.name}
                </span>
                <span className="t-micro text-gray-400 font-mono">{Math.max(0, enemyHp)}/{enemyMaxHp}</span>
              </div>
              {/* Enemy HP bar with ghost-lag so taken chunks linger */}
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-900">
                <div
                  className="absolute inset-y-0 left-0 hp-ghost-fill bg-red-900/60"
                  style={{ width: `${eHpPct}%` }}
                />
                <div
                  className={`relative h-full rounded-full transition-all duration-300 ${
                    isBossNode ? 'bg-gradient-to-r from-yellow-700 to-orange-500'
                    : nodeType === 'elite' ? 'bg-gradient-to-r from-purple-700 to-violet-500'
                    : 'bg-gradient-to-r from-rose-700 to-red-500'
                  }`}
                  style={{ width: `${eHpPct}%` }}
                />
              </div>
              {/* Your HP inline under the enemy HP to keep the stage compact */}
              <div className="mt-2">
                <HpBar current={curHp} max={maxHp} label="❤️ Your HP" />
              </div>
            </div>
          </div>
        </div>

        {/* Question progress */}
        <div className="flex gap-1 my-3">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < qIdx ? 'bg-gray-600' : i === qIdx ? 'bg-white' : 'bg-gray-800'}`} />
          ))}
        </div>

        {combatLog[0] && <div className="text-xs text-gray-500 mb-2 h-4 animate-fade-in">{combatLog[0]}</div>}

        {/* Revenge indicator */}
        {questions[qIdx]?._revenge && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-red-950/60 border border-red-700/60 animate-fade-in">
            <span className="text-base">💀</span>
            <span className="text-xs font-bold text-red-400">The enemy remembers! Answer correctly to push back.</span>
          </div>
        )}

        {/* Question card */}
        <div className={`bg-gray-900 border rounded-2xl p-5 mb-4 ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : isBossNode ? 'border-yellow-900/60' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TYPE_BG[q.qtype]} ${TYPE_COLOR[q.qtype]}`}>{TYPE_LABEL[q.qtype]}</span>
            <div className="flex items-center gap-2">
              {q.qtype === DAILY_FOCUS && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/60 border border-amber-600/50 text-amber-300 font-bold">⭐ 2×</span>
              )}
              <span className="text-xs text-amber-400">+{Math.round((q.xp || 15) * (q.qtype === DAILY_FOCUS ? 2 : 1))} XP</span>
            </div>
          </div>

          {q.qtype === 'reading' && q.passage && (
            <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-3 mb-3">
              <div className="text-xs text-cyan-400 font-semibold mb-1">📜 {q.passageTitle}</div>
              <div className="text-xs text-gray-300 leading-relaxed italic max-h-28 overflow-y-auto">{q.passage}</div>
            </div>
          )}
          {q.sentence && <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-3 mb-3"><div className="text-xs text-gray-500 mb-1">Sentence</div><div className="text-sm text-white italic">"{q.sentence}"</div></div>}
          {q.word && !q.sentence && <div className="text-center mb-3"><div className="text-3xl font-bold text-white">{q.word}</div>{q.partOfSpeech && <div className="text-xs text-gray-500 mt-1">{q.partOfSpeech}</div>}</div>}

          <div className="text-sm text-gray-100 font-semibold mb-4 leading-relaxed">🤔 {q.question}</div>

          <div className="space-y-2">
            {(q.options ?? []).map((opt, idx) => {
              let cls = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500';
              if (selected !== null) {
                if (idx === q.answer) cls = 'bg-green-900/60 border-green-500 text-green-200';
                else if (idx === selected && idx !== q.answer) cls = 'bg-red-900/60 border-red-500 text-red-200';
                else cls = 'bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed';
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all btn-press ${cls}`}>
                  <span className="inline-block w-6 text-center mr-2 opacity-60 font-bold">{['A','B','C','D'][idx]}</span>{opt}
                </button>
              );
            })}
          </div>

          {feedback && q.explanation && (
            <div className={`mt-4 p-3 rounded-xl text-xs animate-fade-in ${feedback === 'correct' ? 'bg-green-900/40 border border-green-700 text-green-200' : 'bg-red-900/40 border border-red-700 text-red-200'}`}>
              <div className="font-semibold mb-1">{feedback === 'correct' ? '✅ Correct!' : '❌ Wrong —'}</div>
              <div className="leading-relaxed opacity-90">{q.explanation}</div>
            </div>
          )}
        </div>

        {selected !== null && (
          <button onClick={nextQuestion}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all btn-press ${feedback === 'correct' ? 'bg-gradient-to-r from-green-700 to-emerald-600' : 'bg-gradient-to-r from-indigo-700 to-purple-600'}`}>
            {qIdx + 1 >= questions.length ? '⚔️ End Fight' : feedback === 'correct' ? '⚡ Next →' : '💪 Continue →'}
          </button>
        )}
      </div>
    );
  }

  // ── NODE COMPLETE ─────────────────────────────────────────
  if (phase === 'node_complete') {
    const escaped = enemyHp > 0;
    const nodeType = pendingNodeId ? activeMap?.nodes[pendingNodeId]?.type : 'monster';
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className={`rounded-2xl border p-8 text-center ${isBossNode ? 'bg-gradient-to-br from-yellow-950/40 to-gray-900 border-yellow-600/50' : 'bg-gray-900/80 border-gray-700'}`}>
          <div className="text-6xl mb-4">{escaped ? '🏃' : isBossNode ? '🏆' : nodeType === 'elite' ? '⚡' : '⚔️'}</div>
          <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${isBossNode ? 'text-yellow-400' : 'text-green-400'}`}>
            {escaped ? 'Enemy Fled!' : isBossNode ? '👑 Boss Slain!' : nodeType === 'elite' ? '⚡ Elite Defeated!' : '✅ Victory!'}
          </div>
          <h2 className="text-xl font-bold text-white mb-4">{escaped ? `${enemy?.name} escaped with ${enemyHp} HP` : `${enemy?.name} defeated!`}</h2>
          <div className="flex justify-center gap-8 mb-6">
            <div><div className="text-2xl font-bold text-amber-400">+{nodeXP}</div><div className="text-xs text-gray-400">XP Earned</div></div>
            <div><div className="text-2xl font-bold text-cyan-400">+{nodeGems} 💎</div><div className="text-xs text-gray-400">Gems</div></div>
          </div>
          <button onClick={continueFromNode}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all btn-press ${isBossNode ? 'bg-gradient-to-r from-yellow-700 to-orange-600' : 'bg-gradient-to-r from-indigo-700 to-purple-600'}`}>
            {isBossNode ? '🏆 Claim Victory!' : '🗺️ Back to Map →'}
          </button>
        </div>
      </div>
    );
  }

  // ── GAME OVER ─────────────────────────────────────────────
  if (phase === 'game_over') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-900/60 rounded-2xl p-8 text-center"
             style={{ boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
          <div className="text-6xl mb-4">💀</div>
          <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">⚰️ Defeated</div>
          <h2 className="text-2xl font-bold text-white mb-2">You fell in {dungeon?.name}…</h2>
          <p className="text-sm text-gray-400 mb-6">{enemy?.name} was too strong. Your pre-run stats will be restored.</p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 text-xs text-gray-400 space-y-1">
            <div>📍 Reached: {visitedIds.length} nodes</div>
            <div>💡 Buy potions + better gear in the Shop before your next run</div>
          </div>
          <button onClick={() => { abandonDungeonRun(); setPhase('select'); setDungeonId(null); setActiveMap(null); setVisitedIds([]); }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold transition-all btn-press">
            🏠 Return (run progress lost)
          </button>
        </div>
      </div>
    );
  }

  // ── DUNGEON COMPLETE ──────────────────────────────────────
  if (phase === 'dungeon_complete') {
    const nextDungeon = (() => {
      const idx = DUNGEONS.findIndex(d => d.id === dungeonId);
      return DUNGEONS[idx + 1] || null;
    })();
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gradient-to-br from-amber-900/30 to-gray-900 border border-yellow-600/50 rounded-2xl p-8 text-center"
             style={{ boxShadow: '0 0 40px rgba(234,179,8,0.2)' }}>
          <div className="text-7xl mb-4 animate-float">{dungeon?.emoji}</div>
          <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">🏆 Dungeon Cleared!</div>
          <h2 className="text-2xl font-bold text-white mb-2">{dungeon?.name}</h2>
          <p className="text-sm text-gray-400 mb-6">All {visitedIds.length} nodes conquered.</p>
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-5 mb-6">
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">🏆 Completion Bonus</div>
            <div className="flex justify-center gap-10">
              <div><div className="text-2xl font-bold text-amber-400">+{dungeon?.completionXP}</div><div className="text-xs text-gray-400">Bonus XP</div></div>
              <div><div className="text-2xl font-bold text-cyan-400">+{dungeon?.completionGems} 💎</div><div className="text-xs text-gray-400">Gems</div></div>
            </div>
          </div>
          {nextDungeon && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-5 text-left">
              <div className="text-xs text-gray-500 mb-1">Unlocked:</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{nextDungeon.emoji}</span>
                <div>
                  <div className="font-bold text-white text-sm">{nextDungeon.name}</div>
                  <div className="text-xs text-gray-400">Lv {nextDungeon.requiredLevel}+</div>
                </div>
              </div>
            </div>
          )}
          {/* Primary action: always return to town. Previously the primary
              CTA was "Run Again", which users could mis-tap and immediately
              lose their just-earned completion state context. The select
              screen now exposes a clear Run Again chip on cleared dungeons. */}
          <button
            onClick={() => { setPhase('select'); setDungeonId(null); setActiveMap(null); setVisitedIds([]); setCurrentNodeId(null); onBack?.(); }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-gray-900 font-black text-lg transition-all btn-press">
            🏠 Return to Town
          </button>
          <div className="mt-2 text-[11px] text-gray-500 text-center">
            You can run this dungeon again from the dungeon list.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
