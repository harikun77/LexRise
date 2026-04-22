// ============================================================
// spriteConfig.js — Sprite sheet coordinate map
//
// HOW TO USE:
//   1. Save the monster sprite sheet as:
//        public/sprites/monsters.png
//   2. Save the boss/elite sprite sheet as:
//        public/sprites/bosses.png
//   3. Update MONSTER_SHEET and BOSS_SHEET below if your
//      actual sprite dimensions differ from the defaults.
//
// SHEET LAYOUT ASSUMED:
//   monsters.png  — 8 columns × 5 rows, each sprite 96×96 px
//   bosses.png    — mixed sizes (see BOSS_SHEET below)
//
// Each entry: [col, row] = zero-based grid position
// ============================================================

// ── Monster sheet (monsters.png) ─────────────────────────────
export const MONSTER_SHEET = {
  file:        'monsters.png',
  spriteW:     96,   // px per sprite (width)
  spriteH:     96,   // px per sprite (height)
  cols:        8,
  rows:        5,

  // Map enemy sprite name → [col, row] in the sheet
  // Row 0 = top row, Col 0 = leftmost
  coords: {
    // Row 0 — stone/earth types
    enemy_zolvrak:   [0, 0],   // stone golem (no weapon)
    enemy_snorrek:   [1, 0],   // stone golem (sword)
    enemy_vorpling:  [2, 0],   // pink octopus
    enemy_mimbi:     [3, 0],   // teal octopus
    enemy_quelzar:   [4, 0],   // wire/energy spirit
    enemy_quilbane:  [5, 0],   // brown warrior
    enemy_thurvak:   [6, 0],   // purple warrior
    enemy_selphor:   [7, 0],   // teal warrior

    // Row 1 — humanoids
    enemy_mirkfang:  [0, 1],   // teal armoured
    enemy_veldrak:   [1, 1],   // purple spiked
    enemy_draxling:  [2, 1],   // gold wrestler
    enemy_kronvex:   [3, 1],   // silver knight
    enemy_cynthara:  [4, 1],   // purple hooded
    enemy_sylvarim:  [5, 1],   // gold fighter
    enemy_brundak:   [6, 1],   // teal slime
    enemy_nekraal:   [7, 1],   // gold/brown bear

    // Row 2 — mid-tier
    enemy_volthorn:  [0, 2],   // brown talker
    enemy_orzimeth:  [1, 2],   // red cat
    enemy_valkris:   [2, 2],   // blue fanged
    enemy_pharaxon:  [3, 2],   // brown warrior
    enemy_thalvex:   [4, 2],   // gold crowned
    enemy_crucibel:  [5, 2],   // purple shield
    enemy_xaldrath:  [6, 2],   // brown bear
    enemy_drakmoor:  [7, 2],   // white/blue medic

    // Row 3 — late-tier
    enemy_malachar:  [0, 3],   // gray knight
    enemy_zervonis:  [1, 3],   // teal ghost
    enemy_krevatar:  [2, 3],   // gold crowned (non-boss)
    enemy_ashvane:   [3, 3],   // brown minotaur

    // Row 4 — elite tier
    enemy_glomborg:  [0, 4],   // purple bear
    enemy_zephirin:  [1, 4],   // teal mummy
  },
};

