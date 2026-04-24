// ============================================================
// DungeonMap — Retro pixel RPG map (dark forest style)
//
// Visual design inspired by classic RPG node maps:
//   • Dark forest/dungeon background with pixel-art trees
//   • Square icon nodes with thick coloured borders
//   • White connecting lines
//   • Bold labels below each node
//   • Pulsing glow on current / available nodes
// ============================================================

import { useRef, useEffect, useState } from 'react';
import { NODE_TYPES } from '../utils/mapGen';

// ── Spacing ───────────────────────────────────────────────────
const ROW_STEP   = 110;
const ROW_OFFSET = 56;

// ── Layout ────────────────────────────────────────────────────
function layout(cols, screenW) {
  const svgW    = Math.max(screenW, cols * 64);
  const colStep = (svgW - 40) / cols;
  const colOff  = 20 + colStep / 2;
  return { svgW, colStep, colOff };
}

function colX(col, lyt)       { return lyt.colOff + col * lyt.colStep; }
function rowY(row, totalRows) { return ROW_OFFSET + (totalRows - 1 - row) * ROW_STEP; }
function svgH(rows)           { return ROW_OFFSET * 2 + (rows - 1) * ROW_STEP; }

// ── Node palettes (pixel-game vivid colours) ──────────────────
const NODE_BG = {
  monster: '#7f1d1d',   // deep red
  elite:   '#3b0764',   // deep purple
  boss:    '#78350f',   // deep gold
  scroll:  '#164e63',   // deep cyan
  camp:    '#14532d',   // deep green
};
const NODE_BORDER = {
  monster: '#ef4444',
  elite:   '#a855f7',
  boss:    '#fbbf24',
  scroll:  '#22d3ee',
  camp:    '#4ade80',
};
const NODE_ICON_BG = {
  monster: '#dc2626',
  elite:   '#7c3aed',
  boss:    '#d97706',
  scroll:  '#0891b2',
  camp:    '#16a34a',
};

// ── Pixel-art tree shape (SVG) ────────────────────────────────
function PixelTree({ x, y, size = 22, opacity = 0.55 }) {
  const h = Math.round(size * 1.4);
  const tw = Math.round(size * 0.28);
  const th = Math.round(size * 0.45);
  return (
    <g opacity={opacity}>
      {/* Top crown */}
      <polygon
        points={`${x},${y - h}  ${x - size},${y - size * 0.3}  ${x + size},${y - size * 0.3}`}
        fill="#0a2010"
      />
      {/* Middle crown */}
      <polygon
        points={`${x},${y - h * 0.55}  ${x - size * 0.8},${y}  ${x + size * 0.8},${y}`}
        fill="#0c2812"
      />
      {/* Trunk */}
      <rect x={x - tw / 2} y={y} width={tw} height={th} fill="#071408" />
    </g>
  );
}

// ── Pixel-art mountain ────────────────────────────────────────
function PixelMountain({ x, y, w = 80, h = 50, opacity = 0.4 }) {
  return (
    <polygon
      points={`${x - w},${y}  ${x},${y - h}  ${x + w},${y}`}
      fill="#081810"
      opacity={opacity}
    />
  );
}

