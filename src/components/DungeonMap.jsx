// ============================================================
// DungeonMap — Procedural path map visual
//
// UX design:
//   • Only 5 rows are visible at a time — scroll to see the rest
//   • Auto-scrolls to the player's current node
//   • Node columns scale with dungeon difficulty (3 → 7 paths)
//   • Large emoji icons clearly visible inside each node circle
//   • Boss at top (row 14), start at bottom (row 0)
// ============================================================

import { useRef, useEffect } from 'react';
import { NODE_TYPES } from '../utils/mapGen';

// ── Layout ───────────────────────────────────────────────────
const ROW_STEP   = 72;   // px between row centres (tall enough for clear icons)
const ROW_OFFSET = 40;   // top padding inside SVG
const NODE_R     = 24;   // regular node radius
const BOSS_R     = 30;   // boss node radius
const VISIBLE_ROWS = 5;  // how many rows fit in the viewport

// SVG width is fixed; column positions are computed from the map's col count
function layout(cols) {
  const svgW    = Math.min(360, cols * 52 + 20);
  const colStep = (svgW - 24) / cols;
  const colOffset = colStep / 2 + 12;            // centres col 0
  return { svgW, colStep, colOffset };
}

function colX(col, lyt) { return lyt.colOffset + col * lyt.colStep; }
function rowY(row, totalRows) { return ROW_OFFSET + (totalRows - 1 - row) * ROW_STEP; }
function svgH(rows) { return ROW_OFFSET + (rows - 1) * ROW_STEP + ROW_OFFSET; }

// ── Node colours ─────────────────────────────────────────────
const TYPE_FILL = {
  monster: '#1c1917',  // warm dark
  elite:   '#1e1b2e',  // deep purple
  boss:    '#1c1200',  // dark gold
  scroll:  '#0c1a1e',  // dark cyan
  camp:    '#0d1a0d',  // dark green
};
const TYPE_STROKE = {
  monster: '#ef4444',
  elite:   '#a855f7',
  boss:    '#f59e0b',
  scroll:  '#06b6d4',
  camp:    '#22c55e',
};

function nodeVisuals(type, state) {
  const fill   = TYPE_FILL[type]   ?? '#111';
  const stroke = TYPE_STROKE[type] ?? '#555';
  const icon   = NODE_TYPES[type]?.icon ?? '❓';

  switch (state) {
    case 'current':
      return { fill, stroke, icon, opacity: 1,    strokeW: 3,   dim: false };
    case 'available':
      return { fill, stroke, icon, opacity: 1,    strokeW: 2.5, dim: false };
    case 'visited':
      return { fill: '#1f2937', stroke: '#374151', icon: '✓', opacity: 0.7, strokeW: 1.5, dim: true };
    default: // locked
      return { fill: '#0a0a0a', stroke: '#1f2937', icon: '🔒', opacity: 0.35, strokeW: 1,   dim: true };
  }
}

