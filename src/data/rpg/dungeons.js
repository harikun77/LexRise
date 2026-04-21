// ============================================================
// LexRise RPG — Dungeon Definitions
// ============================================================
//
// DESIGN PRINCIPLES:
//   • Each dungeon has its own enemy pool — enemies are introduced
//     gradually. A slime from Dungeon 1 can reappear in Dungeon 4
//     alongside harder enemies. The full roster is never revealed
//     in one place.
//   • Bosses appear ONLY on the final floor of their dungeon,
//     as the last encounter.
//   • Floor count varies — early dungeons are short (2-3 floors),
//     later ones expand (4-5 floors).
//   • DLC dungeons = new SAT practice test added → new dungeon
//     unlocked. They have unique names, themes, and enemy mixes.
//   • A dungeon unlocks when the previous dungeon's boss is defeated.
//
// QUESTION TIERS/TYPES PER DUNGEON:
//   Early dungeons: Tier 1 vocab only
//   Mid dungeons:   Tier 1-2 vocab + grammar
//   Late dungeons:  Tier 2-3 all types
//   DLC dungeons:   Official SAT question pools
//
// ADDING NEW DUNGEONS:
//   • Append to DUNGEONS array with the next sequential id
//   • Choose enemies from ENEMIES list in enemies.js
//   • Set isDLC: true if it's a content-update dungeon
//   • Set requiredDungeonId to the previous dungeon's id
// ============================================================

import { ENEMIES } from './enemies';

// ── Helper: get enemy object by ID ────────────────────────
const E = Object.fromEntries(ENEMIES.map(e => [e.id, e]));

