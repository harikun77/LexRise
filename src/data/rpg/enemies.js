// ============================================================
// LexRise RPG — Enemy Roster
// ============================================================
// 30 unique enemies across 6 dungeon floors.
// Names are fantastical / non-grammar-related (Dragon Quest style).
//
// SPRITE PLACEHOLDERS:
//   Each enemy has a `sprite` ID. The game renders:
//     /sprites/enemies/{sprite}.png  ← your pixel art goes here
//   Until the PNG exists, an SVG placeholder is generated
//   automatically from the enemy's `color` + `shape` fields.
//
// QUESTION TYPES:
//   questionTypes: array of 'vocab' | 'grammar' | 'reading'
//   Mixed floors pull randomly from all listed types.
//
// DAMAGE FORMULA:
//   Player deals:  max(1, player.attack + weapon.atk - enemy.defense)
//   Enemy deals:   max(1, enemy.attack - (player.defense + armor.def))
//
// FLOORS:
//   B1-B2  Easy (green)    → starter enemies, forgiving damage
//   B3-B4  Medium (blue)   → armor/weapon shopping recommended
//   B5     Hard (purple)   → serious gear required
//   B6     Boss (red)      → reading comprehension, max stats
// ============================================================

export const ENEMIES = [

  // ════════════════════════════════════
  //  FLOOR B1  —  Easy (Tier 1)
  //  Mixed vocab + grammar
  // ════════════════════════════════════
  {
    id: 'zolvrak',
    name: 'Zolvrak',
    sprite: 'enemy_zolvrak',
    color: '#22c55e',   // placeholder fill color
    shape: 'slime',     // placeholder shape hint: slime | beast | humanoid | dragon | spirit | boss
    floor: [1],
    hp: 18,
    attack: 4,
    defense: 1,
    xpReward: 8,
    gemReward: 4,
    questionTypes: ['vocab'],
    tier: 1,
    description: 'A gurgling emerald blob that absorbs words it cannot understand.',
    weakness: 'vocab',
  },
  {
    id: 'mimbi',
    name: 'Mimbi',
    sprite: 'enemy_mimbi',
    color: '#f97316',
    shape: 'beast',
    floor: [1],
    hp: 22,
    attack: 5,
    defense: 2,
    xpReward: 10,
    gemReward: 5,
    questionTypes: ['grammar'],
    tier: 1,
    description: 'A round, bouncy creature that speaks in jumbled sentences.',
    weakness: 'grammar',
  },
  {
    id: 'quelzar',
    name: 'Quelzar',
    sprite: 'enemy_quelzar',
    color: '#facc15',
    shape: 'spirit',
    floor: [1],
    hp: 15,
    attack: 6,
    defense: 1,
    xpReward: 9,
    gemReward: 4,
    questionTypes: ['vocab', 'grammar'],
    tier: 1,
    description: 'A flickering fairy of flame who delights in wordplay gone wrong.',
    weakness: 'vocab',
  },
  {
    id: 'vorpling',
    name: 'Vorpling',
    sprite: 'enemy_vorpling',
    color: '#a78bfa',
    shape: 'slime',
    floor: [1, 2],
    hp: 25,
    attack: 5,
    defense: 3,
    xpReward: 11,
    gemReward: 5,
    questionTypes: ['vocab'],
    tier: 1,
    description: 'A plump purple blob that wobbles menacingly. Surprisingly defensive.',
    weakness: 'grammar',
  },
  {
    id: 'snorrek',
    name: 'Snorrek',
    sprite: 'enemy_snorrek',
    color: '#fb7185',
    shape: 'beast',
    floor: [1, 2],
    hp: 28,
    attack: 6,
    defense: 2,
    xpReward: 12,
    gemReward: 6,
    questionTypes: ['grammar'],
    tier: 1,
    description: 'A pig-snouted creature that snorts malformed participles at travelers.',
    weakness: 'vocab',
  },

  // ════════════════════════════════════
  //  FLOOR B2  —  Easy-Medium (Tier 1–2)
  //  Mixed, slightly harder
  // ════════════════════════════════════
  {
    id: 'thurvak',
    name: 'Thurvak',
    sprite: 'enemy_thurvak',
    color: '#78716c',
    shape: 'humanoid',
    floor: [2],
    hp: 35,
    attack: 8,
    defense: 5,
    xpReward: 16,
    gemReward: 8,
    questionTypes: ['grammar'],
    tier: 1,
    description: 'A shambling rock golem built from the ruins of old grammar books.',
    weakness: 'vocab',
  },
  {
    id: 'selphor',
    name: 'Selphor',
    sprite: 'enemy_selphor',
    color: '#86efac',
    shape: 'spirit',
    floor: [2],
    hp: 30,
    attack: 9,
    defense: 3,
    xpReward: 15,
    gemReward: 7,
    questionTypes: ['vocab'],
    tier: 1,
    description: 'A glowing forest sprite that confuses travelers with archaic vocabulary.',
    weakness: 'grammar',
  },
  {
    id: 'draxling',
    name: 'Draxling',
    sprite: 'enemy_draxling',
    color: '#f87171',
    shape: 'dragon',
    floor: [2, 3],
    hp: 38,
    attack: 10,
    defense: 4,
    xpReward: 18,
    gemReward: 9,
    questionTypes: ['vocab', 'grammar'],
    tier: 2,
    description: 'A hatchling dragon barely the size of a cat. Still breathes fire.',
    weakness: 'vocab',
  },
  {
    id: 'quilbane',
    name: 'Quilbane',
    sprite: 'enemy_quilbane',
    color: '#4ade80',
    shape: 'beast',
    floor: [2],
    hp: 32,
    attack: 8,
    defense: 6,
    xpReward: 14,
    gemReward: 7,
    questionTypes: ['grammar'],
    tier: 1,
    description: 'A rolling mass of thorny vines that wraps around careless adventurers.',
    weakness: 'grammar',
  },
  {
    id: 'mirkfang',
    name: 'Mirkfang',
    sprite: 'enemy_mirkfang',
    color: '#4b5563',
    shape: 'beast',
    floor: [2, 3],
    hp: 40,
    attack: 11,
    defense: 4,
    xpReward: 20,
    gemReward: 10,
    questionTypes: ['vocab', 'grammar'],
    tier: 2,
    description: 'A shadow hound from the dark corridors. Fast and hungry.',
    weakness: 'vocab',
  },

  // ════════════════════════════════════
  //  FLOOR B3  —  Medium (Tier 2)
  //  All question types appear
  // ════════════════════════════════════
  {
    id: 'veldrak',
    name: 'Veldrak',
    sprite: 'enemy_veldrak',
    color: '#64748b',
    shape: 'humanoid',
    floor: [3],
    hp: 55,
    attack: 14,
    defense: 8,
    xpReward: 28,
    gemReward: 14,
    questionTypes: ['grammar'],
    tier: 2,
    description: 'An animated stone soldier from an age when language was weaponized.',
    weakness: 'vocab',
  },
  {
    id: 'cynthara',
    name: 'Cynthara',
    sprite: 'enemy_cynthara',
    color: '#93c5fd',
    shape: 'humanoid',
    floor: [3],
    hp: 48,
    attack: 16,
    defense: 6,
    xpReward: 30,
    gemReward: 15,
    questionTypes: ['vocab'],
    tier: 2,
    description: 'An ice witch who freezes enemies in place with mispronounced incantations.',
    weakness: 'grammar',
  },
  {
    id: 'glomborg',
    name: 'Glomborg',
    sprite: 'enemy_glomborg',
    color: '#a16207',
    shape: 'beast',
    floor: [3, 4],
    hp: 70,
    attack: 13,
    defense: 10,
    xpReward: 32,
    gemReward: 16,
    questionTypes: ['grammar', 'vocab'],
    tier: 2,
    description: 'A massive cave troll that communicates entirely through grunts and run-on sentences.',
    weakness: 'grammar',
  },
  {
    id: 'zephirin',
    name: 'Zephirin',
    sprite: 'enemy_zephirin',
    color: '#e0f2fe',
    shape: 'spirit',
    floor: [3],
    hp: 45,
    attack: 18,
    defense: 5,
    xpReward: 34,
    gemReward: 17,
    questionTypes: ['vocab'],
    tier: 2,
    description: 'A wind elemental that scatters words into incoherence as it passes.',
    weakness: 'vocab',
  },
  {
    id: 'ashvane',
    name: 'Ashvane',
    sprite: 'enemy_ashvane',
    color: '#ef4444',
    shape: 'beast',
    floor: [3, 4],
    hp: 52,
    attack: 17,
    defense: 7,
    xpReward: 31,
    gemReward: 15,
    questionTypes: ['grammar', 'vocab'],
    tier: 2,
    description: 'A firebird whose feathers leave burns that scramble your thinking.',
    weakness: 'grammar',
  },

  // ════════════════════════════════════
  //  FLOOR B4  —  Medium-Hard (Tier 2–3)
  //  All types including first reading questions
  // ════════════════════════════════════
  {
    id: 'kronvex',
    name: 'Kronvex',
    sprite: 'enemy_kronvex',
    color: '#94a3b8',
    shape: 'humanoid',
    floor: [4],
    hp: 75,
    attack: 20,
    defense: 14,
    xpReward: 45,
    gemReward: 22,
    questionTypes: ['grammar'],
    tier: 2,
    description: 'An iron-clad knight who speaks only in passive voice. Infuriatingly difficult to hit.',
    weakness: 'vocab',
  },
  {
    id: 'sylvarim',
    name: 'Sylvarim',
    sprite: 'enemy_sylvarim',
    color: '#166534',
    shape: 'humanoid',
    elite: true,                // uses large boss sprite sheet
    floor: [4],
    hp: 65,
    attack: 22,
    defense: 11,
    xpReward: 42,
    gemReward: 21,
    questionTypes: ['vocab'],
    tier: 3,
    description: 'A dark elven archer who fires arrows inscribed with obscure SAT words.',
    weakness: 'grammar',
  },
  {
    id: 'brundak',
    name: 'Brundak',
    sprite: 'enemy_brundak',
    color: '#bae6fd',
    shape: 'beast',
    floor: [4, 5],
    hp: 90,
    attack: 19,
    defense: 16,
    xpReward: 48,
    gemReward: 24,
    questionTypes: ['vocab', 'grammar'],
    tier: 3,
    description: 'A frost bear of enormous size. Slow but devastating when it catches you.',
    weakness: 'vocab',
  },
  {
    id: 'nekraal',
    name: 'Nekraal',
    sprite: 'enemy_nekraal',
    color: '#e2e8f0',
    shape: 'humanoid',
    floor: [4],
    hp: 68,
    attack: 23,
    defense: 12,
    xpReward: 44,
    gemReward: 22,
    questionTypes: ['grammar'],
    tier: 3,
    description: 'A skeletal warrior who reassembles itself after each wrong answer.',
    weakness: 'grammar',
  },
  {
    id: 'volthorn',
    name: 'Volthorn',
    sprite: 'enemy_volthorn',
    color: '#fde68a',
    shape: 'dragon',
    elite: true,                // uses large boss sprite sheet
    floor: [4, 5],
    hp: 80,
    attack: 25,
    defense: 10,
    xpReward: 50,
    gemReward: 25,
    questionTypes: ['vocab', 'grammar'],
    tier: 3,
    description: 'A thunder lizard whose roar disrupts concentration. Answers must come quickly.',
    weakness: 'vocab',
  },

  // ════════════════════════════════════
  //  FLOOR B5  —  Hard (Tier 3)
  //  All question types, heavy damage
  // ════════════════════════════════════
  {
    id: 'orzimeth',
    name: 'Orzimeth',
    sprite: 'enemy_orzimeth',
    color: '#d97706',
    shape: 'humanoid',
    floor: [5],
    hp: 110,
    attack: 28,
    defense: 18,
    xpReward: 65,
    gemReward: 32,
    questionTypes: ['vocab'],
    tier: 3,
    description: 'An ancient desert emperor who tests knowledge with exotic vocabulary.',
    weakness: 'grammar',
  },
  {
    id: 'valkris',
    name: 'Valkris',
    sprite: 'enemy_valkris',
    color: '#1e1b4b',
    shape: 'dragon',
    floor: [5],
    hp: 120,
    attack: 30,
    defense: 16,
    xpReward: 70,
    gemReward: 35,
    questionTypes: ['vocab', 'grammar'],
    tier: 3,
    description: 'A shadow dragon who breathes corrupted syntax. Extremely dangerous.',
    weakness: 'vocab',
  },
  {
    id: 'pharaxon',
    name: 'Pharaxon',
    sprite: 'enemy_pharaxon',
    color: '#fbbf24',
    shape: 'humanoid',
    elite: true,                // uses large boss sprite sheet
    floor: [5],
    hp: 105,
    attack: 29,
    defense: 20,
    xpReward: 68,
    gemReward: 34,
    questionTypes: ['vocab'],
    tier: 3,
    description: 'An undead pharaoh whose wrappings are covered in cursed hieroglyphs.',
    weakness: 'reading',
  },
  {
    id: 'thalvex',
    name: 'Thalvex',
    sprite: 'enemy_thalvex',
    color: '#0ea5e9',
    shape: 'beast',
    floor: [5],
    hp: 130,
    attack: 27,
    defense: 19,
    xpReward: 72,
    gemReward: 36,
    questionTypes: ['grammar'],
    tier: 3,
    description: 'A titan of the deep seas whose waves crash with the force of a dangling modifier.',
    weakness: 'grammar',
  },
  {
    id: 'crucibel',
    name: 'Crucibel',
    sprite: 'enemy_crucibel',
    color: '#dc2626',
    shape: 'spirit',
    floor: [5],
    hp: 115,
    attack: 32,
    defense: 17,
    xpReward: 75,
    gemReward: 37,
    questionTypes: ['vocab', 'grammar', 'reading'],
    tier: 3,
    description: 'A demon born in a crucible of molten lexicon. Master of all language corruption.',
    weakness: 'reading',
  },

  // ════════════════════════════════════
  //  FLOOR B6  —  Very Hard / Boss Tier
  //  Heavy reading comprehension focus
  // ════════════════════════════════════
  {
    id: 'xaldrath',
    name: 'Xaldrath',
    sprite: 'enemy_xaldrath',
    color: '#6d28d9',
    shape: 'humanoid',
    floor: [6],
    hp: 160,
    attack: 38,
    defense: 26,
    xpReward: 100,
    gemReward: 50,
    questionTypes: ['vocab', 'reading'],
    tier: 3,
    description: 'An emperor from the void who speaks in paragraphs that must be analyzed quickly.',
    weakness: 'reading',
  },
  {
    id: 'drakmoor',
    name: 'Drakmoor',
    sprite: 'enemy_drakmoor',
    color: '#7c3aed',
    shape: 'dragon',
    floor: [6],
    hp: 175,
    attack: 40,
    defense: 24,
    xpReward: 110,
    gemReward: 55,
    questionTypes: ['grammar', 'reading'],
    tier: 3,
    description: 'An elder wyrm who has memorized every grammar rule — and corrupted them all.',
    weakness: 'grammar',
  },
  {
    id: 'malachar',
    name: 'Malachar',
    sprite: 'enemy_malachar',
    color: '#450a0a',
    shape: 'humanoid',
    floor: [6],
    hp: 155,
    attack: 42,
    defense: 28,
    xpReward: 105,
    gemReward: 52,
    questionTypes: ['reading'],
    tier: 3,
    description: 'A fallen paladin whose armor is forged from misinterpreted texts.',
    weakness: 'reading',
  },
  {
    id: 'zervonis',
    name: 'Zervonis',
    sprite: 'enemy_zervonis',
    color: '#1e293b',
    shape: 'spirit',
    elite: true,                // uses large boss sprite sheet
    floor: [6],
    hp: 165,
    attack: 44,
    defense: 22,
    xpReward: 115,
    gemReward: 57,
    questionTypes: ['vocab', 'grammar', 'reading'],
    tier: 3,
    description: 'A chaos archon who randomly shuffles the answers as you read the question.',
    weakness: 'vocab',
  },
  {
    id: 'krevatar',
    name: 'Krevatar',
    sprite: 'enemy_krevatar',
    color: '#0f172a',
    shape: 'boss',
    floor: [6],
    hp: 250,
    attack: 50,
    defense: 32,
    xpReward: 300,
    gemReward: 150,
    questionTypes: ['vocab', 'grammar', 'reading'],
    tier: 3,
    description: 'The Eternal Warden. Master of all language. The final guardian of SAT mastery.',
    weakness: 'reading',
    isBoss: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────

/** Get enemies available on a given floor, mixed randomly */
export function getFloorEnemies(floor) {
  return ENEMIES.filter(e => e.floor.includes(floor));
}

/** Pick a random enemy for a floor encounter */
export function pickEnemy(floor) {
  const pool = getFloorEnemies(floor);
  if (!pool.length) return ENEMIES[0];
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

/** Get the boss for a floor (if any) */
export function getFloorBoss(floor) {
  return ENEMIES.find(e => e.isBoss && e.floor.includes(floor)) || null;
}

/** XP multiplier based on how many times same floor has been farmed */
export function getXPMultiplier(floorEncounterCount) {
  if (floorEncounterCount <  10) return 1.00;
  if (floorEncounterCount <  20) return 0.50;
  if (floorEncounterCount <  30) return 0.25;
  return 0.10;
}

/** Floor difficulty label */
export const FLOOR_INFO = {
  1: { name: 'Entrance Hall',    difficulty: 'Easy',        color: '#22c55e', bgColor: '#14532d' },
  2: { name: 'Shadowed Passage', difficulty: 'Easy-Medium', color: '#86efac', bgColor: '#166534' },
  3: { name: 'Caverns of Stone', difficulty: 'Medium',      color: '#60a5fa', bgColor: '#1e3a5f' },
  4: { name: 'Hall of Iron',     difficulty: 'Medium-Hard', color: '#a78bfa', bgColor: '#2e1065' },
  5: { name: 'The Abyss',        difficulty: 'Hard',        color: '#f87171', bgColor: '#450a0a' },
  6: { name: 'The Inner Sanctum',difficulty: 'Boss',        color: '#fbbf24', bgColor: '#1c1917' },
};
