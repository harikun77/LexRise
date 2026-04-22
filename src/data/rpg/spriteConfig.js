// ============================================================
// spriteConfig.js — Sprite sheet coordinate map
//
// HOW TO USE:
//   1. Save the monster sprite sheet as:
//        public/sprites/monsters.png
//   2. Save the boss/elite sprite sheet as:
//        public/sprites/bosses.png
//
// SHEET DIMENSIONS (measured from actual files):
//   monsters.png — 1344×768 px, 8 cols × 5 rows
//                  each sprite cell = 168×154 px
//   bosses.png   — 1344×768 px
//                  large sprites: left ~864px
//                  small sprites: right section, 3 cols × 5 rows
//                                 each cell ≈ 146×150 px, starting x=907
//
// Each monster entry: [col, row] — zero-based grid position
// Each large boss entry: { name, x, y, w, h } — pixel bounding box
// ============================================================

// ── Monster sheet (monsters.png) ─────────────────────────────
export const MONSTER_SHEET = {
  file:    'monsters.png',
  spriteW: 168,   // exact: 1344 / 8
  spriteH: 154,   // exact: ~1536 / 10 ≈ 154 (768 / 5 = 153.6)
  cols:    8,
  rows:    5,

  // Map enemy sprite name → [col, row] in the sheet
  coords: {
    // Row 0
    enemy_zolvrak:   [0, 0],   // gray stone golem (no weapon)
    enemy_snorrek:   [1, 0],   // brown stone golem (blue sword)
    enemy_vorpling:  [2, 0],   // pink octopus
    enemy_mimbi:     [3, 0],   // teal octopus
    enemy_quelzar:   [4, 0],   // wire/energy spirit
    enemy_quilbane:  [5, 0],   // orange beast warrior
    enemy_thurvak:   [6, 0],   // purple horned warrior
    enemy_selphor:   [7, 0],   // teal humanoid

    // Row 1
    enemy_mirkfang:  [0, 1],   // green armoured warrior
    enemy_veldrak:   [1, 1],   // purple spiked warrior
    enemy_draxling:  [2, 1],   // gold wrestler
    enemy_kronvex:   [3, 1],   // silver knight
    enemy_cynthara:  [4, 1],   // purple hooded mage
    enemy_sylvarim:  [5, 1],   // gold fighter
    enemy_brundak:   [6, 1],   // teal slime beast
    enemy_nekraal:   [7, 1],   // gold/brown bear warrior

    // Row 2
    enemy_volthorn:  [0, 2],   // brown dragon-talker
    enemy_orzimeth:  [1, 2],   // red desert cat
    enemy_valkris:   [2, 2],   // blue fanged dragon
    enemy_pharaxon:  [3, 2],   // brown mummified warrior
    enemy_thalvex:   [4, 2],   // gold crowned titan
    enemy_crucibel:  [5, 2],   // purple shield demon
    enemy_xaldrath:  [6, 2],   // brown void bear
    enemy_drakmoor:  [7, 2],   // white/blue elder wyrm

    // Row 3
    enemy_malachar:  [0, 3],   // gray fallen paladin
    enemy_zervonis:  [1, 3],   // teal chaos ghost
    enemy_krevatar:  [2, 3],   // dark crowned warden
    enemy_ashvane:   [3, 3],   // brown minotaur

    // Row 4
    enemy_glomborg:  [0, 4],   // purple bear
    enemy_zephirin:  [1, 4],   // teal mummy elemental
  },
};