// ── Dungeon List ─────────────────────────────────────────
export const DUNGEONS = [

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 1 — The Entrance Hall
  //  3 floors. Intro dungeon. Two enemy types only.
  //  Tier 1 vocab. No gear needed.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_01',
    order: 1,
    name: 'The Entrance Hall',
    subtitle: "Where every scholar's journey begins",
    emoji: '🏰',
    floors: 3,
    color: '#22c55e',
    bgGradient: 'from-green-950/80 to-gray-900',
    borderColor: 'border-green-800/60',

    // Enemies that can appear on any floor (except final boss encounter)
    enemyPool: ['zolvrak', 'mimbi'],

    // Boss: appears as the LAST encounter on the LAST floor only
    bossId: 'quelzar',

    // Unlock requirements
    requiredDungeonId: null,   // starting dungeon — always unlocked
    requiredLevel: 1,

    // Question configuration
    questionTiers: [1],
    questionTypes: ['vocab'],

    // Encounter counts per floor (non-boss encounters before boss floor)
    encountersPerFloor: [3, 3, 2],  // floor 1: 3, floor 2: 3, floor 3: 2 + boss

    // Rewards for completing (defeating boss)
    completionXP: 150,
    completionGems: 30,

    lore: 'A crumbling stone hall at the dungeon entrance. Home to simple creatures that mangle basic vocabulary. The scholar-warrior Quelzar guards the stairway down.',
    tipText: 'Start here. No gear needed — your Wooden Staff and Cloth Robe are enough for B1 creatures.',
    isDLC: false,
    isVisible: true,   // always shown on dungeon select screen
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 2 — Mushroom Caverns
  //  3 floors. Introduces Vorpling. First grammar encounters.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_02',
    order: 2,
    name: 'Mushroom Caverns',
    subtitle: 'Damp tunnels filled with spores and confusion',
    emoji: '🍄',
    floors: 3,
    color: '#a78bfa',
    bgGradient: 'from-purple-950/80 to-gray-900',
    borderColor: 'border-purple-800/60',

    // Familiar enemy + 1 new introduction
    enemyPool: ['zolvrak', 'mimbi', 'vorpling'],

    bossId: 'snorrek',

    requiredDungeonId: 'dungeon_01',
    requiredLevel: 3,

    questionTiers: [1],
    questionTypes: ['vocab', 'grammar'],  // grammar appears for first time

    encountersPerFloor: [3, 3, 2],
    completionXP: 200,
    completionGems: 40,

    lore: "Deeper tunnels thick with bioluminescent mushrooms. Old friends Zolvrak and Mimbi are here — and they've brought company. Snorrek has made this his home.",
    tipText: 'Grammar questions start appearing here. Wrong answers hurt more — consider buying a Leather Tunic.',
    isDLC: false,
    isVisible: false,  // hidden until dungeon_01 is completed
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 3 — The Shadowed Wood
  //  4 floors. Introduces Thurvak + Selphor. Tier 1→2 transition.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_03',
    order: 3,
    name: 'The Shadowed Wood',
    subtitle: 'Ancient trees that whisper in dead languages',
    emoji: '🌲',
    floors: 4,
    color: '#86efac',
    bgGradient: 'from-green-950/80 to-gray-900',
    borderColor: 'border-green-700/60',

    enemyPool: ['vorpling', 'snorrek', 'thurvak', 'selphor'],

    bossId: 'quilbane',

    requiredDungeonId: 'dungeon_02',
    requiredLevel: 5,

    questionTiers: [1, 2],
    questionTypes: ['vocab', 'grammar'],

    encountersPerFloor: [3, 3, 3, 2],
    completionXP: 280,
    completionGems: 55,

    lore: "A petrified forest at the edge of the dungeon's second tier. Two new foes patrol here. The thorned Quilbane claims the deepest grove.",
    tipText: "Tier 2 vocabulary begins here. Scholar's Vestments are now available in the shop.",
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 4 — Ruins of Iron
  //  4 floors. Introduces Draxling (first dragon) + Mirkfang.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_04',
    order: 4,
    name: 'Ruins of Iron',
    subtitle: 'Collapsed forges where creatures sharpen their claws',
    emoji: '⚙️',
    floors: 4,
    color: '#94a3b8',
    bgGradient: 'from-slate-950/80 to-gray-900',
    borderColor: 'border-slate-700/60',

    enemyPool: ['thurvak', 'selphor', 'draxling', 'mirkfang'],

    bossId: 'veldrak',

    requiredDungeonId: 'dungeon_03',
    requiredLevel: 8,

    questionTiers: [1, 2],
    questionTypes: ['vocab', 'grammar'],

    encountersPerFloor: [3, 4, 3, 2],
    completionXP: 360,
    completionGems: 70,

    lore: 'Collapsed iron ruins from a forgotten civilization. The first dragon creature — Draxling — prowls here. Veldrak, a stone warrior of ancient power, guards the deepest chamber.',
    tipText: 'Dragons deal more damage. Equip a Chain Shirt before entering. Draxling hits surprisingly hard.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 5 — Crystal Caves
  //  4 floors. Introduces Cynthara + Glomborg. First reading Qs.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_05',
    order: 5,
    name: 'Crystal Caves',
    subtitle: 'Gemstone walls that distort sound and meaning',
    emoji: '💎',
    floors: 4,
    color: '#67e8f9',
    bgGradient: 'from-cyan-950/80 to-gray-900',
    borderColor: 'border-cyan-700/60',

    enemyPool: ['draxling', 'mirkfang', 'cynthara', 'glomborg'],

    bossId: 'zephirin',

    requiredDungeonId: 'dungeon_04',
    requiredLevel: 12,

    questionTiers: [2],
    questionTypes: ['vocab', 'grammar', 'reading'],  // reading appears!

    encountersPerFloor: [3, 4, 3, 2],
    completionXP: 450,
    completionGems: 90,

    lore: 'Caves lined with crystals that amplify confused thoughts. The ice witch Cynthara has set up court here. Zephirin, a wind elemental, guards the exit.',
    tipText: 'Reading comprehension questions start here — they are harder but give more XP. Bronze Cuirass recommended.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 6 — Temple of Stone
  //  5 floors. Introduces Ashvane + Kronvex. Tier 2-3 transition.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_06',
    order: 6,
    name: 'Temple of Stone',
    subtitle: 'Ancient temple where logic was first corrupted',
    emoji: '🏛️',
    floors: 5,
    color: '#fbbf24',
    bgGradient: 'from-amber-950/80 to-gray-900',
    borderColor: 'border-amber-700/60',

    enemyPool: ['cynthara', 'glomborg', 'zephirin', 'ashvane', 'kronvex'],

    bossId: 'sylvarim',

    requiredDungeonId: 'dungeon_05',
    requiredLevel: 15,

    questionTiers: [2, 3],
    questionTypes: ['vocab', 'grammar', 'reading'],

    encountersPerFloor: [3, 4, 4, 3, 2],
    completionXP: 600,
    completionGems: 120,

    lore: 'A five-tiered temple from a forgotten age. The fire-bird Ashvane and the iron-clad Kronvex have taken up residence. The dark elf Sylvarim commands the highest chamber.',
    tipText: 'Five floors for the first time. Stock up on Hi-Potions. Sylvarim\'s arrow attacks bypass some armor.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 7 — The Frozen Wastes
  //  5 floors. Introduces Brundak + Nekraal. Tier 3 vocab/grammar.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_07',
    order: 7,
    name: 'The Frozen Wastes',
    subtitle: 'Endless ice fields that numb both body and mind',
    emoji: '🧊',
    floors: 5,
    color: '#bae6fd',
    bgGradient: 'from-sky-950/80 to-gray-900',
    borderColor: 'border-sky-700/60',

    enemyPool: ['ashvane', 'kronvex', 'brundak', 'nekraal'],

    bossId: 'volthorn',

    requiredDungeonId: 'dungeon_06',
    requiredLevel: 18,

    questionTiers: [2, 3],
    questionTypes: ['vocab', 'grammar'],

    encountersPerFloor: [3, 4, 4, 3, 2],
    completionXP: 750,
    completionGems: 150,

    lore: 'A glacial expanse where creatures have grown powerful from isolation. Brundak — a frost bear of enormous size — patrols the middle floors. Volthorn commands the frozen peak.',
    tipText: 'Brundak hits for massive damage. Iron Breastplate or better strongly recommended. Consider a Sage\'s Robe for the XP bonus while grinding.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 8 — Desert of Trials
  //  5 floors. Introduces Orzimeth + Pharaxon. Heavy reading.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_08',
    order: 8,
    name: 'Desert of Trials',
    subtitle: 'Scorched sands where only the learned survive',
    emoji: '🏜️',
    floors: 5,
    color: '#fb923c',
    bgGradient: 'from-orange-950/80 to-gray-900',
    borderColor: 'border-orange-700/60',

    enemyPool: ['brundak', 'nekraal', 'volthorn', 'orzimeth'],

    bossId: 'pharaxon',

    requiredDungeonId: 'dungeon_07',
    requiredLevel: 22,

    questionTiers: [3],
    questionTypes: ['vocab', 'reading'],  // reading-heavy dungeon

    encountersPerFloor: [4, 4, 4, 3, 2],
    completionXP: 900,
    completionGems: 180,

    lore: 'An ancient desert where the knowledge of lost civilizations burns in the sand. Orzimeth, a desert emperor, roams the dunes. Pharaxon — a mummified pharaoh — guards the buried temple below.',
    tipText: 'Pharaxon\'s reading comprehension questions require real passage analysis. Take your time on each one.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 9 — The Abyss
  //  5 floors. Introduces Valkris, Thalvex, Crucibel. All types.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_09',
    order: 9,
    name: 'The Abyss',
    subtitle: 'A chasm with no visible bottom — only harder questions',
    emoji: '🕳️',
    floors: 5,
    color: '#c084fc',
    bgGradient: 'from-purple-950/80 to-gray-900',
    borderColor: 'border-purple-700/60',

    enemyPool: ['orzimeth', 'pharaxon', 'valkris', 'thalvex', 'crucibel'],

    bossId: 'xaldrath',

    requiredDungeonId: 'dungeon_08',
    requiredLevel: 28,

    questionTiers: [3],
    questionTypes: ['vocab', 'grammar', 'reading'],

    encountersPerFloor: [4, 4, 4, 4, 2],
    completionXP: 1100,
    completionGems: 220,

    lore: 'A void that tests everything you know. Three new, fearsome creatures prowl here. Xaldrath — the void emperor — speaks only in paragraphs that must be analyzed under pressure.',
    tipText: 'Void Armor or Dragon Scale recommended. Stock 5+ Hi-Potions. Xaldrath is a multi-phase boss.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 10 — The Inner Sanctum
  //  6 floors. Introduces Drakmoor + Malachar. Near-final.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_10',
    order: 10,
    name: 'The Inner Sanctum',
    subtitle: 'Heart of the dungeon — full SAT preparation required',
    emoji: '⚡',
    floors: 6,
    color: '#f87171',
    bgGradient: 'from-red-950/80 to-gray-900',
    borderColor: 'border-red-700/60',

    enemyPool: ['valkris', 'crucibel', 'xaldrath', 'drakmoor', 'malachar'],

    bossId: 'zervonis',

    requiredDungeonId: 'dungeon_09',
    requiredLevel: 35,

    questionTiers: [3],
    questionTypes: ['vocab', 'grammar', 'reading'],

    encountersPerFloor: [4, 4, 4, 4, 4, 2],
    completionXP: 1500,
    completionGems: 300,

    lore: 'The inner heart of the dungeon, where the most powerful creatures in existence reside. Six floors of punishment. Zervonis — a chaos archon — has never been defeated.',
    tipText: 'Acquire the Eternal Vestment if possible. Maximum potions. Zervonis will randomize your options on wrong answers.',
    isDLC: false,
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 11 — Ancient Vault (DLC — SAT Practice Test #5)
  //  Unlocks when SAT Test 5 questions are present in the bank.
  //  4 floors. Uses official College Board questions.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_11_dlc',
    order: 11,
    name: 'Ancient Vault',
    subtitle: 'SAT Practice Test #5 — Official College Board',
    emoji: '📜',
    floors: 4,
    color: '#fde68a',
    bgGradient: 'from-yellow-950/80 to-gray-900',
    borderColor: 'border-yellow-700/60',

    enemyPool: ['malachar', 'zervonis', 'drakmoor', 'crucibel'],

    bossId: 'krevatar',       // Krevatar makes his first appearance here as a preview

    requiredDungeonId: 'dungeon_10',
    requiredLevel: 40,

    questionTiers: [3],
    questionTypes: ['vocab', 'grammar', 'reading'],

    // This dungeon preferentially serves questions from sat_language.js + sat_passages.js
    questionSource: 'sat_test5',

    encountersPerFloor: [4, 4, 4, 2],
    completionXP: 1800,
    completionGems: 360,

    lore: 'A sealed vault containing authentic knowledge from the ancients. Only scholars who have mastered the Inner Sanctum may enter. The questions here are drawn directly from real SAT challenges.',
    tipText: 'These are real College Board SAT questions. Treat every encounter like actual test practice.',
    isDLC: true,
    dlcSource: 'SAT Practice Test #5 (College Board)',
    isVisible: false,
  },

  // ══════════════════════════════════════════════════════════
  //  DUNGEON 12 — The Language Throne (DLC — SAT Practice Test #11)
  //  Final dungeon. Krevatar is the true final boss.
  // ══════════════════════════════════════════════════════════
  {
    id: 'dungeon_12_dlc',
    order: 12,
    name: 'The Language Throne',
    subtitle: 'SAT Practice Test #11 — The Final Challenge',
    emoji: '👑',
    floors: 5,
    color: '#fbbf24',
    bgGradient: 'from-yellow-900/80 to-gray-900',
    borderColor: 'border-yellow-600/70',

    enemyPool: ['zervonis', 'drakmoor', 'malachar', 'xaldrath', 'crucibel'],

    bossId: 'krevatar',       // TRUE FINAL BOSS

    requiredDungeonId: 'dungeon_11_dlc',
    requiredLevel: 45,

    questionTiers: [3],
    questionTypes: ['vocab', 'grammar', 'reading'],

    questionSource: 'sat_test11',

    encountersPerFloor: [4, 4, 4, 4, 2],
    completionXP: 3000,
    completionGems: 600,

    lore: 'The Language Throne — where Krevatar, The Eternal Warden, sits in judgment of all scholars. Defeating him means you are truly SAT-ready. This dungeon draws its power from real SAT Practice Test #11.',
    tipText: 'The final dungeon. Use your best gear. Every question is from a real SAT exam. Krevatar has 250 HP and 50 attack. Bring Elixirs.',
    isDLC: true,
    dlcSource: 'SAT Practice Test #11 (College Board)',
    isFinalDungeon: true,
    isVisible: false,
  },

];

