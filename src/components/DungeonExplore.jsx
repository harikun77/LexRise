// ============================================================
// DungeonExplore — Core RPG Dungeon Gameplay
// ============================================================
// Phases:
//   select         → dungeon select screen
//   floor_intro    → animated floor entry
//   pre_battle     → enemy revealed, player can use potion
//   battle         → Q&A combat (answer to attack)
//   enemy_defeat   → enemy HP = 0, show rewards
//   floor_clear    → all encounters done, advance floor
//   dungeon_complete → boss defeated, run over
//   game_over      → player HP = 0
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DUNGEONS,
  getDungeon,
  getVisibleDungeons,
  isDungeonUnlocked,
  isBossEncounter,
  pickDungeonEnemy,
  getDungeonQuestionConfig,
} from '../data/rpg/dungeons';
import { VOCAB_WORDS, GRAMMAR_CHALLENGES } from '../data/index';
import { ALL_PASSAGES } from '../data/reading/index';
import { POTIONS_MAP } from '../data/rpg/items';
import EnemySprite from './EnemySprite';

// ── Question pool builder ────────────────────────────────────
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
      const snippet = p.passage.length > 400
        ? p.passage.slice(0, 400) + '…'
        : p.passage;
      p.questions.forEach(q => pool.push({
        ...q,
        qtype: 'reading',
        passage: snippet,
        passageTitle: p.title,
      }));
    });
  }
  // Shuffle
  return pool.sort(() => Math.random() - 0.5);
}