// ── Scattered background decorations (deterministic) ─────────
function ForestBackground({ svgW, svgH: h }) {
  // Pre-baked positions so the pattern is consistent every render
  const trees = [
    [30, 80, 18], [svgW * 0.15, 160, 14], [svgW * 0.72, 120, 20],
    [svgW - 35, 200, 16], [svgW * 0.4, 260, 12], [40, 340, 15],
    [svgW * 0.6, 380, 18], [svgW - 30, 440, 14], [svgW * 0.25, 480, 20],
    [svgW * 0.85, 560, 13], [55, 600, 17], [svgW * 0.5, 640, 11],
    [svgW - 50, 700, 19], [svgW * 0.1, 750, 15], [svgW * 0.7, 820, 16],
    [30, 900, 13], [svgW * 0.45, 950, 18], [svgW - 40, 1000, 14],
    [svgW * 0.2, 1100, 20], [svgW * 0.8, 1150, 15],
  ].filter(([, y]) => y < h);

  const mountains = [
    [svgW * 0.3, h * 0.25, 60, 38],
    [svgW * 0.7, h * 0.5,  50, 30],
    [svgW * 0.15, h * 0.7, 70, 42],
    [svgW * 0.85, h * 0.8, 55, 35],
  ].filter(([, y]) => y < h);

  return (
    <g>
      {mountains.map(([x, y, w, mh], i) => (
        <PixelMountain key={`m${i}`} x={x} y={y} w={w} h={mh} opacity={0.35} />
      ))}
      {trees.map(([x, y, s], i) => (
        <PixelTree key={`t${i}`} x={x} y={y} size={s} />
      ))}
    </g>
  );
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
  const scrollRef    = useRef(null);
  const containerRef = useRef(null);
  // Track the actual rendered width of the scroll container so the SVG
  // viewBox matches what the user sees (ResizeObserver → crisp nodes at any
  // container width: phone, tablet, desktop).
  const [boardW, setBoardW] = useState(() => {
    if (typeof window === 'undefined') return 390;
    return window.innerWidth || 390;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setBoardW(Math.max(el.clientWidth || 390, 320));
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visited  = new Set(visitedIds);
  const available = new Set(availableIds);

  const { nodes, rows, cols } = map;
  const lyt    = layout(cols, boardW);
  const height = svgH(rows);

  // Node square size scales with column width, clamped 44–68 px (bumped up
  // from 40–54 so nodes feel substantial on wider screens).
  const NS = Math.max(44, Math.min(68, Math.floor(lyt.colStep * 0.70)));
  const BOSS_NS = NS + 14;

  // Auto-scroll to current node
  useEffect(() => {
    if (!scrollRef.current) return;
    const target = currentId && nodes[currentId]
      ? rowY(nodes[currentId].row, rows)
      : height;
    scrollRef.current.scrollTop = target - scrollRef.current.clientHeight / 2 + 24;
  }, [currentId, height, rows, nodes]);

  // State priority:
  //   visited  — vanquished; gray + ✓ (wins over "current" so a just-finished
  //              node never keeps pulsing as if still active)
  //   current  — player's position marker (ONLY when not yet visited, e.g.
  //              briefly before markNodeComplete runs)
  //   available — next legal choices (pulsing glow)
  //   locked   — anything else; dimmed + 🔒
  function stateOf(id) {
    if (visited.has(id))    return 'visited';
    if (id === currentId)   return 'current';
    if (available.has(id))  return 'available';
    return 'locked';
  }

  // The currentId node is almost always also in visitedIds (set at the same
  // time by markNodeComplete). We still want a visible "you are here" marker,
  // so we render a small pin on top of the visited node.
  const playerPinId = currentId && nodes[currentId] ? currentId : null;

  const lines   = [];
  const nodeEls = [];

  Object.values(nodes).forEach(node => {
    const x      = colX(node.col, lyt);
    const y      = rowY(node.row, rows);
    const isBoss = node.type === 'boss';
    const ns     = isBoss ? BOSS_NS : NS;
    const half   = ns / 2;
    const st     = stateOf(node.id);
    const isAvail   = st === 'available';
    const isCurrent = st === 'current';
    const isVisited = st === 'visited';
    const isLocked  = st === 'locked';
    const clickable = isAvail;

    // ── Connecting lines (drawn beneath nodes) ──────────────
    node.next.forEach(childId => {
      const child = nodes[childId];
      if (!child) return;
      const cx = colX(child.col, lyt);
      const cy = rowY(child.row, rows);
      const onPath       = visited.has(node.id) && visited.has(childId);
      const isNextAvail  = available.has(childId) && visited.has(node.id);
      // A line is to a locked branch when the parent is visited but the child
      // is neither visited nor available — i.e., the player committed to the
      // other side of a fork. Render it dim + dashed so players can see the
      // abandoned branch but understand it's not clickable.
      const isLockedLine = visited.has(node.id) && !visited.has(childId) && !available.has(childId);

      // Stable key per connector. The line's appearance (color, width)
      // changes via stroke props, not via remount — no animation on the
      // line itself, so no dasharray length mismatch. Progression is now
      // signalled by the destination node's arrival burst instead.
      lines.push(
        <line key={`ln-${node.id}-${childId}`}
          x1={x} y1={y} x2={cx} y2={cy}
          stroke={
            isNextAvail ? NODE_BORDER[child.type] ?? '#fff'
            : onPath    ? 'rgba(255,255,255,0.5)'
            : isLockedLine ? 'rgba(100,116,139,0.18)'
            :              'rgba(255,255,255,0.18)'
          }
          strokeWidth={isNextAvail ? 2.5 : onPath ? 2 : 1.2}
          strokeDasharray={isLockedLine ? '3,4' : undefined}
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease, stroke-width 0.3s ease' }}
        />
      );
    });

    // ── Node (coin style) ───────────────────────────────────
    // Previous style rendered each node as a flat square with a border.
    // We now render circular "coins" with a radial gradient so they read
    // as pickups on the map — very Slay-the-Spire / classic RPG feel.
    //
    // Available coins get .animate-coin-pulse (amber halo), visited coins
    // go slate with a ✓, locked ones render dim with 🔒.
    const radius = Math.round(ns / 2);
    const gradientId = `coin-grad-${node.type}-${node.id}`;

    // Choose rich → deep gradient stops per node type. These only apply
    // to non-locked/non-visited coins; visited/locked get plain tones.
    const gradStopsByType = {
      monster: ['#f87171', '#7f1d1d'],
      elite:   ['#c084fc', '#3b0764'],
      boss:    ['#fcd34d', '#7c2d12'],
      scroll:  ['#67e8f9', '#164e63'],
      camp:    ['#86efac', '#14532d'],
    };
    const [gradHi, gradLo] = gradStopsByType[node.type] ?? gradStopsByType.monster;

    const rimColor = isLocked  ? '#1f2937'
                   : isVisited ? '#475569'
                   : NODE_BORDER[node.type] ?? '#fff';
    const rimWidth = isCurrent ? 3.5 : isAvail ? 3 : isVisited ? 1.8 : 1.4;
    const iconText = isVisited ? '✓' : isLocked ? '🔒' : NODE_TYPES[node.type]?.icon ?? '❓';
    const iconSize = isBoss ? Math.round(ns * 0.58) : Math.round(ns * 0.54);
    const opacity  = isLocked ? 0.35 : isVisited ? 0.55 : 1;

    nodeEls.push(
      <g
        // Outer group is state-keyed so it remounts on transition, which
        // makes the one-shot .animate-node-arrival run exactly once per
        // state change. The ambient coin pulse lives on a nested <g> so
        // the two animations don't fight for the CSS `animation` shorthand.
        key={`${node.id}-${st}`}
        opacity={opacity}
        onClick={clickable ? () => onSelectNode?.(node.id) : undefined}
        style={{ cursor: clickable ? 'pointer' : 'default' }}
        className={isAvail ? 'animate-node-arrival' : ''}
      >
       <g className={isAvail ? 'animate-coin-pulse' : ''}>

        {/* Per-coin radial gradient — defined inline so coin colouring
            follows the node type without any shared <defs> gymnastics. */}
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="70%">
            <stop offset="0%"   stopColor={gradHi} />
            <stop offset="70%"  stopColor={gradLo} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* One-shot arrival burst: an expanding ring that fades out.
            Rendered only on available nodes; because the parent <g> is
            state-keyed, this element mounts fresh on each transition
            and its CSS keyframes play to completion. */}
        {isAvail && (
          <circle
            cx={x} cy={y} r={radius + 2}
            fill="none"
            stroke={NODE_BORDER[node.type] ?? '#fbbf24'}
            strokeWidth={2}
            className="animate-ring-burst"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Outer glow for current/available — now a circle, not a rect */}
        {(isCurrent || isAvail) && (
          <circle cx={x} cy={y} r={radius + 6}
                  fill="none"
                  stroke={NODE_BORDER[node.type] ?? '#fff'}
                  strokeWidth={isCurrent ? 2 : 1.5}
                  opacity={isCurrent ? 0.4 : 0.25}>
            {isCurrent && (
              <>
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="2;4;2" dur="1.8s" repeatCount="indefinite" />
              </>
            )}
          </circle>
        )}

        {/* Drop-shadow pad (flat disc behind the coin, slightly offset down
            so the coin "sits" in the scene). */}
        {!isLocked && (
          <ellipse cx={x} cy={y + radius + 2} rx={radius * 0.85} ry={3}
                   fill="#000" opacity={0.35} />
        )}

        {/* The coin */}
        <circle cx={x} cy={y} r={radius}
                fill={isLocked ? '#0b1220' : isVisited ? '#111827' : `url(#${gradientId})`}
                stroke={rimColor}
                strokeWidth={rimWidth} />

        {/* Highlight arc — cheap pseudo-3D */}
        {!isLocked && !isVisited && (
          <path d={`M ${x - radius * 0.55} ${y - radius * 0.2}
                    Q ${x} ${y - radius * 0.85} ${x + radius * 0.55} ${y - radius * 0.2}`}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
                strokeLinecap="round" />
        )}

        {/* Emoji icon */}
        <text
          x={x} y={y + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={iconSize}
          fill={isVisited ? '#a0aec0' : '#fff'}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {iconText}
        </text>

        {/* Label below node */}
        {(isAvail || isCurrent || isBoss) && (
          <text
            x={x} y={y + half + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight="700"
            fill={NODE_BORDER[node.type] ?? '#fff'}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {(NODE_TYPES[node.type]?.label ?? '').toUpperCase()}
          </text>
        )}

        {/* BOSS crown label */}
        {isBoss && (
          <text
            x={x} y={y - half - 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight="900"
            fill="#fbbf24"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            ▲ BOSS ▲
          </text>
        )}
       </g>
      </g>
    );
  });

  // Floor labels
  const floorLabels = [];
  for (let row = 0; row < rows; row++) {
    const y         = rowY(row, rows);
    const isStart   = row === 0;
    const isBossRow = row === rows - 1;
    floorLabels.push(
      <text key={`fl-${row}`}
        x={lyt.svgW - 8} y={y}
        textAnchor="end" dominantBaseline="middle"
        fontSize={9} fontWeight="600"
        fill={isBossRow ? '#fbbf24' : isStart ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)'}
        style={{ userSelect: 'none' }}>
        {isBossRow ? '👑' : isStart ? 'START' : `F${row + 1}`}
      </text>
    );
  }

  const hpPct   = playerMaxHp > 0 ? Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100)) : 100;
  const hpColor = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
           style={{ background: '#0a1a0a', borderBottom: '2px solid #1a3a1a' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{dungeonEmoji}</span>
          <span className="font-black text-white tracking-wide" style={{ fontFamily: 'monospace' }}>
            {dungeonName.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">❤️</span>
          <div className="w-28 h-3 rounded-sm overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <div className="h-full transition-all" style={{ width: `${hpPct}%`, background: hpColor }} />
          </div>
          <span className="text-sm font-black text-white" style={{ fontFamily: 'monospace' }}>
            {playerHp}/{playerMaxHp}
          </span>
        </div>
      </div>

      {/* ── Scrollable map ── */}
      <div ref={(node) => { scrollRef.current = node; containerRef.current = node; }}
           className="flex-1 overflow-y-auto overflow-x-hidden"
           style={{ WebkitOverflowScrolling: 'touch', background: '#0d1f0d' }}>
        <svg
          width={lyt.svgW} height={height}
          viewBox={`0 0 ${lyt.svgW} ${height}`}
          style={{ display: 'block', touchAction: 'pan-y', width: '100%' }}
        >
          {/* Dark forest background */}
          <defs>
            <linearGradient id="forestBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#081408" />
              <stop offset="50%"  stopColor="#0d1f0d" />
              <stop offset="100%" stopColor="#0a1a0a" />
            </linearGradient>
          </defs>
          <rect width={lyt.svgW} height={height} fill="url(#forestBg)" />

          {/* Pixel art trees + mountains */}
          <ForestBackground svgW={lyt.svgW} svgH={height} />

          {floorLabels}
          {lines}
          {nodeEls}

          {/* ── Player pin: "you are here" marker on top of the current node ── */}
          {playerPinId && nodes[playerPinId] && (() => {
            const pn = nodes[playerPinId];
            const px = colX(pn.col, lyt);
            const py = rowY(pn.row, rows);
            const isBoss = pn.type === 'boss';
            const ns = isBoss ? BOSS_NS : NS;
            const pinY = py - ns / 2 - 16;
            return (
              <g key="player-pin" aria-label="Your current position">
                <circle cx={px} cy={pinY} r={9}
                        fill="#fbbf24" stroke="#fff" strokeWidth={2}>
                  <animate attributeName="r" values="9;11;9" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <text x={px} y={pinY + 3}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={11} fontWeight="900" fill="#0a1a0a"
                      style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  ★
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ── Available node chips ── */}
      {availableIds.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 flex-wrap"
             style={{ background: '#0a1a0a', borderTop: '2px solid #1a3a1a' }}>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Go →</span>
          {availableIds.map(id => {
            const n   = map.nodes[id];
            if (!n) return null;
            const def = NODE_TYPES[n.type];
            return (
              <button key={id}
                onClick={() => onSelectNode?.(id)}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg btn-press transition-all font-bold"
                style={{
                  background: NODE_BG[n.type],
                  border: `2px solid ${NODE_BORDER[n.type]}`,
                  color: NODE_BORDER[n.type],
                  fontFamily: 'monospace',
                }}>
                <span>{def?.icon}</span>
                <span>{def?.label?.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