// ── Helpers ────────────────────────────────────────────────

/** Get a dungeon by ID */
export function getDungeon(id) {
  return DUNGEONS.find(d => d.id === id) || null;
}

/** Get all dungeons a player can see (completed previous + 1 next) */
export function getVisibleDungeons(dungeonProgress = {}) {
  return DUNGEONS.filter(d => {
    if (d.isVisible) return true;  // always visible
    if (!d.requiredDungeonId) return true;  // no prereq
    // Show if the required dungeon's boss has been defeated
    return dungeonProgress[d.requiredDungeonId]?.bossDefeated === true;
  });
}

/** Get the dungeon a player should play next */
export function getNextDungeon(dungeonProgress = {}) {
  return DUNGEONS.find(d => {
    if (!d.requiredDungeonId) return !dungeonProgress[d.id]?.bossDefeated;
    return dungeonProgress[d.requiredDungeonId]?.bossDefeated &&
           !dungeonProgress[d.id]?.bossDefeated;
  }) || null;
}

/** Check if a dungeon is unlocked for a player */
export function isDungeonUnlocked(dungeon, dungeonProgress = {}, playerLevel = 1) {
  if (!dungeon.requiredDungeonId) return playerLevel >= dungeon.requiredLevel;
  const prevDone = dungeonProgress[dungeon.requiredDungeonId]?.bossDefeated === true;
  return prevDone && playerLevel >= dungeon.requiredLevel;
}

