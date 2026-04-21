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
  getDungeonQuestionConfig, pickDungeonEnemy,
} from '../data/rpg/dungeons';
import { VOCAB_WORDS, GRAMMAR_CHALLENGES } from '../data/index';
import { ALL_PASSAGES } from '../data/reading/index';
import { POTIONS_MAP } from '../data/rpg/items';
import { generateMap, getAvailableNodes, getNodeDifficulty, generateRunSeed, NODE_TYPES } from '../utils/mapGen';
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
  return pool.sort(() => Math.random() - 0.5);
}

function pickQuestions(pool, n, usedIds) {
  const fresh = pool.filter(q => !usedIds.has(q.id));
  const src = fresh.length >= n ? fresh : pool;
  return [...src].sort(() => Math.random() - 0.5).slice(0, n);
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
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Dungeon Select ────────────────────────────────────────────
function DungeonSelectScreen({ state, rpgStats, onEnter, onBack }) {
  const { dungeonProgress = {} } = state;
  const playerLevel = state.player.level;
  const visible = getVisibleDungeons(dungeonProgress);
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
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm transition-colors">← Back</button>
        <h1 className="text-xl font-bold text-white">⚔️ Choose Dungeon</h1>
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
          const prog   = dungeonProgress[d.id];

          return (
            <button
              key={d.id}
              disabled={locked}
              onClick={() => !locked && onEnter(d.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                locked
                  ? 'bg-gray-900/40 border-gray-700/40 opacity-50 cursor-not-allowed'
                  : `bg-gradient-to-br ${d.bgGradient} ${d.borderColor} card-hover btn-press`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-4xl ${locked ? 'opacity-30' : ''}`}>{locked ? '🔒' : d.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{d.name}</span>
                    {d.isDLC && <span className="text-xs bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 px-2 py-0.5 rounded-full">DLC</span>}
                    {status === 'completed' && <span className="text-xs text-green-400 font-bold">✅ Cleared</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{d.subtitle}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>🗺️ 15 floors</span>
                    <span>Lv {d.requiredLevel}+</span>
                    <span className="text-amber-400">+{d.completionXP} XP</span>
                    <span className="text-cyan-400">+{d.completionGems} 💎</span>
                  </div>
                  {locked && <div className="text-xs text-amber-400 mt-1">🔒 Clear previous dungeon first</div>}
                </div>
              </div>
              {!locked && <div className="mt-2 text-xs text-gray-500 italic leading-relaxed">{d.tipText}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Confirm Entry Screen ──────────────────────────────────────
function ConfirmScreen({ dungeon, onConfirm, onBack }) {
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
            ['🗺️', '15 procedurally generated floors — the path is different every run'],
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

// ── Camp Node Screen ──────────────────────────────────────────
function CampScreen({ rpgStats, onHeal, onStudy, onContinue }) {
  const [used, setUsed] = useState(false);
  const healAmt = Math.floor(rpgStats.maxHp * 0.3);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <div className="bg-gradient-to-br from-green-950/60 to-gray-900 border border-green-800/50 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-3">🏕️</div>
        <h2 className="text-xl font-bold text-white mb-1">Rest Site</h2>
        <p className="text-sm text-gray-400 mb-6">Take a moment to recover.</p>

        <div className="mb-5">
          <HpBar current={rpgStats.hp} max={rpgStats.maxHp} label="❤️ Current HP" />
        </div>

        {!used ? (
          <div className="space-y-3">
            <button
              onClick={() => { onHeal(healAmt); setUsed(true); }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 text-white font-bold transition-all btn-press hover:from-green-600"
            >
              🩹 Rest — Restore {healAmt} HP
            </button>
            <button
              onClick={() => { onStudy(); setUsed(true); }}
              className="w-full py-4 rounded-xl bg-gray-800 border border-gray-600 text-white font-bold transition-all btn-press hover:bg-gray-700"
            >
              📚 Study — +50 XP (no HP restore)
            </button>
          </div>
        ) : (
          <div className="text-sm text-green-400 mb-4 font-semibold">✅ Rested. Ready to continue!</div>
        )}

        <button onClick={onContinue} disabled={!used}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all btn-press mt-3 ${
            used ? 'bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600' : 'bg-gray-800 opacity-40 cursor-not-allowed'
          }`}>
          Continue →
        </button>
      </div>
    </div>
  );
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
  const [enemy, setEnemy]         = useState(null);
  const [difficulty, setDiff]     = useState({ hpMult: 1, xpMult: 1, gemMult: 1, tierBoost: 0 });
  const [enemyHp, setEnemyHp]     = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [isBossNode, setIsBossNode] = useState(false);
  const [questions, setQuestions]  = useState([]);
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState(null);
  const [feedback, setFeedback]   = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [nodeXP, setNodeXP]       = useState(0);
  const [nodeGems, setNodeGems]   = useState(0);

  // ── Question pool (whole run) ───────────────────────────────
  const poolRef   = useRef([]);
  const usedRef   = useRef(new Set());

  const dungeon  = dungeonId ? getDungeon(dungeonId) : null;
  const totalAtk = rpgStats.totalAttack;
  const totalDef = rpgStats.totalDefense;
  const curHp    = rpgStats.hp;
  const maxHp    = rpgStats.maxHp;

  // ── Available nodes (derived from map + visited) ────────────
  const availableIds = useMemo(() => {
    if (!activeMap) return [];
    return getAvailableNodes(activeMap, visitedIds);
  }, [activeMap, visitedIds]);

  // ── 1. Enter dungeon (after confirm) ──────────────────────
  const enterDungeon = useCallback((id) => {
    const d = getDungeon(id);
    if (!d) return;
    const seed = generateRunSeed();
    const map  = generateMap(seed);
    poolRef.current = buildPool(d);
    usedRef.current = new Set();
    setActiveMap(map);
    setDungeonId(id);
    setVisitedIds([]);
    setCurrentNodeId(null);
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
      setIsBossNode(node.type === 'boss');
      const foe = pickDungeonEnemy(dungeon, node.type === 'boss');
      if (!foe) return;
      const scaledHp = Math.round(foe.hp * diff.hpMult);
      const nQ = encounterLength(foe, diff);
      const qs = pickQuestions(poolRef.current, nQ, usedRef.current);
      qs.forEach(q => usedRef.current.add(q.id));
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
    const q       = questions[qIdx];
    const correct = idx === q.answer;
    setSelected(idx);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      const dmg = Math.max(5, totalAtk);
      const newEHp = Math.max(0, enemyHp - dmg);
      setEnemyHp(newEHp);
      setCombatLog(l => [`⚔️ Hit! ${enemy?.name} takes ${dmg} dmg.`, ...l.slice(0,2)]);
      setNodeXP(x => x + (q.xp || 15));
      setNodeGems(g => g + Math.floor((q.xp || 15) / 10));
      const skill = q.qtype === 'vocab' ? 'vocabulary' : q.qtype === 'reading' ? 'reading' : 'grammar';
      awardXP(q.xp || 15, skill, q.id);
      updateQuestProgress(q.qtype === 'vocab' ? 'vocab' : q.qtype);
      updateQuestProgress('any');
      if (newEHp <= 0) { setTimeout(() => setPhase('node_complete'), 500); return; }
    } else {
      const dmg = Math.max(1, (enemy?.attack ?? 5) - totalDef);
      takeDamage(dmg);
      setCombatLog(l => [`💥 ${enemy?.name} hits you for ${dmg}!`, ...l.slice(0,2)]);
      recordWrong(q.qtype === 'vocab' ? 'vocabulary' : 'grammar');
      if (curHp - dmg <= 0) { setTimeout(() => setPhase('game_over'), 500); return; }
    }
  }, [selected, questions, qIdx, enemyHp, totalAtk, totalDef, curHp, enemy, awardXP, updateQuestProgress, takeDamage, recordWrong]);

  const nextQuestion = useCallback(() => {
    if (qIdx + 1 >= questions.length) {
      if (enemyHp > 0) {
        setNodeXP(x => Math.floor(x * 0.6));
        setNodeGems(g => Math.floor(g * 0.6));
      }
      setPhase('node_complete');
    } else {
      setQIdx(i => i + 1);
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
      <div className="max-w-2xl mx-auto flex flex-col animate-fade-in" style={{ height: 'calc(100vh - 130px)' }}>
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
        onHeal={(amt) => healPlayer(amt)}
        onStudy={() => awardXP(50, null, null)}
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

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 animate-fade-in">
        {/* Enemy + HP */}
        <div className="flex items-center gap-3 mb-3">
          <EnemySprite enemy={enemy} size={44} />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-bold ${isBossNode ? 'text-yellow-400' : nodeType === 'elite' ? 'text-purple-400' : 'text-white'}`}>{enemy.name}</span>
              <span className="text-gray-400">{Math.max(0, enemyHp)}/{enemyMaxHp}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${isBossNode ? 'bg-gradient-to-r from-yellow-700 to-orange-500' : nodeType === 'elite' ? 'bg-gradient-to-r from-purple-700 to-violet-500' : 'bg-gradient-to-r from-rose-700 to-red-500'}`} style={{ width: `${eHpPct}%` }} />
            </div>
          </div>
        </div>

        <HpBar current={curHp} max={maxHp} label="❤️ Your HP" />

        {/* Question progress */}
        <div className="flex gap-1 my-3">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < qIdx ? 'bg-gray-600' : i === qIdx ? 'bg-white' : 'bg-gray-800'}`} />
          ))}
        </div>

        {combatLog[0] && <div className="text-xs text-gray-500 mb-2 h-4 animate-fade-in">{combatLog[0]}</div>}

        {/* Question card */}
        <div className={`bg-gray-900 border rounded-2xl p-5 mb-4 ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : isBossNode ? 'border-yellow-900/60' : 'border-gray-700'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TYPE_BG[q.qtype]} ${TYPE_COLOR[q.qtype]}`}>{TYPE_LABEL[q.qtype]}</span>
            <span className="text-xs text-amber-400">+{q.xp || 15} XP</span>
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
          <div className="flex gap-3">
            <button onClick={() => { setPhase('select'); setDungeonId(null); setActiveMap(null); setVisitedIds([]); }}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-600 text-white font-bold transition-all btn-press">
              ⚔️ Run Again
            </button>
            <button onClick={onBack} className="px-6 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-bold transition-all btn-press">🏠</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
