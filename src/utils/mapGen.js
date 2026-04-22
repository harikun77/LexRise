// ============================================================
// LexRise — Procedural Dungeon Map Generator
// Inspired by Slay the Spire's map system.
//
// OUTPUT:  { nodes, startCols, rows, cols, seed, bossCol }
//
// DESIGN RULES:
//   • 15 rows × 7 columns grid
//   • 6 paths start at row 0 (bottom), all converge to boss at row 14 (top)
//   • Paths are processed left→right; each path's next-col must be ≥ the
//     previous path's next-col → GUARANTEED no crossing
//   • Each node can branch (connect to 2 next-nodes, 25% chance) but the
//     same left-to-right ordering constraint prevents crossing
//   • Node types are assigned by row tier:
//       Row 0–1   : monster only (intro, learn the ropes)
//       Row 2–5   : monster heavy, occasional scroll/elite
//       Row 4,9   : always CAMP (rest site every ~5 rows)
//       Row 6–10  : monster + elite + scroll mix
//       Row 11–13 : elite heavy
//       Row 14    : BOSS (one central node)
// ============================================================

// ── Seeded RNG (Mulberry32) ──────────────────────────────────
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Node type by row ─────────────────────────────────────────
const NODE_TYPES = {
  monster: { icon: '⚔️', color: '#ef4444', label: 'Monster',  desc: 'Answer questions to fight!'      },
  elite:   { icon: '⚡', color: '#a855f7', label: 'Elite',    desc: 'Tougher foe, better rewards'     },
  boss:    { icon: '👑', color: '#f59e0b', label: 'Boss',     desc: 'Final challenge — defeat to win!' },
  scroll:  { icon: '📖', color: '#06b6d4', label: 'Scroll',   desc: 'Answer for free XP — no combat'  },
  camp:    { icon: '🏕️', color: '#22c55e', label: 'Rest Site', desc: 'Restore HP or study a skill'     },
};
export { NODE_TYPES };

function pickType(row, totalRows, rand) {
  if (row === totalRows - 1) return 'boss';

  // Rest sites at ~35% and ~65% through the dungeon (scales with map length)
  const camp1 = Math.round(totalRows * 0.35);
  const camp2 = Math.round(totalRows * 0.65);
  if (row === camp1) return 'camp';
  if (totalRows >= 10 && row === camp2) return 'camp';

  if (row <= 1) return 'monster';   // intro rows

  const progress = row / (totalRows - 1);   // 0 → 1
  if (progress >= 0.80) return rand() < 0.75 ? 'elite' : 'monster';
  if (progress >= 0.50) {
    const r = rand();
    return r < 0.40 ? 'monster' : r < 0.75 ? 'elite' : 'scroll';
  }
  const r = rand();
  return r < 0.55 ? 'monster' : r < 0.70 ? 'elite' : r < 0.87 ? 'scroll' : 'camp';
}

// ── Main generator ───────────────────────────────────────────
/**
 * numPaths: how many starting paths (3 for early dungeons → 7 for late)
 * cols is derived: max(numPaths + 1, 5) capped at 7
 */
