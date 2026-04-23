// ============================================================
// EnemySprite — Renders a pixel-art-style placeholder for
// enemies that don't yet have a real PNG sprite.
//
// HOW TO ADD REAL SPRITES:
//   1. Create 64×64px pixel art PNG for each enemy
//   2. Name it exactly matching enemy.sprite + ".png"
//      e.g. enemy_zolvrak.png
//   3. Drop it in: public/sprites/enemies/
//   4. The component automatically uses the PNG if it exists,
//      falls back to the SVG placeholder if it doesn't.
//
// SPRITE MAP — drop PNG files here to replace placeholders:
//   enemy_zolvrak.png        Zolvrak (B1 slime)
//   enemy_mimbi.png          Mimbi (B1 beast)
//   enemy_quelzar.png        Quelzar (B1 spirit)
//   enemy_vorpling.png       Vorpling (B1-B2 slime)
//   enemy_snorrek.png        Snorrek (B1-B2 beast)
//   enemy_thurvak.png        Thurvak (B2 humanoid)
//   enemy_selphor.png        Selphor (B2 spirit)
//   enemy_draxling.png       Draxling (B2-B3 dragon)
//   enemy_quilbane.png       Quilbane (B2 beast)
//   enemy_mirkfang.png       Mirkfang (B2-B3 beast)
//   enemy_veldrak.png        Veldrak (B3 humanoid)
//   enemy_cynthara.png       Cynthara (B3 humanoid)
//   enemy_glomborg.png       Glomborg (B3-B4 beast)
//   enemy_zephirin.png       Zephirin (B3 spirit)
//   enemy_ashvane.png        Ashvane (B3-B4 beast)
//   enemy_kronvex.png        Kronvex (B4 humanoid)
//   enemy_sylvarim.png       Sylvarim (B4 humanoid)
//   enemy_brundak.png        Brundak (B4-B5 beast)
//   enemy_nekraal.png        Nekraal (B4 humanoid)
//   enemy_volthorn.png       Volthorn (B4-B5 dragon)
//   enemy_orzimeth.png       Orzimeth (B5 humanoid)
//   enemy_valkris.png        Valkris (B5 dragon)
//   enemy_pharaxon.png       Pharaxon (B5 humanoid)
//   enemy_thalvex.png        Thalvex (B5 beast)
//   enemy_crucibel.png       Crucibel (B5 spirit)
//   enemy_xaldrath.png       Xaldrath (B6 humanoid)
//   enemy_drakmoor.png       Drakmoor (B6 dragon)
//   enemy_malachar.png       Malachar (B6 humanoid)
//   enemy_zervonis.png       Zervonis (B6 spirit)
//   enemy_krevatar.png       Krevatar (BOSS)
//
//   Items (drop in public/sprites/items/):
//   weapon_staff_wood.png    weapon_dagger_iron.png
//   weapon_tome_scholar.png  weapon_wand_crystal.png
//   weapon_blade_phantom.png weapon_staff_rune.png
//   weapon_lance_dragon.png  weapon_scepter_void.png
//   weapon_grimoire_ancient.png  weapon_lexicons_edge.png
//   armor_robe_cloth.png     armor_tunic_leather.png
//   ... (all 20 armor files)
//   potion_small.png  potion_standard.png
//   potion_hi.png     potion_elixir.png
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { getMonsterSpriteStyle, getBossSpriteStyle } from '../data/rpg/spriteConfig';
import { makeTransparentSprite } from '../utils/transparentSprite';

const BASE_URL = import.meta.env.BASE_URL || '/';

// Hook: given an original image URL, returns a processed URL with the
// background chroma-keyed to transparent. Falls back to the original URL
// while processing is in flight (so sprites never pop-in blank).
function useTransparentUrl(url) {
  const [processed, setProcessed] = useState(url);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setProcessed(url); // show untouched image immediately
    makeTransparentSprite(url).then((finalUrl) => {
      if (!cancelled) setProcessed(finalUrl);
    });
    return () => { cancelled = true; };
  }, [url]);
  return processed;
}