// ── Boss sheet (bosses.png) ───────────────────────────────────
// Left section  — 5 large boss sprites, measured pixel-precise
// Right section — 3 cols × 5 rows of small elite sprites
export const BOSS_SHEET = {
  file: 'bosses.png',

  // Total sheet dimensions (used for correct backgroundSize scaling)
  sheetW: 1344,
  sheetH: 768,

  // Large sprites — tight bounding-box coordinates from the actual PNG.
  // name must match enemy.sprite exactly.
  large: [
    // Top row of large sprites
    { name: 'enemy_krevatar', x:  14, y:  20, w: 515, h: 448 },  // stone golem + purple sword (final boss)
    { name: 'enemy_zervonis', x: 556, y:  13, w: 308, h: 455 },  // teal trident octopus (D10 boss)

    // Bottom row of large sprites
    { name: 'enemy_sylvarim', x:  48, y: 473, w: 252, h: 267 },  // eye/tentacle creature  (D6 boss)
    { name: 'enemy_pharaxon', x: 270, y: 460, w: 380, h: 283 },  // molten lava beast      (D8 boss)
    { name: 'enemy_volthorn', x: 600, y: 460, w: 242, h: 293 },  // dark bull + scythe     (D7 boss)
  ],

  // Small elite sprites — right section of the sheet
  // Measured: smallX=907, each cell ~146×150 px, 3 cols × 5 rows
  smallX: 907,
  smallY:   0,
  smallW: 146,
  smallH: 150,

  // [col, row] within the small-sprite grid
  smallCoords: {
    elite_ironclad:   [0, 0],
    elite_stoneguard: [1, 0],
    elite_brute:      [2, 0],
    elite_wraith:     [0, 1],
    elite_ravager:    [1, 1],
    elite_frostmage:  [2, 1],
    elite_kinglion:   [0, 2],
    elite_warlord:    [1, 2],
    elite_trickster:  [2, 2],
    elite_mummy:      [0, 3],
    elite_horned:     [1, 3],
    elite_tidal:      [2, 3],
    elite_viking:     [0, 4],
    elite_cyborg:     [1, 4],
    elite_orbweaver:  [2, 4],
  },
};

// ── Helper: monster sprite → CSS background props ─────────────
export function getMonsterSpriteStyle(spriteName, displaySize = 64) {
  const coords = MONSTER_SHEET.coords[spriteName];
  if (!coords) return null;

  const [col, row] = coords;
  // Scale so one sprite cell = displaySize wide
  const scale = displaySize / MONSTER_SHEET.spriteW;

  return {
    backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${MONSTER_SHEET.file})`,
    backgroundRepeat:   'no-repeat',
    backgroundPosition: `-${Math.round(col * MONSTER_SHEET.spriteW * scale)}px -${Math.round(row * MONSTER_SHEET.spriteH * scale)}px`,
    backgroundSize:     `${Math.round(MONSTER_SHEET.cols * MONSTER_SHEET.spriteW * scale)}px ${Math.round(MONSTER_SHEET.rows * MONSTER_SHEET.spriteH * scale)}px`,
    width:              displaySize,
    height:             Math.round(MONSTER_SHEET.spriteH * scale),
    imageRendering:     'pixelated',
  };
}

// ── Helper: boss/elite sprite → CSS background props ──────────
export function getBossSpriteStyle(spriteName, displaySize = 96) {
  const { sheetW, sheetH } = BOSS_SHEET;

  // ── Large boss sprites ──
  const large = BOSS_SHEET.large.find(b => b.name === spriteName);
  if (large) {
    // Fit the sprite (maintain aspect ratio) inside displaySize × displaySize
    const scale = displaySize / Math.max(large.w, large.h);
    return {
      backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${BOSS_SHEET.file})`,
      backgroundRepeat:   'no-repeat',
      // Scale the FULL sheet, then offset to the sprite's origin
      backgroundPosition: `-${Math.round(large.x * scale)}px -${Math.round(large.y * scale)}px`,
      backgroundSize:     `${Math.round(sheetW * scale)}px ${Math.round(sheetH * scale)}px`,
      width:              Math.round(large.w * scale),
      height:             Math.round(large.h * scale),
      imageRendering:     'pixelated',
    };
  }

  // ── Small elite sprites ──
  const coords = BOSS_SHEET.smallCoords[spriteName];
  if (coords) {
    const [col, row] = coords;
    const scale = displaySize / BOSS_SHEET.smallW;
    const ox = BOSS_SHEET.smallX + col * BOSS_SHEET.smallW;
    const oy = BOSS_SHEET.smallY + row * BOSS_SHEET.smallH;
    return {
      backgroundImage:    `url(${import.meta.env.BASE_URL}sprites/${BOSS_SHEET.file})`,
      backgroundRepeat:   'no-repeat',
      backgroundPosition: `-${Math.round(ox * scale)}px -${Math.round(oy * scale)}px`,
      backgroundSize:     `${Math.round(sheetW * scale)}px ${Math.round(sheetH * scale)}px`,
      width:              displaySize,
      height:             displaySize,
      imageRendering:     'pixelated',
    };
  }

  return null;
}
