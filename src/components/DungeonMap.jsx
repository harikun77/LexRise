// ============================================================
// DungeonMap — Procedural path map (Slay the Spire style)
//
// Props:
//   map           : generated map object { nodes, startCols, rows, cols }
//   visitedIds    : Set/array of visited node ids
//   currentId     : currently selected node id (or null)
//   availableIds  : node ids the player can click next
//   onSelectNode  : (nodeId) => void — called when player taps a node
//   dungeonName   : string for the header
//   dungeonEmoji  : emoji for the header
// ============================================================

import { useRef, useEffect } from 'react';
import { NODE_TYPES } from '../utils/mapGen';

// ── Layout constants ──────────────────────────────────────────
const SVG_W      = 350;
const COL_STEP   = 46;          // px between columns
const COL_OFFSET = 22;          // left padding for col 0
const ROW_STEP   = 46;          // px between rows
const ROW_OFFSET = 28;          // top padding for boss row
const NODE_R     = 18;          // node circle radius
const BOSS_R     = 22;          // boss node radius

function colX(col) { return COL_OFFSET + col * COL_STEP; }
function rowY(row, totalRows) { return ROW_OFFSET + (totalRows - 1 - row) * ROW_STEP; }

const SVG_H = (rows) => ROW_OFFSET + (rows - 1) * ROW_STEP + 36;

// ── Node color / style ────────────────────────────────────────
function nodeStyle(type, state) {
  const def = NODE_TYPES[type] ?? NODE_TYPES.monster;
  const color = def.color;

  if (state === 'visited')   return { fill: '#374151', stroke: '#4b5563', emoji: def.icon, opacity: 0.55 };
  if (state === 'available') return { fill: color + '33', stroke: color, emoji: def.icon, opacity: 1, glow: color };
  if (state === 'current')   return { fill: color + '55', stroke: color, emoji: def.icon, opacity: 1, glow: color, pulse: true };
  // locked
  return { fill: '#111827', stroke: '#1f2937', emoji: '🔒', opacity: 0.35 };
}

// ── Curved path between two points ───────────────────────────
function curvePath(x1, y1, x2, y2) {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}