// Shape-to-SVG renderers (pixel-art style using simple shapes)
const SHAPE_RENDERERS = {
  slime: (color) => `
    <ellipse cx="32" cy="40" rx="24" ry="18" fill="${color}" />
    <ellipse cx="32" cy="30" rx="20" ry="22" fill="${color}" />
    <circle cx="24" cy="26" r="4" fill="white"/>
    <circle cx="40" cy="26" r="4" fill="white"/>
    <circle cx="25" cy="26" r="2" fill="#111"/>
    <circle cx="41" cy="26" r="2" fill="#111"/>
    <path d="M26 36 Q32 40 38 36" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
  `,
  beast: (color) => `
    <rect x="16" y="20" width="32" height="28" rx="6" fill="${color}"/>
    <rect x="14" y="14" width="12" height="14" rx="4" fill="${color}"/>
    <rect x="38" y="14" width="12" height="14" rx="4" fill="${color}"/>
    <polygon points="14,14 20,6 26,14" fill="${color}"/>
    <polygon points="38,14 44,6 50,14" fill="${color}"/>
    <circle cx="24" cy="28" r="4" fill="white"/>
    <circle cx="40" cy="28" r="4" fill="white"/>
    <circle cx="25" cy="28" r="2" fill="#111"/>
    <circle cx="41" cy="28" r="2" fill="#111"/>
    <path d="M24 38 Q32 44 40 38" stroke="#111" stroke-width="2" fill="none"/>
  `,
  humanoid: (color) => `
    <circle cx="32" cy="16" r="10" fill="${color}"/>
    <rect x="22" y="26" width="20" height="22" rx="3" fill="${color}"/>
    <rect x="10" y="26" width="10" height="18" rx="3" fill="${color}"/>
    <rect x="44" y="26" width="10" height="18" rx="3" fill="${color}"/>
    <rect x="20" y="46" width="10" height="14" rx="3" fill="${color}"/>
    <rect x="34" y="46" width="10" height="14" rx="3" fill="${color}"/>
    <circle cx="28" cy="14" r="3" fill="white"/>
    <circle cx="36" cy="14" r="3" fill="white"/>
    <circle cx="29" cy="14" r="1.5" fill="#111"/>
    <circle cx="37" cy="14" r="1.5" fill="#111"/>
  `,
  dragon: (color) => `
    <ellipse cx="32" cy="36" rx="20" ry="14" fill="${color}"/>
    <circle cx="32" cy="20" r="12" fill="${color}"/>
    <polygon points="20,10 26,2 30,12" fill="${color}"/>
    <polygon points="44,10 38,2 34,12" fill="${color}"/>
    <ellipse cx="32" cy="50" rx="8" ry="4" fill="${color}"/>
    <path d="M40 50 Q52 44 56 36 Q52 48 42 52" fill="${color}"/>
    <circle cx="27" cy="18" r="4" fill="white"/>
    <circle cx="37" cy="18" r="4" fill="white"/>
    <circle cx="28" cy="18" r="2" fill="#111"/>
    <circle cx="38" cy="18" r="2" fill="#111"/>
    <path d="M28 26 L36 26" stroke="#a00" stroke-width="2"/>
  `,
  spirit: (color) => `
    <ellipse cx="32" cy="32" rx="16" ry="22" fill="${color}" opacity="0.85"/>
    <ellipse cx="32" cy="18" rx="12" ry="12" fill="${color}"/>
    <path d="M16 48 Q20 54 24 48 Q28 54 32 48 Q36 54 40 48 Q44 54 48 48" 
          fill="${color}" opacity="0.85"/>
    <circle cx="27" cy="18" r="4" fill="white" opacity="0.9"/>
    <circle cx="37" cy="18" r="4" fill="white" opacity="0.9"/>
    <circle cx="28" cy="18" r="2" fill="#001"/>
    <circle cx="38" cy="18" r="2" fill="#001"/>
    <ellipse cx="32" cy="26" rx="6" ry="2" fill="#111" opacity="0.4"/>
  `,
  boss: (color) => `
    <rect x="8" y="8" width="48" height="48" rx="4" fill="${color}" opacity="0.2"/>
    <circle cx="32" cy="24" r="14" fill="${color}"/>
    <polygon points="18,12 14,4 22,10" fill="${color}"/>
    <polygon points="46,12 50,4 42,10" fill="${color}"/>
    <polygon points="32,8 29,2 35,2" fill="${color}"/>
    <rect x="18" y="36" width="28" height="18" rx="3" fill="${color}"/>
    <rect x="8" y="36" width="10" height="16" rx="3" fill="${color}"/>
    <rect x="46" y="36" width="10" height="16" rx="3" fill="${color}"/>
    <circle cx="27" cy="22" r="5" fill="#ffd700"/>
    <circle cx="37" cy="22" r="5" fill="#ffd700"/>
    <circle cx="28" cy="22" r="2.5" fill="#111"/>
    <circle cx="38" cy="22" r="2.5" fill="#111"/>
    <path d="M26 32 Q32 28 38 32" stroke="#ffd700" stroke-width="2" fill="none"/>
    <rect x="26" y="20" width="12" height="3" rx="1" fill="#ffd700" opacity="0.5"/>
  `,
};