export function generateMap(seed, numPaths = 6, rows = 15) {
  const rand     = seededRng(seed);
  const cols     = Math.min(7, Math.max(numPaths + 1, 5));
  const NUM_PATHS = numPaths;
  const BOSS_COL  = Math.floor(cols / 2);

  // Pick 6 distinct sorted starting columns
  const all = Array.from({ length: cols }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const startCols = all.slice(0, NUM_PATHS).sort((a, b) => a - b);

  // nodes: id → { id, row, col, type, next:[id] }
  const nodes = {};

  function ensure(row, col) {
    const id = `r${row}c${col}`;
    if (!nodes[id]) {
      nodes[id] = { id, row, col, type: pickType(row, rows, rand), next: [] };
    }
    return id;
  }

  function link(fromRow, fromCol, toRow, toCol) {
    const fromId = ensure(fromRow, fromCol);
    const toId   = ensure(toRow,   toCol);
    if (!nodes[fromId].next.includes(toId)) {
      nodes[fromId].next.push(toId);
    }
  }

  // Create row-0 nodes
  startCols.forEach(c => ensure(0, c));

  let activeCols = startCols.slice();

  for (let r = 0; r < rows - 1; r++) {
    const sorted = [...activeCols].sort((a, b) => a - b);
    const nextColMap = new Map(); // fromCol → [nextCol, ...]
    let prevNextCol = -1;         // tracks rightmost used next-col so far

    if (r === rows - 2) {
      // All paths funnel to boss
      sorted.forEach(c => {
        link(r, c, r + 1, BOSS_COL);
        nextColMap.set(c, [BOSS_COL]);
      });
    } else {
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];

        // Primary next-col ------------------------------------------------
        // Must be ≥ prevNextCol (no-crossing) and within [c-1, c+1]
        const lo = Math.max(prevNextCol, Math.max(0, c - 1));
        const hi = Math.min(cols - 1, c + 1);
        const candidates = [];
        for (let nc = lo; nc <= hi; nc++) candidates.push(nc);
        if (!candidates.length) candidates.push(c);

        const nc1 = candidates[Math.floor(rand() * candidates.length)];
        link(r, c, r + 1, nc1);
        nextColMap.set(c, [nc1]);
        prevNextCol = nc1;

        // Optional branch (25%) ------------------------------------------
        // Branch must be nc1 ± 1 and must not exceed the next path's lo bound
        if (rand() < 0.25 && r < rows - 3) {
          const nextPathLo = i < sorted.length - 1
            ? Math.max(0, sorted[i + 1] - 1)
            : cols - 1;
          const nc2 = nc1 + (rand() < 0.5 ? 1 : -1);
          if (nc2 >= 0 && nc2 < cols && nc2 !== nc1 && nc2 <= nextPathLo) {
            link(r, c, r + 1, nc2);
            nextColMap.get(c).push(nc2);
          }
        }
      }
    }

    // Next active cols = union of all next-cols, sorted
    const allNext = new Set();
    nextColMap.forEach(arr => arr.forEach(n => allNext.add(n)));
    activeCols = [...allNext].sort((a, b) => a - b);
  }

  // Ensure boss node exists
  ensure(rows - 1, BOSS_COL);
  nodes[`r${rows - 1}c${BOSS_COL}`].type = 'boss';

  return { nodes, startCols, rows, cols, seed, bossCol: BOSS_COL };
}

// ── Runtime helpers ──────────────────────────────────────────

/** Returns the set of node IDs that are available to visit next */
export function getAvailableNodes(map, visitedIds) {
  const visited = new Set(visitedIds);

  if (visited.size === 0) {
    // Not started: all row-0 nodes are available
    return map.startCols.map(c => `r0c${c}`).filter(id => map.nodes[id]);
  }

  // Available = children of any visited node that haven't been visited yet
  const available = new Set();
  visited.forEach(id => {
    const node = map.nodes[id];
    if (node) node.next.forEach(nid => { if (!visited.has(nid)) available.add(nid); });
  });
  return [...available];
}

/** Given the node type, return combat difficulty multipliers */
export function getNodeDifficulty(nodeType) {
  switch (nodeType) {
    case 'elite': return { hpMult: 1.6, xpMult: 1.5, gemMult: 1.5, tierBoost: 1 };
    case 'boss':  return { hpMult: 2.5, xpMult: 2.0, gemMult: 2.0, tierBoost: 1 };
    default:      return { hpMult: 1.0, xpMult: 1.0, gemMult: 1.0, tierBoost: 0 };
  }
}

/** Generate a consistent but run-unique seed for a dungeon run */
export function generateRunSeed() {
  return Math.floor(Math.random() * 1_000_000_000);
}

/**
 * How many starting paths to use for a dungeon of a given order (1-based).
 * Early dungeons = narrow map (3 paths); late/DLC = full-width (7 paths).
 */
export function getNumPaths(dungeonOrder) {
  if (dungeonOrder <= 2)  return 3;
  if (dungeonOrder <= 4)  return 4;
  if (dungeonOrder <= 6)  return 5;
  if (dungeonOrder <= 9)  return 6;
  return 7;
}

/**
 * How many rows (floors) in a dungeon based on its order.
 * Early dungeons are short (7 rows = 6 floors + boss).
 * Later dungeons grow to the full 15 rows.
 */
export function getNumRows(dungeonOrder) {
  if (dungeonOrder <= 2)  return 7;
  if (dungeonOrder <= 4)  return 9;
  if (dungeonOrder <= 6)  return 11;
  if (dungeonOrder <= 9)  return 13;
  return 15;
}
