// ============================================================
// studyRewards — multiplier stack for Study-mode XP and gems
//
// Study previously returned only the base XP written in the question
// data, which meant high-level players felt no incentive to study versus
// grinding dungeons (which also drop enemy gems + completion bonuses).
//
// This module centralizes the bonus math so all three study screens
// (VocabForge, GrammarDojo, ReadingCitadel) apply identical incentives.
//
// Bonus stack (multiplicative):
//   • Streak multiplier
//       3–4  correct in a row → 1.25×
//       5–9                  → 1.5×
//       10+                  → 2×
//   • Daily-focus category match → 2×
//   • Dungeon-progression scaling → 1 + 0.05 × dungeonsCleared, capped 2×
//
// Milestone gem drops (added on top of awardXP's automatic gem drip):
//   • Every 5-streak  → +5  gems
//   • Every 10-streak → +15 gems
//
// getDailyFocus() rotates ['vocab', 'grammar', 'reading'] by calendar day
// so the focus matches between study and dungeon.
// ============================================================

export const STUDY_DAILY_FOCUS_TYPES = ['vocab', 'grammar', 'reading'];

export function getDailyFocus() {
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  return STUDY_DAILY_FOCUS_TYPES[dayNumber % STUDY_DAILY_FOCUS_TYPES.length];
}

export function getStreakMultiplier(streak) {
  if (streak >= 10) return { value: 2.0,  label: `🔥 ${streak}-streak · ×2.0` };
  if (streak >= 5)  return { value: 1.5,  label: `🔥 ${streak}-streak · ×1.5` };
  if (streak >= 3)  return { value: 1.25, label: `🔥 ${streak}-streak · ×1.25` };
  return { value: 1.0, label: null };
}

export function getDungeonProgressMultiplier(dungeonsCleared) {
  // +5% per dungeon cleared, capped at 2× (ie. 20 dungeons maxes it out).
  const raw = 1 + 0.05 * Math.max(0, dungeonsCleared);
  const capped = Math.min(2.0, raw);
  if (dungeonsCleared <= 0) return { value: 1.0, label: null };
  return {
    value: capped,
    label: `🗺️ ${dungeonsCleared} dungeon${dungeonsCleared === 1 ? '' : 's'} cleared · ×${capped.toFixed(2)}`,
  };
}

/**
 * Compute the XP, gems, and per-bonus breakdown for a single correct
 * study answer.
 *
 * @param {object} args
 * @param {number} args.baseXP          — the question's raw XP value (question.xp)
 * @param {number} args.roundStreak     — consecutive correct answers in this session
 *                                         (BEFORE this correct answer is counted)
 * @param {'vocab'|'grammar'|'reading'} args.qtype
 * @param {string} [args.dailyFocus]    — today's focus category (defaults to getDailyFocus())
 * @param {number} [args.dungeonsCleared = 0]
 *
 * @returns {{
 *   xp: number,          // final XP (base × multipliers, rounded)
 *   gemBonus: number,    // milestone gems AWARDED ON TOP of awardXP's automatic floor(xp/20)
 *   multiplier: number,  // combined multiplier applied to base XP
 *   bonuses: Array<{ label: string, kind: 'streak'|'focus'|'progress'|'milestone' }>
 * }}
 */
export function computeStudyReward({
  baseXP,
  roundStreak,
  qtype,
  dailyFocus = getDailyFocus(),
  dungeonsCleared = 0,
} = {}) {
  // The streak *after* this correct answer lands (what the player will see
  // reflected once the next question renders). We use the post-increment
  // value for threshold logic so the first answer that hits 3 earns the
  // bonus immediately.
  const nextStreak = (roundStreak ?? 0) + 1;

  const streak    = getStreakMultiplier(nextStreak);
  const progress  = getDungeonProgressMultiplier(dungeonsCleared);
  const focusHit  = qtype && qtype === dailyFocus;

  const focusMult = focusHit ? 2.0 : 1.0;
  const combined  = streak.value * focusMult * progress.value;

  const bonuses = [];
  if (streak.label)   bonuses.push({ label: streak.label,                    kind: 'streak'   });
  if (focusHit)       bonuses.push({ label: '⭐ Daily Focus · ×2.0',          kind: 'focus'    });
  if (progress.label) bonuses.push({ label: progress.label,                  kind: 'progress' });

  // Milestone gems trigger on reaching the streak — not cumulatively per
  // answer. So hitting the 10th adds 15, the 15th adds 5, the 20th adds 15…
  let gemBonus = 0;
  if (nextStreak > 0 && nextStreak % 10 === 0) {
    gemBonus += 15;
    bonuses.push({ label: `💎 +15 gems (${nextStreak}-streak chest!)`, kind: 'milestone' });
  } else if (nextStreak > 0 && nextStreak % 5 === 0) {
    gemBonus += 5;
    bonuses.push({ label: `💎 +5 gems (${nextStreak}-streak!)`, kind: 'milestone' });
  }

  return {
    xp:         Math.round((baseXP ?? 0) * combined),
    gemBonus,
    multiplier: combined,
    bonuses,
  };
}
