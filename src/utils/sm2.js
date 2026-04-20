// ============================================================
// SM-2 Spaced Repetition Algorithm
// ============================================================
// Based on the SuperMemo SM-2 algorithm.
// Each vocab word/question is tracked with:
//   easeFactor (EF) — starts at 2.5, adjusted by performance
//   interval      — days until next review
//   repetitions   — number of consecutive correct answers
//   nextReview     — ISO date string for next scheduled review
//
// Quality ratings we use:
//   5 = perfect answer (correct on first try)
//   3 = correct but hesitant (we don't distinguish — same bucket)
//   1 = incorrect
// ============================================================

const MIN_EASE = 1.3;
const STARTING_EASE = 2.5;

/**
 * Returns a new SM-2 record after a review session.
 * @param {object|undefined} record — existing SM-2 record (or undefined for new)
 * @param {boolean} correct — whether the answer was correct
 * @returns {object} updated record
 */
export function updateSM2(record, correct) {
  const now = new Date();
  const quality = correct ? 5 : 1;

  let { easeFactor = STARTING_EASE, interval = 0, repetitions = 0 } = record || {};

  if (quality >= 3) {
    // Correct answer — advance the schedule
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);

    repetitions += 1;
  } else {
    // Wrong — reset repetitions, short interval
    repetitions = 0;
    interval = 1;
  }

  // Adjust ease factor based on quality (SM-2 formula)
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview: nextReview.toISOString().split('T')[0], // YYYY-MM-DD
    lastReview: now.toISOString().split('T')[0],
  };
}

/**
 * Returns true if a word is due for review today (or overdue).
 * @param {object|undefined} record — SM-2 record
 * @returns {boolean}
 */
export function isDueForReview(record) {
  if (!record || !record.nextReview) return true; // Never seen = always due
  const today = new Date().toISOString().split('T')[0];
  return record.nextReview <= today;
}

/**
 * Pick the next vocab word using SM-2 priority:
 *   1. Words due for review today (overdue first, then by ease factor ASC)
 *   2. Words never seen
 *   3. Words not yet due (pick lowest ease factor — needs the most work)
 *
 * @param {array}  pool       — available word objects (already tier-filtered)
 * @param {object} sm2Records — { wordId: SM2Record, ... }
 * @returns {object} selected word
 */
export function pickWordSM2(pool, sm2Records) {
  if (!pool.length) return null;

  const today = new Date().toISOString().split('T')[0];

  // Separate into due / new / future
  const due    = pool.filter(w => sm2Records[w.id] && sm2Records[w.id].nextReview <= today);
  const unseen = pool.filter(w => !sm2Records[w.id]);
  const future = pool.filter(w => sm2Records[w.id] && sm2Records[w.id].nextReview > today);

  if (due.length > 0) {
    // Sort by nextReview ASC (most overdue first), then ease factor ASC (hardest first)
    due.sort((a, b) => {
      const ra = sm2Records[a.id], rb = sm2Records[b.id];
      if (ra.nextReview !== rb.nextReview) return ra.nextReview < rb.nextReview ? -1 : 1;
      return ra.easeFactor - rb.easeFactor;
    });
    return due[0];
  }

  if (unseen.length > 0) {
    return unseen[Math.floor(Math.random() * unseen.length)];
  }

  // All words seen and not due — pick the lowest ease factor (hardest)
  future.sort((a, b) => sm2Records[a.id].easeFactor - sm2Records[b.id].easeFactor);
  return future[0];
}

/**
 * Build a summary of the SM-2 schedule for display purposes.
 * @param {object} sm2Records
 * @returns {{ dueToday: number, dueSoon: number, mastered: number }}
 */
export function getScheduleSummary(sm2Records) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const threeDays = tomorrow.toISOString().split('T')[0];

  let dueToday = 0, dueSoon = 0, mastered = 0;

  Object.values(sm2Records).forEach(r => {
    if (r.nextReview <= today)    dueToday++;
    else if (r.nextReview <= threeDays) dueSoon++;
    if (r.interval >= 21)         mastered++;
  });

  return { dueToday, dueSoon, mastered };
}