// ── Boss sheet (bosses.png) ───────────────────────────────────
// This sheet has mixed sprite sizes — large bosses on the left,
// smaller elite sprites on the right.
// Coordinates use pixel offsets (not grid) for flexibility.
export const BOSS_SHEET = {
  file: 'bosses.png',

  // Large sprites (left section) — explicit pixel positions
  // These map to the most powerful dungeon bosses + the final boss.
  // Coordinates are approximate — calibrate once bosses.png is in public/sprites/.
  large: [
    // { name, x, y, w, h }
    // name must match enemy.sprite exactly so EnemySprite can look it up.
    { name: 'enemy_krevatar',  x: 0,   y: 0,   w: 300, h: 420 },  // The Eternal Warden (final boss) — stone golem
    { name: 'enemy_zervonis',  x: 550, y: 0,   w: 300, h: 380 },  // Zervonis (D10 boss) — chaos archon
    { name: 'enemy_xaldrath',  x: 230, y: 500, w: 220, h: 280 },  // Xaldrath (D9 boss) — void emperor
    { name: 'enemy_pharaxon',  x: 590, y: 400, w: 280, h: 380 },  // Pharaxon (D8 boss) — undead pharaoh
    { name: 'enemy_volthorn',  x: 590, y: 580, w: 250, h: 340 },  // Volthorn (D7 boss) — thunder dragon
    { name: 'enemy_sylvarim',  x: 20,  y: 500, w: 190, h: 240 },  // Sylvarim (D6 boss) — dark elf
  ],

  // Small sprites (right section) — 96×96 grid, 3 cols × 5 rows
  // Starting at pixel offset x=930, y=0
  smallX:      930,
  smallY:      0,
  smallW:      96,
  smallH:      96,
  smallCoords: {
    // [col, row]
    elite_ironclad:   [0, 0],   // armoured soldier
    elite_stoneguard: [1, 0],   // stone soldier
    elite_brute:      [2, 0],   // brown brute
    elite_wraith:     [0, 1],   // pale wraith
    elite_ravager:    [1, 1],   // dark ravager
    elite_frostmage:  [2, 1],   // ice mage
    elite_kinglion:   [0, 2],   // crowned lion
    elite_warlord:    [1, 2],   // warlord
    elite_trickster:  [2, 2],   // purple trickster
    elite_mummy:      [0, 3],   // sand mummy
    elite_horned:     [1, 3],   // horned warrior
    elite_tidal:      [2, 3],   // teal warrior
    elite_viking:     [0, 4],   // viking
    elite_cyborg:     [1, 4],   // mechanical
    elite_orbweaver:  [2, 4],   // orb entity
  },
};

// ── Helper: get CSS background props for a monster sprite ─────
export function getMonsterSpriteStyle(spriteName, displaySize = 64) {
  const coords = MONSTER_SHEET.coords[spriteName];
  if (!coords) return null;

  const [col, row] = coords;
  const scale = displaySize / MONSTER_SHEET.spriteW;

  return {
    backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${MONSTER_SHEET.file})`,
    backgroundRepeat:   'no-repeat',
    backgroundPosition: `-${col * MONSTER_SHEET.spriteW * scale}px -${row * MONSTER_SHEET.spriteH * scale}px`,
    backgroundSize:     `${MONSTER_SHEET.cols * MONSTER_SHEET.spriteW * scale}px ${MONSTER_SHEET.rows * MONSTER_SHEET.spriteH * scale}px`,
    width:              displaySize,
    height:             displaySize,
    imageRendering:     'pixelated',
  };
}

// ── Helper: get CSS background props for a boss/elite sprite ──
export function getBossSpriteStyle(spriteName, displaySize = 96) {
  // Check large bosses first
  const large = BOSS_SHEET.large.find(b => b.name === spriteName);
  if (large) {
    const scale = displaySize / Math.max(large.w, large.h);
    return {
      backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${BOSS_SHEET.file})`,
      backgroundRepeat:   'no-repeat',
      backgroundPosition: `-${large.x * scale}px -${large.y * scale}px`,
      backgroundSize:     'auto',  // let the image scale naturally
      width:              Math.round(large.w * scale),
      height:             Math.round(large.h * scale),
      imageRendering:     'pixelated',
    };
  }

  // Check small elite sprites
  const coords = BOSS_SHEET.smallCoords[spriteName];
  if (coords) {
    const [col, row] = coords;
    const scale = displaySize / BOSS_SHEET.smallW;
    return {
      backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${BOSS_SHEET.file})`,
      backgroundRepeat:   'no-repeat',
      backgroundPosition: `-${(BOSS_SHEET.smallX + col * BOSS_SHEET.smallW) * scale}px -${(BOSS_SHEET.smallY + row * BOSS_SHEET.smallH) * scale}px`,
      backgroundSize:     'auto',
      width:              displaySize,
      height:             displaySize,
      imageRendering:     'pixelated',
    };
  }

  return null;
}