// Pick N questions from pool without repeating IDs
function pickQuestions(pool, n, usedIds = new Set()) {
  const fresh = pool.filter(q => !usedIds.has(q.id));
  const source = fresh.length >= n ? fresh : pool;
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Number of questions to queue for this enemy encounter
function encounterLength(enemy) {
  return Math.min(Math.ceil(enemy.hp / 6) + 2, 10);
}

// ── Colours ──────────────────────────────────────────────────
const TYPE_COLOR = { vocab: 'text-indigo-400', grammar: 'text-purple-400', reading: 'text-cyan-400' };
const TYPE_LABEL = { vocab: '📖 Vocab', grammar: '✍️ Grammar', reading: '📜 Reading' };
const TYPE_BG    = { vocab: 'bg-indigo-900/30 border-indigo-700/50', grammar: 'bg-purple-900/30 border-purple-700/50', reading: 'bg-cyan-900/30 border-cyan-700/50' };

// ── HP bar ───────────────────────────────────────────────────
function HpBar({ current, max, label, color = 'green' }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const barColor = color === 'red'
    ? 'from-red-700 to-red-500'
    : pct > 50 ? 'from-green-600 to-green-400'
    : pct > 25 ? 'from-yellow-600 to-yellow-400'
    : 'from-red-700 to-red-500';
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{Math.max(0, current)} / {max}</span>
      </div>}
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Dungeon Select Screen ────────────────────────────────────
function DungeonSelectScreen({ state, rpgStats, onEnter, onBack }) {
  const { dungeonProgress = {} } = state;
  const playerLevel = state.player.level;
  const visible = getVisibleDungeons(dungeonProgress);
  // Always show at least dungeon_01
  const toShow = visible.length ? visible : [DUNGEONS[0]];

  function statusOf(d) {
    const p = dungeonProgress[d.id];
    if (!p) return isDungeonUnlocked(d, dungeonProgress, playerLevel) ? 'unlocked' : 'locked';
    if (p.bossDefeated) return 'completed';
    if (p.floorsCleared > 0) return 'in_progress';
    return isDungeonUnlocked(d, dungeonProgress, playerLevel) ? 'unlocked' : 'locked';
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
        <h1 className="text-xl font-bold text-white">⚔️ Dungeons</h1>
      </div>

      {/* Player status bar */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 mb-5 flex items-center gap-4">
        <div className="flex-1">
          <HpBar current={rpgStats.hp} max={rpgStats.maxHp} label={`❤️ HP  ATK ${rpgStats.totalAttack}  DEF ${rpgStats.totalDefense}`} />
        </div>
        <div className="text-xs text-amber-400 font-bold whitespace-nowrap">Lv {playerLevel}</div>
      </div>

      <div className="space-y-3">
        {toShow.map(d => {
          const status = statusOf(d);
          const locked = status === 'locked';
          const prog = dungeonProgress[d.id];
          const floorPct = prog ? Math.min(100, (prog.floorsCleared / d.floors) * 100) : 0;

          return (
            <button
              key={d.id}
              disabled={locked}
              onClick={() => !locked && onEnter(d.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                locked
                  ? 'bg-gray-900/40 border-gray-700/40 opacity-60 cursor-not-allowed'
                  : status === 'completed'
                  ? 'bg-gray-800/60 border-gray-600/50 hover:border-gray-500 card-hover btn-press'
                  : `bg-gradient-to-br ${d.bgGradient} ${d.borderColor} hover:opacity-90 card-hover btn-press`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${locked ? 'opacity-40' : ''}`}>{locked ? '🔒' : d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{d.name}</span>
                    {d.isDLC && <span className="text-xs bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 px-2 py-0.5 rounded-full">DLC</span>}
                    {status === 'completed' && <span className="text-xs text-green-400 font-bold">✅ Cleared</span>}
                    {status === 'in_progress' && <span className="text-xs text-amber-400 font-bold">⚡ In Progress</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{d.subtitle}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>🏰 {d.floors} floors</span>
                    <span>Lv {d.requiredLevel}+</span>
                    <span>+{d.completionXP} XP</span>
                    <span>+{d.completionGems} 💎</span>
                  </div>
                  {status === 'in_progress' && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${floorPct}%` }} />
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{prog.floorsCleared}/{d.floors} floors</div>
                    </div>
                  )}
                  {locked && <div className="text-xs text-amber-400 mt-1">🔒 Clear previous dungeon first (Lv {d.requiredLevel} required)</div>}
                </div>
              </div>
              {!locked && (
                <div className="mt-3 text-xs text-gray-500 italic leading-relaxed line-clamp-2">{d.tipText}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main DungeonExplore component ───────────────────────────
export default function DungeonExplore({
  state, rpgStats, awardXP, recordWrong, updateQuestProgress,
  takeDamage, usePotion, startDungeon, recordFloorCleared,
  defeatBoss, retreatDungeon, recordDungeonEncounter,
  equippedWeaponId, equippedArmorId,
  onBack,
}) {
  // ── Run state ──────────────────────────────────────────────
  const [phase, setPhase]           = useState('select');  // see header comment
  const [dungeonId, setDungeonId]   = useState(null);
  const [floor, setFloor]           = useState(1);
  const [encounterNum, setEncounterNum] = useState(1); // which encounter on this floor
  const [enemy, setEnemy]           = useState(null);
  const [isBoss, setIsBoss]         = useState(false);
  const [enemyHp, setEnemyHp]       = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);

  // ── Combat state ───────────────────────────────────────────
  const [questions, setQuestions]   = useState([]);
  const [qIdx, setQIdx]             = useState(0);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState(null); // 'correct' | 'wrong'
  const [combatLog, setCombatLog]   = useState([]);   // recent battle events

  // ── Encounter reward tracking ──────────────────────────────
  const [encounterXP, setEncounterXP]     = useState(0);
  const [encounterGems, setEncounterGems] = useState(0);

  // ── Question pool (shared across encounters in a run) ─────
  const questionPoolRef = useRef([]);
  const usedQIdsRef     = useRef(new Set());

  const dungeon = dungeonId ? getDungeon(dungeonId) : null;

  // ── Helpers ───────────────────────────────────────────────
  const totalAttack  = rpgStats.totalAttack;
  const totalDefense = rpgStats.totalDefense;
  const currentHp    = rpgStats.hp;
  const maxHp        = rpgStats.maxHp;

  const encountersOnFloor = dungeon
    ? (dungeon.encountersPerFloor[floor - 1] ?? 3)
    : 3;

  // ── Enter a dungeon ───────────────────────────────────────
  const enterDungeon = useCallback((id) => {
    const d = getDungeon(id);
    if (!d) return;
    setDungeonId(id);
    setFloor(1);
    setEncounterNum(1);
    questionPoolRef.current = buildPool(d);
    usedQIdsRef.current = new Set();
    startDungeon(id);
    setPhase('floor_intro');
  }, [startDungeon]);

  // ── Begin an encounter ────────────────────────────────────
  const beginEncounter = useCallback((targetFloor, targetEncounterNum) => {
    if (!dungeon) return;
    const boss = isBossEncounter(dungeon, targetFloor, targetEncounterNum);
    const foe  = pickDungeonEnemy(dungeon, boss);
    if (!foe) return;

    const nQ = encounterLength(foe);
    const qs = pickQuestions(questionPoolRef.current, nQ, usedQIdsRef.current);
    qs.forEach(q => usedQIdsRef.current.add(q.id));

    setEnemy(foe);
    setIsBoss(boss);
    setEnemyHp(foe.hp);
    setEnemyMaxHp(foe.hp);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setFeedback(null);
    setCombatLog([]);
    setEncounterXP(0);
    setEncounterGems(0);
    setPhase('pre_battle');
  }, [dungeon]);

  // Auto-trigger first encounter after floor intro
  useEffect(() => {
    if (phase === 'floor_intro') {
      const timer = setTimeout(() => beginEncounter(floor, encounterNum), 1400);
      return () => clearTimeout(timer);
    }
  }, [phase, floor, encounterNum, beginEncounter]);

  // ── Handle answer ─────────────────────────────────────────
  const handleAnswer = useCallback((idx) => {
    if (selected !== null || phase !== 'battle') return;
    const q       = questions[qIdx];
    const correct = idx === q.answer;
    setSelected(idx);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      // Player attacks enemy
      const dmg = Math.max(5, totalAttack);
      const newEnemyHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newEnemyHp);
      setCombatLog(l => [`⚔️ Hit! ${foe_name()} takes ${dmg} damage.`, ...l.slice(0, 2)]);
      setEncounterXP(x => x + (q.xp || 15));
      setEncounterGems(g => g + (Math.floor((q.xp || 15) / 10)));

      const skill = q.qtype === 'vocab' ? 'vocabulary' : q.qtype === 'reading' ? 'reading' : 'grammar';
      awardXP(q.xp || 15, skill, q.id);
      updateQuestProgress(q.qtype === 'vocab' ? 'vocab' : q.qtype);
      updateQuestProgress('any');

      if (newEnemyHp <= 0) {
        // Enemy defeated — award gems directly too
        setTimeout(() => setPhase('enemy_defeat'), 600);
        return;
      }
    } else {
      // Enemy attacks player
      const dmg = Math.max(1, (enemy?.attack ?? 5) - totalDefense);
      const newHp = Math.max(0, currentHp - dmg);
      takeDamage(dmg);
      setCombatLog(l => [`💥 ${foe_name()} attacks! You take ${dmg} damage.`, ...l.slice(0, 2)]);
      recordWrong(q.qtype === 'vocab' ? 'vocabulary' : 'grammar');

      if (newHp <= 0) {
        setTimeout(() => setPhase('game_over'), 600);
        return;
      }
    }
  }, [selected, phase, questions, qIdx, enemyHp, totalAttack, totalDefense, currentHp, enemy, awardXP, updateQuestProgress, takeDamage, recordWrong]);

  function foe_name() { return enemy?.name ?? 'Enemy'; }

  // ── Advance to next question ───────────────────────────────
  const nextQuestion = useCallback(() => {
    recordDungeonEncounter(dungeonId, floor);
    if (qIdx + 1 >= questions.length) {
      // All questions used — enemy flees (or counts as partial victory)
      if (enemyHp > 0) {
        // Enemy escaped — still count as encounter cleared, minimal reward
        setEncounterXP(x => Math.floor(x * 0.5));
        setEncounterGems(g => Math.floor(g * 0.5));
        setEnemyHp(0);
      }
      setPhase('enemy_defeat');
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setFeedback(null);
    }
  }, [qIdx, questions.length, enemyHp, dungeonId, floor, recordDungeonEncounter]);

  // ── After defeating enemy: advance to next encounter/floor ─
  const continueAfterVictory = useCallback(() => {
    const nextEnc = encounterNum + 1;
    const isFinalEnc = nextEnc > encountersOnFloor + 1; // +1 for boss slot

    if (isFinalEnc) {
      // Floor cleared
      recordFloorCleared(dungeonId, floor);
      const nextFloor = floor + 1;
      if (nextFloor > dungeon.floors) {
        // All floors done — run complete
        defeatBoss(dungeonId, dungeon.completionXP, dungeon.completionGems);
        setPhase('dungeon_complete');
      } else {
        setFloor(nextFloor);
        setEncounterNum(1);
        setPhase('floor_intro');
      }
    } else {
      setEncounterNum(nextEnc);
      beginEncounter(floor, nextEnc);
    }
  }, [encounterNum, encountersOnFloor, floor, dungeon, dungeonId, recordFloorCleared, defeatBoss, beginEncounter]);

  // ── Use potion from inventory ─────────────────────────────
  const handlePotion = useCallback((potionId) => {
    usePotion(potionId);
  }, [usePotion]);

  // ── Retreat ───────────────────────────────────────────────
  const handleRetreat = useCallback(() => {
    retreatDungeon();
    setPhase('select');
    setDungeonId(null);
  }, [retreatDungeon]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  const currentQ = questions[qIdx];
  const qPct = questions.length > 0 ? ((qIdx) / questions.length) * 100 : 0;

  // ── SELECT ────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <DungeonSelectScreen
        state={state}
        rpgStats={rpgStats}
        onEnter={enterDungeon}
        onBack={onBack}
      />
    );
  }

  // ── FLOOR INTRO ───────────────────────────────────────────
  if (phase === 'floor_intro') {
    const floorNames = ['Ground Floor', '2nd Basement', '3rd Basement', '4th Basement', '5th Basement', '6th Basement'];
    const floorLabel = floorNames[floor - 1] ?? `Floor B${floor}`;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-float">{dungeon?.emoji}</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">{dungeon?.name}</div>
          <div className="text-3xl font-bold text-white mb-2">Floor {floor}</div>
          <div className="text-sm text-gray-400">{floorLabel}</div>
          <div className="mt-4 text-xs text-amber-400 animate-pulse">Entering…</div>
        </div>
      </div>
    );
  }

  // ── PRE-BATTLE ────────────────────────────────────────────
  if (phase === 'pre_battle') {
    const potionEntries = Object.entries(state.inventory?.potions ?? {})
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...POTIONS_MAP[id], qty }))
      .filter(p => p.id);

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            {dungeon?.name} · Floor {floor} · Encounter {encounterNum}/{encountersOnFloor + (isBoss ? 1 : 0)}
          </div>
          <button onClick={handleRetreat} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            🚪 Retreat
          </button>
        </div>

        {/* HP bar */}
        <div className="mb-5">
          <HpBar current={currentHp} max={maxHp} label="❤️ Your HP" />
        </div>

        {/* Enemy card */}
        <div className={`rounded-2xl border p-6 text-center mb-5 ${
          isBoss
            ? 'bg-gradient-to-br from-red-950/80 to-gray-900 border-red-800/60'
            : 'bg-gray-900/80 border-gray-700'
        }`}>
          {isBoss && (
            <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 animate-pulse">
              ⚔️ Boss Encounter!
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className={`${isBoss ? 'animate-float' : ''}`}>
              {enemy && <EnemySprite enemy={enemy} size={isBoss ? 96 : 72} animated={!isBoss} />}
            </div>
          </div>
          <div className="text-xl font-bold text-white mb-1">{enemy?.name}</div>
          <div className="text-xs text-gray-400 mb-4">{enemy?.description}</div>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span>❤️ {enemy?.hp} HP</span>
            <span>⚔️ {enemy?.attack} ATK</span>
            <span>🛡️ {enemy?.defense} DEF</span>
          </div>
          <div className="mt-3 text-xs text-amber-400">
            Reward: +{enemy?.xpReward} XP, +{enemy?.gemReward} 💎
          </div>
        </div>

        {/* Combat preview */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 mb-5 text-xs text-gray-400 space-y-1">
          <div>⚔️ Your attack: <span className="text-green-400 font-bold">{totalAttack}</span> damage per correct answer</div>
          <div>💥 Enemy attack: <span className="text-red-400 font-bold">{Math.max(1, (enemy?.attack ?? 5) - totalDefense)}</span> damage if you answer wrong</div>
          <div>📚 Hits to defeat: <span className="text-amber-400 font-bold">~{Math.ceil((enemy?.hp ?? 20) / Math.max(5, totalAttack))}</span> correct answers</div>
        </div>

        {/* Potions */}
        {potionEntries.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Use a potion before battle?</div>
            <div className="flex gap-2 flex-wrap">
              {potionEntries.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePotion(p.id)}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-green-600 rounded-lg px-3 py-2 text-xs text-white btn-press transition-all"
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                  <span className="text-gray-500">×{p.qty}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setPhase('battle')}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all btn-press ${
            isBoss
              ? 'bg-gradient-to-r from-red-700 to-orange-600 hover:from-red-600 hover:to-orange-500'
              : 'bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600 hover:to-purple-500'
          }`}
          style={{ boxShadow: isBoss ? '0 0 20px rgba(239,68,68,0.3)' : undefined }}
        >
          {isBoss ? '⚔️ Face the Boss!' : '⚔️ Fight!'}
        </button>
      </div>
    );
  }

  // ── BATTLE ────────────────────────────────────────────────
  if (phase === 'battle') {
    if (!currentQ) return null;
    const enemyHpPct = Math.max(0, (enemyHp / enemyMaxHp) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
        {/* Top combat bar */}
        <div className="flex items-center gap-3 mb-4">
          {/* Enemy mini */}
          <div className="flex-shrink-0">
            {enemy && <EnemySprite enemy={enemy} size={48} />}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-bold ${isBoss ? 'text-red-400' : 'text-white'}`}>{enemy?.name}</span>
              <span className="text-gray-400">{Math.max(0, enemyHp)}/{enemyMaxHp} HP</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isBoss ? 'bg-gradient-to-r from-red-700 to-orange-500' : 'bg-gradient-to-r from-rose-600 to-red-400'
                }`}
                style={{ width: `${enemyHpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Player HP */}
        <div className="mb-4">
          <HpBar current={currentHp} max={maxHp} label="❤️ Your HP" />
        </div>

        {/* Question progress dots */}
        <div className="flex gap-1 mb-4">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < qIdx ? 'bg-gray-600' : i === qIdx ? 'bg-white' : 'bg-gray-800'
            }`} />
          ))}
        </div>

        {/* Combat log */}
        {combatLog.length > 0 && (
          <div className="text-xs text-gray-500 mb-3 h-4 animate-fade-in">{combatLog[0]}</div>
        )}

        {/* Question card */}
        <div className={`bg-gradient-to-br from-gray-900 to-gray-800 border rounded-2xl p-5 mb-4 ${
          feedback === 'correct' ? 'border-green-500'
          : feedback === 'wrong' ? 'border-red-500'
          : isBoss ? 'border-red-900/60' : 'border-gray-700'
        }`}>
          {/* Type badge */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TYPE_BG[currentQ.qtype]} ${TYPE_COLOR[currentQ.qtype]}`}>
              {TYPE_LABEL[currentQ.qtype]}
            </span>
            <span className="text-xs text-amber-400 font-semibold">+{currentQ.xp || 15} XP if correct</span>
          </div>

          {/* Reading passage snippet */}
          {currentQ.qtype === 'reading' && currentQ.passage && (
            <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-3 mb-4">
              <div className="text-xs text-cyan-400 font-semibold mb-1">📜 {currentQ.passageTitle}</div>
              <div className="text-xs text-gray-300 leading-relaxed italic max-h-28 overflow-y-auto">
                {currentQ.passage}
              </div>
            </div>
          )}

          {/* Grammar sentence */}
          {(currentQ.qtype === 'grammar' || currentQ.sentence) && currentQ.sentence && (
            <div className="bg-gray-800/70 border border-gray-600 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sentence</div>
              <div className="text-sm text-white italic">"{currentQ.sentence}"</div>
            </div>
          )}

          {/* Vocab word */}
          {currentQ.qtype === 'vocab' && currentQ.word && !currentQ.sentence && (
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white">{currentQ.word}</div>
              {currentQ.partOfSpeech && (
                <div className="text-xs text-gray-500 mt-1">{currentQ.partOfSpeech}</div>
              )}
            </div>
          )}

          {/* Question text */}
          <div className="text-gray-100 font-semibold text-sm mb-4 leading-relaxed">
            🤔 {currentQ.question}
          </div>

          {/* Answer options */}
          <div className="space-y-2">
            {(currentQ.options ?? []).map((opt, idx) => {
              let cls = 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500';
              if (selected !== null) {
                if (idx === currentQ.answer)
                  cls = 'bg-green-900/60 border-green-500 text-green-200';
                else if (idx === selected && selected !== currentQ.answer)
                  cls = 'bg-red-900/60 border-red-500 text-red-200';
                else
                  cls = 'bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed';
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-xl border font-medium text-sm transition-all btn-press ${cls}`}
                >
                  <span className="inline-block w-6 text-center mr-2 opacity-60 font-bold">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {feedback && currentQ.explanation && (
            <div className={`mt-4 p-3 rounded-xl text-xs animate-fade-in ${
              feedback === 'correct'
                ? 'bg-green-900/40 border border-green-700/50 text-green-200'
                : 'bg-red-900/40 border border-red-700/50 text-red-200'
            }`}>
              <div className="font-semibold mb-1">{feedback === 'correct' ? '✅ Correct!' : '❌ Wrong —'}</div>
              <div className="leading-relaxed opacity-90">{currentQ.explanation}</div>
            </div>
          )}
        </div>

        {/* Next / retreat */}
        {selected !== null && (
          <div className="flex gap-3">
            <button
              onClick={handleRetreat}
              className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-red-400 font-medium text-sm transition-all btn-press"
            >
              🚪
            </button>
            <button
              onClick={nextQuestion}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all btn-press ${
                feedback === 'correct'
                  ? 'bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600 hover:to-purple-500'
              }`}
            >
              {qIdx + 1 >= questions.length ? '⚔️ Finish' : feedback === 'correct' ? '⚡ Next →' : '💪 Continue →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── ENEMY DEFEATED ────────────────────────────────────────
  if (phase === 'enemy_defeat') {
    const escaped = enemyHp > 0;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">{escaped ? '🏃' : isBoss ? '🏆' : '⚔️'}</div>
          <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
            escaped ? 'text-amber-400' : isBoss ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {escaped ? 'Enemy Fled!' : isBoss ? '⚔️ Boss Defeated!' : '✅ Victory!'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{enemy?.name} {escaped ? 'escaped' : 'defeated'}!</h2>

          {/* Rewards */}
          <div className="flex justify-center gap-8 mt-6 mb-6">
            <div>
              <div className="text-xl font-bold text-amber-400">+{encounterXP}</div>
              <div className="text-xs text-gray-400">XP Earned</div>
            </div>
            <div>
              <div className="text-xl font-bold text-cyan-400">+{enemy?.gemReward ?? 0} 💎</div>
              <div className="text-xs text-gray-400">Gems</div>
            </div>
          </div>

          {/* Floor progress indicator */}
          <div className="text-xs text-gray-500 mb-6">
            Floor {floor} — Encounter {encounterNum} of {encountersOnFloor + 1}
          </div>

          <button
            onClick={continueAfterVictory}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600 hover:to-purple-500 text-white font-bold text-lg transition-all btn-press"
          >
            {encounterNum >= encountersOnFloor + 1
              ? floor >= dungeon.floors ? '🏆 Claim Victory!' : '🚶 Next Floor →'
              : '⚔️ Continue →'}
          </button>

          <button onClick={handleRetreat} className="mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors">
            🚪 Retreat to safety
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
          <p className="text-sm text-gray-400 mb-6">
            {enemy?.name} was too strong. Buy potions in the shop and try again!
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 text-xs text-gray-400 space-y-1">
            <div>📍 Reached: Floor {floor}, Encounter {encounterNum}</div>
            <div>💡 Tip: Equip better gear from the Shop to increase ATK/DEF</div>
          </div>
          <button
            onClick={handleRetreat}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold text-lg transition-all btn-press hover:from-gray-600 hover:to-gray-500"
          >
            🏠 Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── DUNGEON COMPLETE ──────────────────────────────────────
  if (phase === 'dungeon_complete') {
    const isFirst = !state.dungeonProgress?.[dungeonId]?.runCount ||
                     state.dungeonProgress[dungeonId].runCount === 1;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
        <div className="bg-gradient-to-br from-amber-900/30 to-gray-900 border border-yellow-600/50 rounded-2xl p-8 text-center"
             style={{ boxShadow: '0 0 40px rgba(234,179,8,0.2)' }}>
          <div className="text-7xl mb-4 animate-float">{dungeon?.emoji}</div>
          <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">🏆 Dungeon Cleared!</div>
          <h2 className="text-2xl font-bold text-white mb-2">{dungeon?.name}</h2>
          <p className="text-sm text-gray-400 mb-6">You defeated every enemy and the boss!</p>

          {/* Rewards */}
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-5 mb-6">
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-3">
              {isFirst ? '🥇 First Clear Bonus!' : '⚔️ Completion Rewards'}
            </div>
            <div className="flex justify-center gap-10">
              <div>
                <div className="text-2xl font-bold text-amber-400">+{dungeon?.completionXP}</div>
                <div className="text-xs text-gray-400">Bonus XP</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">+{dungeon?.completionGems} 💎</div>
                <div className="text-xs text-gray-400">Gems</div>
              </div>
            </div>
          </div>

          {/* Next dungeon teaser */}
          {(() => {
            const nextIdx = DUNGEONS.findIndex(d => d.id === dungeonId) + 1;
            const next = DUNGEONS[nextIdx];
            return next ? (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-6 text-left">
                <div className="text-xs text-gray-500 mb-1">Next dungeon unlocked:</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{next.emoji}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{next.name}</div>
                    <div className="text-xs text-gray-400">{next.floors} floors · Lv {next.requiredLevel}+</div>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          <div className="flex gap-3">
            <button
              onClick={() => { setPhase('select'); setDungeonId(null); }}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-600 text-white font-bold transition-all btn-press hover:from-indigo-600"
            >
              ⚔️ Choose Dungeon
            </button>
            <button
              onClick={onBack}
              className="px-5 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold transition-all btn-press hover:bg-gray-700"
            >
              🏠
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