/** Get total floors remaining in current dungeon run */
export function getFloorsRemaining(dungeon, currentFloor) {
  return dungeon.floors - currentFloor + 1;
}

/** Returns true if the current encounter should be the boss */
export function isBossEncounter(dungeon, floor, encounterOnFloor) {
  const lastFloor    = dungeon.floors;
  const encsOnFloor  = dungeon.encountersPerFloor[floor - 1] ?? 3;
  const isFinalFloor = floor === lastFloor;
  const isFinalEnc   = encounterOnFloor > encsOnFloor; // trigger after regular encounters
  return isFinalFloor && isFinalEnc;
}

/**
 * Pick a random enemy from the dungeon's pool.
 * Excludes the boss unless isBossEncounter.
 * @param {object} dungeon
 * @param {boolean} isBoss
 * @returns {object} enemy definition
 */
export function pickDungeonEnemy(dungeon, isBoss = false) {
  if (isBoss) {
    return E[dungeon.bossId] || DUNGEONS[0];
  }
  const pool = dungeon.enemyPool
    .map(id => E[id])
    .filter(Boolean);
  if (!pool.length) return E['zolvrak'];
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

/**
 * Get the question configuration for a dungeon encounter.
 * Returns { tiers, types } which is used to filter the question pool.
 */
export function getDungeonQuestionConfig(dungeon) {
  return {
    tiers: dungeon.questionTiers,
    types: dungeon.questionTypes,
    source: dungeon.questionSource || null,
  };
}

/** Dungeon completion summary text */
export function getDungeonStatus(dungeonId, dungeonProgress = {}) {
  const prog = dungeonProgress[dungeonId];
  if (!prog) return 'locked';
  if (prog.bossDefeated) return 'completed';
  if (prog.floorsCleared > 0) return 'in_progress';
  return 'unlocked';
}

/** Get XP multiplier for this dungeon based on farming count */
export function getDungeonFarmMultiplier(dungeonId, dungeonProgress = {}) {
  const farmCount = dungeonProgress[dungeonId]?.runCount ?? 0;
  // After completing a dungeon: each subsequent full run gives diminishing XP
  // First run: 1.0x | Second: 0.8x | Third: 0.6x | Fourth+: 0.4x
  if (farmCount === 0) return 1.0;
  if (farmCount === 1) return 0.8;
  if (farmCount === 2) return 0.6;
  return 0.4;
}
