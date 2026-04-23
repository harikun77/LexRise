// ============================================================
// shuffle — unbiased Fisher-Yates helpers + option-order shuffle
// ============================================================
//
// WHY THIS EXISTS
//   1. `arr.sort(() => Math.random() - 0.5)` is not a uniform shuffle.
//      V8's TimSort compares pairs unevenly and keeps elements near
//      their original positions. We use Fisher-Yates everywhere instead.
//
//   2. Our authored question bank has a severe "option-B bias" — ~71%
//      of correct answers land at index 1 in the source data. That's
//      fine for the author but lethal for learning: players start
//      pattern-matching on position instead of content. We shuffle
//      the options on every question pick and remap the answer index
//      to follow the correct option into its new slot.
//
// USAGE
//   const q2 = shuffleOptionsPreservingAnswer(q);
//   // q2.options is reordered; q2.answer now points at the correct slot.
// ============================================================

/** Fisher-Yates shuffle in place. */
export function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Non-mutating shuffle — returns a new shuffled array. */
export function shuffled(arr) {
  return shuffleInPlace([...arr]);
}

/**
 * Shuffle a question's options and remap its `answer` index so the
 * correct option follows to its new slot. Guarantees the resulting
 * order is different from the input (avoids the rare identity shuffle).
 *
 * Accepts a question of shape:
 *   { options: string[], answer: number, ...rest }
 *
 * Returns a new object with `options` and `answer` updated; everything
 * else is carried through unchanged.
 */
export function shuffleOptionsPreservingAnswer(q) {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;
  if (typeof q.answer !== 'number') return q;

  const idxs = q.options.map((_, i) => i);
  shuffleInPlace(idxs);

  // If the shuffle happens to produce the identity permutation, force at
  // least one swap so the visible layout always changes.
  const unchanged = idxs.every((v, i) => v === i);
  if (unchanged) {
    const b = 1 + Math.floor(Math.random() * (idxs.length - 1));
    [idxs[0], idxs[b]] = [idxs[b], idxs[0]];
  }

  return {
    ...q,
    options: idxs.map(i => q.options[i]),
    answer:  idxs.indexOf(q.answer),
  };
}