// ── Cubic bezier path between two SVG points ─────────────────
function curvePath(x1, y1, x2, y2) {
  const cp = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${cp}, ${x2} ${cp}, ${x2} ${y2}`;
}

// ─────────────────────────────────────────────────────────────
export default function DungeonMap({
  map,
  visitedIds   = [],
  currentId    = null,
  availableIds = [],
  onSelectNode,
  dungeonName  = 'Dungeon',
  dungeonEmoji = '🏰',
  playerHp,
  playerMaxHp,
}) {
  const scrollRef = useRef(null);
  const visited   = new Set(visitedIds);
  const available = new Set(availableIds);

  const { nodes, rows, cols } = map;
  const lyt  = layout(cols);
  const height = svgH(rows);

  // Visible viewport = 5 rows
  const viewportH = VISIBLE_ROWS * ROW_STEP + ROW_OFFSET + 16;

  // Auto-scroll so current node (or start) is centred
  useEffect(() => {
    if (!scrollRef.current) return;
    const target = currentId && nodes[currentId]
      ? rowY(nodes[currentId].row, rows)
      : height - viewportH / 2;   // start = bottom
    scrollRef.current.scrollTop = target - viewportH / 2 + 20;
  }, [currentId]);

  function stateOf(id) {
    if (id === currentId)    return 'current';
    if (visited.has(id))     return 'visited';
    if (available.has(id))   return 'available';
    return 'locked';
  }

  // ── Build SVG elements ──────────────────────────────────────
  const lines = [];
  const nodeEls = [];

  Object.values(nodes).forEach(node => {
    const x   = colX(node.col, lyt);
    const y   = rowY(node.row, rows);
    const isBoss = node.type === 'boss';
    const r   = isBoss ? BOSS_R : NODE_R;
    const st  = stateOf(node.id);
    const vis = nodeVisuals(node.type, st);
    const isAvail   = st === 'available';
    const isCurrent = st === 'current';
    const clickable = isAvail;

    // ── Lines to children (drawn first, behind nodes) ────────
    node.next.forEach(childId => {
      const child = nodes[childId];
      if (!child) return;
      const cx = colX(child.col, lyt);
      const cy = rowY(child.row, rows);

      // Brighten lines that are on the player's visited path
      const onPath = visited.has(node.id) || visited.has(childId);
      const avail  = available.has(childId) && visited.has(node.id);

      lines.push(
        <path
          key={`ln-${node.id}-${childId}`}
          d={curvePath(x, y, cx, cy)}
          stroke={avail ? TYPE_STROKE[child.type] ?? '#555' : onPath ? '#4b5563' : '#1f2937'}
          strokeWidth={avail ? 2 : onPath ? 1.5 : 1}
          strokeDasharray={avail ? 'none' : undefined}
          fill="none"
          opacity={avail ? 0.8 : 1}
        />
      );
    });

    // ── Node ─────────────────────────────────────────────────
    nodeEls.push(
      <g
        key={node.id}
        opacity={vis.opacity}
        onClick={clickable ? () => onSelectNode && onSelectNode(node.id) : undefined}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
      >
        {/* Outer glow ring for available / current */}
        {(isAvail || isCurrent) && (
          <circle cx={x} cy={y} r={r + 8} fill="none"
            stroke={TYPE_STROKE[node.type] ?? '#555'} strokeWidth={1.5} opacity={0.3}>
            {isCurrent && (
              <>
                <animate attributeName="r" values={`${r+5};${r+12};${r+5}`} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
              </>
            )}
          </circle>
        )}

        {/* Main circle */}
        <circle
          cx={x} cy={y} r={r}
          fill={vis.fill}
          stroke={vis.stroke ?? '#555'}
          strokeWidth={vis.strokeW}
        />

        {/* Emoji icon — large and centred */}
        <text
          x={x} y={y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isBoss ? 20 : 16}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {vis.icon}
        </text>

        {/* Type label below node (available + current + boss only) */}
        {(isAvail || isCurrent || isBoss) && (
          <text
            x={x} y={y + r + 11}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight="600"
            fill={TYPE_STROKE[node.type] ?? '#aaa'}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {NODE_TYPES[node.type]?.label ?? ''}
          </text>
        )}

        {/* BOSS label above */}
        {isBoss && (
          <text x={x} y={y - r - 10} textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontWeight="bold" fill="#f59e0b"
            style={{ userSelect: 'none', pointerEvents: 'none' }}>
            BOSS
          </text>
        )}
      </g>
    );
  });

  // Floor labels on the right edge
  const floorLabels = [];
  for (let r = 0; r < rows; r++) {
    const y = rowY(r, rows);
    const isStart = r === 0;
    const isBossRow = r === rows - 1;
    floorLabels.push(
      <text key={`fl-${r}`}
        x={lyt.svgW - 6} y={y + 1}
        textAnchor="end" dominantBaseline="middle"
        fontSize={8} fill={isBossRow ? '#f59e0b' : isStart ? '#6b7280' : '#374151'}
        style={{ userSelect: 'none' }}>
        {isBossRow ? 'BOSS' : isStart ? 'START' : `F${r + 1}`}
      </text>
    );
  }

  const hpPct   = playerMaxHp > 0 ? Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100)) : 100;
  const hpColor = hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{dungeonEmoji}</span>
          <span className="font-bold text-white text-sm">{dungeonName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">❤️</span>
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
                 style={{ width: `${hpPct}%`, background: hpColor }} />
          </div>
          <span className="text-xs text-gray-400">{playerHp}/{playerMaxHp}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-1.5 border-b border-gray-800 flex-shrink-0 flex-wrap">
        {Object.entries(NODE_TYPES).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-sm">{val.icon}</span>
            <span className="text-xs text-gray-500">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="px-4 py-1 border-b border-gray-800 flex-shrink-0">
        <p className="text-xs text-gray-600 text-center">Scroll to explore the map · Tap a highlighted node to advance</p>
      </div>

      {/* ── Scrollable map viewport (5 rows visible) ── */}
      <div
        ref={scrollRef}
        className="flex-shrink-0 overflow-y-auto overflow-x-hidden"
        style={{ height: viewportH, WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex justify-center">
          <svg
            width={lyt.svgW}
            height={height}
            viewBox={`0 0 ${lyt.svgW} ${height}`}
            style={{ display: 'block', touchAction: 'pan-y' }}
          >
            <rect width={lyt.svgW} height={height} fill="#030712" />
            {floorLabels}
            {lines}
            {nodeEls}
          </svg>
        </div>
      </div>

      {/* Available nodes summary */}
      {availableIds.length > 0 && (
        <div className="flex gap-2 px-4 py-2 border-t border-gray-800 flex-shrink-0 flex-wrap">
          <span className="text-xs text-gray-500">Next:</span>
          {availableIds.map(id => {
            const n = map.nodes[id];
            if (!n) return null;
            const def = NODE_TYPES[n.type];
            return (
              <button key={id}
                onClick={() => onSelectNode && onSelectNode(id)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-700 hover:border-gray-500 bg-gray-800/60 btn-press transition-all">
                <span>{def?.icon}</span>
                <span style={{ color: TYPE_STROKE[n.type] }}>{def?.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