export default function DungeonMap({
  map,
  visitedIds = [],
  currentId  = null,
  availableIds = [],
  onSelectNode,
  dungeonName = 'Dungeon',
  dungeonEmoji = '🏰',
  playerHp,
  playerMaxHp,
}) {
  const scrollRef = useRef(null);
  const visited  = new Set(visitedIds);
  const available = new Set(availableIds);

  const { nodes, rows, cols } = map;
  const svgH = SVG_H(rows);

  // Auto-scroll to show the current node (or bottom on first load)
  useEffect(() => {
    if (!scrollRef.current) return;
    if (currentId && nodes[currentId]) {
      const n = nodes[currentId];
      const y = rowY(n.row, rows);
      const viewH = scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = y - viewH / 2 + 30;
    } else {
      // Scroll to bottom (start) initially
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentId]);

  function getState(id) {
    if (id === currentId)      return 'current';
    if (visited.has(id))       return 'visited';
    if (available.has(id))     return 'available';
    return 'locked';
  }

  // Build SVG node elements
  const nodeEls = [];
  const lineEls = [];

  Object.values(nodes).forEach(node => {
    const x = colX(node.col);
    const y = rowY(node.row, rows);
    const isBoss = node.type === 'boss';
    const r = isBoss ? BOSS_R : NODE_R;
    const st = getState(node.id);
    const style = nodeStyle(node.type, st);
    const isAvail = st === 'available';
    const isCurrent = st === 'current';

    // Lines to children (draw before nodes)
    node.next.forEach(childId => {
      const child = nodes[childId];
      if (!child) return;
      const cx = colX(child.col);
      const cy = rowY(child.row, rows);
      const bothVisited = visited.has(node.id) && visited.has(childId);
      const lineColor = bothVisited ? '#6b7280' : '#1f2937';
      const lineW = bothVisited ? 2 : 1.5;
      lineEls.push(
        <path
          key={`line-${node.id}-${childId}`}
          d={curvePath(x, y, cx, cy)}
          stroke={lineColor}
          strokeWidth={lineW}
          fill="none"
          strokeLinecap="round"
        />
      );
    });

    // Glow filter for available/current nodes
    const filterId = `glow-${node.id}`;
    const hasGlow = style.glow && (isAvail || isCurrent);

    nodeEls.push(
      <g
        key={node.id}
        opacity={style.opacity}
        onClick={() => isAvail && onSelectNode && onSelectNode(node.id)}
        style={{ cursor: isAvail ? 'pointer' : 'default' }}
      >
        {/* Outer pulse ring for available nodes */}
        {isAvail && (
          <circle
            cx={x} cy={y} r={r + 6}
            fill="none"
            stroke={style.stroke}
            strokeWidth={1.5}
            opacity={0.4}
          />
        )}
        {/* Current node pulse ring */}
        {isCurrent && (
          <circle
            cx={x} cy={y} r={r + 8}
            fill="none"
            stroke={style.stroke}
            strokeWidth={2}
            opacity={0.6}
          >
            <animate attributeName="r" values={`${r+5};${r+10};${r+5}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Node circle */}
        <circle
          cx={x} cy={y} r={r}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={isAvail || isCurrent ? 2.5 : 1.5}
        />

        {/* Emoji */}
        <text
          x={x} y={y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isBoss ? 16 : 13}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {style.emoji}
        </text>

        {/* Type label below node (only for available + current) */}
        {(isAvail || isCurrent) && (
          <text
            x={x} y={y + r + 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill={style.stroke}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {NODE_TYPES[node.type]?.label ?? ''}
          </text>
        )}

        {/* Row number on boss */}
        {isBoss && (
          <text
            x={x} y={y - r - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill="#f59e0b"
            fontWeight="bold"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            BOSS
          </text>
        )}
      </g>
    );
  });

  // Floor labels (every 3 rows on the left side)
  const floorLabels = [];
  for (let r = 0; r < rows; r++) {
    if (r % 3 === 0 || r === rows - 1) {
      const y = rowY(r, rows);
      floorLabels.push(
        <text
          key={`fl-${r}`}
          x={4} y={y + 1}
          dominantBaseline="middle"
          fontSize={7}
          fill="#374151"
          style={{ userSelect: 'none' }}
        >
          {r === rows - 1 ? 'TOP' : `F${r + 1}`}
        </text>
      );
    }
  }

  const hpPct = playerMaxHp > 0 ? Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100)) : 100;
  const hpColor = hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col h-full">
      {/* Map header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{dungeonEmoji}</span>
          <span className="font-bold text-white text-sm">{dungeonName}</span>
        </div>
        {/* HP bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400">❤️</span>
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${hpPct}%`, background: hpColor }} />
          </div>
          <span className="text-xs text-gray-400">{playerHp}/{playerMaxHp}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 px-4 py-2 border-b border-gray-800 flex-shrink-0 flex-wrap">
        {Object.entries(NODE_TYPES).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-xs">{val.icon}</span>
            <span className="text-xs text-gray-500">{val.label}</span>
          </div>
        ))}
      </div>

      {/* Scrollable map */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex justify-center py-2">
          <svg
            width={SVG_W}
            height={svgH}
            viewBox={`0 0 ${SVG_W} ${svgH}`}
            style={{ display: 'block', touchAction: 'pan-y' }}
          >
            {/* Background */}
            <rect width={SVG_W} height={svgH} fill="#030712" />

            {/* Floor labels */}
            {floorLabels}

            {/* Lines first (behind nodes) */}
            {lineEls}

            {/* Nodes on top */}
            {nodeEls}
          </svg>
        </div>
      </div>

      {/* Available node hints */}
      {availableIds.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-800 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            Tap a <span className="text-white font-medium">highlighted node</span> to advance
          </div>
        </div>
      )}
    </div>
  );
}