function PlaceholderSprite({ enemy, size = 64, className = '' }) {
  const renderer = SHAPE_RENDERERS[enemy.shape] || SHAPE_RENDERERS.slime;
  const svgContent = renderer(enemy.color);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={{ imageRendering: 'pixelated' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

/**
 * EnemySprite
 *
 * Priority order:
 *  1. Boss/elite sheet  (bosses.png)   — if getBossSpriteStyle returns coords
 *  2. Monster sheet     (monsters.png) — if getMonsterSpriteStyle returns coords
 *  3. Individual PNG    (/sprites/enemies/{sprite}.png)
 *  4. SVG placeholder   (always works, no files needed)
 *
 * Drop the sprite sheets into public/sprites/ and sprites appear automatically.
 */
export default function EnemySprite({ enemy, size = 64, className = '', animated = false }) {
  const [sheetFailed, setSheetFailed] = useState(false);
  const [pngFailed, setPngFailed]     = useState(false);

  // Individual-PNG path: process transparency once the src is known.
  const rawPngUrl  = `${BASE_URL}sprites/enemies/${enemy.sprite}.png`;
  const pngUrl     = useTransparentUrl(rawPngUrl);

  const animCls = animated ? 'animate-bounce' : '';

  // 1 & 2 — Try sprite sheets first (boss sheet → monster sheet)
  if (!sheetFailed) {
    const isBossType  = enemy.shape === 'boss' || enemy.elite;
    const sheetStyle  = isBossType
      ? getBossSpriteStyle(enemy.sprite, size) ?? getMonsterSpriteStyle(enemy.sprite, size)
      : getMonsterSpriteStyle(enemy.sprite, size) ?? getBossSpriteStyle(enemy.sprite, size);

    if (sheetStyle) {
      return (
        <SheetSprite
          style={sheetStyle}
          name={enemy.name}
          className={`${className} ${animCls}`}
          onFail={() => setSheetFailed(true)}
        />
      );
    }
  }

  // 3 — Individual PNG fallback (transparency-keyed)
  if (!pngFailed) {
    return (
      <img
        src={pngUrl}
        alt={enemy.name}
        width={size}
        height={size}
        className={`${className} ${animCls}`}
        style={{
          imageRendering: 'pixelated',
          // Subtle drop shadow "grounds" transparent sprites into the scene
          // without dimming them. Tuned to be visible on dark gray (#111) and
          // on gradient backgrounds alike.
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
        }}
        onError={() => setPngFailed(true)}
      />
    );
  }

  // 4 — SVG placeholder (always available)
  return (
    <div className={`inline-block ${className} ${animCls}`} style={{ width: size, height: size }}>
      <PlaceholderSprite enemy={enemy} size={size} />
    </div>
  );
}

/**
 * Renders a sprite from a sheet using CSS background-position.
 *
 * Two-stage load:
 *   1. Extract the sheet URL from the `background-image` string.
 *   2. Probe it with a hidden Image() so we can onError → onFail
 *      (CSS background-image never fires onError on a <div>).
 *   3. Run makeTransparentSprite() on it so the rendered sheet has a
 *      transparent background instead of the baked-in beige rectangle.
 *      Swap the style's backgroundImage to the processed blob: URL.
 */
function SheetSprite({ style, name, className, onFail }) {
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;

  const [resolvedStyle, setResolvedStyle] = useState(style);

  useEffect(() => {
    const raw = style.backgroundImage ?? '';
    const url = raw.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    if (!url) { onFailRef.current?.(); return; }

    // Optimistically render the original style while we're still probing
    // (avoids flicker), then upgrade to the transparent version.
    setResolvedStyle(style);

    const probe = new Image();
    probe.onerror = () => onFailRef.current?.();
    probe.src = url;

    let cancelled = false;
    makeTransparentSprite(url).then((finalUrl) => {
      if (cancelled) return;
      if (finalUrl === url) return; // processing failed; keep original
      setResolvedStyle({ ...style, backgroundImage: `url("${finalUrl}")` });
    });
    return () => { cancelled = true; };
  }, [style]);

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        ...resolvedStyle,
        // Drop shadow after the chroma-key makes transparent sprites feel
        // anchored instead of floating. See the PNG path for matching values.
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
      }}
      title={name}
    />
  );
}

/**
 * ItemSprite — same fallback logic for weapons/armor/potions
 */
export function ItemSprite({ item, size = 32, className = '' }) {
  const [useFallback, setUseFallback] = useState(false);
  const folder = item.type === 'weapon' ? 'weapons'
               : item.type === 'armor'  ? 'armor'
               : 'potions';
  const src = `${BASE_URL}sprites/items/${folder}/${item.sprite}.png`;

  if (useFallback) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.6 }}>
        {item.emoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={item.name}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      onError={() => setUseFallback(true)}
    />
  );
}
