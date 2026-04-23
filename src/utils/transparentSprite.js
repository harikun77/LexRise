// ============================================================
// transparentSprite — in-browser chroma-key for opaque sprite sheets
// ============================================================
//
// PROBLEM
//   Our monsters.png and bosses.png were exported as 8-bit RGB — no
//   alpha channel. Every enemy renders with a baked-in cream/beige
//   rectangle behind it, which looks jarring against the dark UI.
//
// SOLUTION
//   On first use of a sheet URL we:
//     1. Load it into a canvas.
//     2. Sample a handful of corner pixels to infer the background
//        colour (robust to slight gradient).
//     3. Walk every pixel; anything within `tolerance` of that
//        colour gets alpha=0. We also feather the edge so sprite
//        outlines don't get a hard halo.
//     4. Serialize the canvas to a blob: URL and return it.
//
//   Results are cached per original URL for the session. Failure
//   modes (CORS, decode errors) silently return the original URL
//   so sprites still render even if processing breaks.
// ============================================================

const cache = new Map(); // originalUrl -> Promise<processedUrl>

// RGB distance squared — cheap euclidean check. Good enough for flat AI-
// generated backgrounds; would need LAB distance for photo-realistic art.
function colorDistSq(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

function detectBackgroundColor(imageData) {
  const { data, width, height } = imageData;
  const samples = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
  ];
  let r = 0, g = 0, b = 0, n = 0;
  for (const [x, y] of samples) {
    const i = (y * width + x) * 4;
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    n++;
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/**
 * Make pixels matching the sampled background colour transparent.
 *
 * @param {string} url       — original image URL
 * @param {object} [opts]
 * @param {number} [opts.tolerance=42]   — Euclidean RGB distance threshold.
 *                                          Larger values strip more pixels.
 * @param {number} [opts.feather=18]     — Distance band above `tolerance`
 *                                          where alpha fades 0 → 255, to
 *                                          soften sprite edges.
 * @returns {Promise<string>} — resolves with a blob: URL containing the
 *                              processed image, or the original URL on
 *                              failure.
 */
export function makeTransparentSprite(url, opts = {}) {
  if (!url) return Promise.resolve(url);
  if (cache.has(url)) return cache.get(url);

  const tolerance = opts.tolerance ?? 42;
  const feather   = opts.feather ?? 18;

  const promise = new Promise((resolve) => {
    const img = new Image();
    // Most of our sheets are same-origin, but this makes canvas.toDataURL
    // usable even if they're fetched from a CDN that sets the right header.
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const [br, bg, bb] = detectBackgroundColor(imgData);

        const tol2     = tolerance * tolerance;
        const outerTol = tolerance + feather;
        const outer2   = outerTol * outerTol;
        const data     = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const d2 = colorDistSq(data[i], data[i + 1], data[i + 2], br, bg, bb);
          if (d2 <= tol2) {
            // Solidly background
            data[i + 3] = 0;
          } else if (d2 <= outer2) {
            // In the feather band — linear ramp from 0 to 255
            const t = (Math.sqrt(d2) - tolerance) / feather;
            data[i + 3] = Math.min(255, Math.round(data[i + 3] * t));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(url); return; }
            resolve(URL.createObjectURL(blob));
          },
          'image/png'
        );
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[transparentSprite] processing failed; using original', err);
        }
        resolve(url);
      }
    };

    img.onerror = () => resolve(url);
    img.src = url;
  });

  cache.set(url, promise);
  return promise;
}
