// ============================================================
// Reading Citadel — Master Index
//
// HOW TO ADD PASSAGES:
//   1. Create or append to the correct tier file in src/data/reading/
//   2. Use next sequential ID: rp1_006, rp2_006, rp3_006
//   3. Each passage needs: id, title, tier, passage (string), questions[]
//   4. Each question needs: id, type, question, options[4], answer (0-3), explanation, xp
//   5. Question types: main_idea | inference | vocab_context | detail | purpose | evidence
//
// PASSAGE COUNTS:
//   Tier 1 (8th grade):     5 passages, 18 questions
//   Tier 2 (9th-10th):      5 passages, 19 questions
//   Tier 3 (SAT level):     5 passages, 20 questions
//   TOTAL:                  15 passages, 57 questions
// ============================================================

import { READING_T1 } from './tier1_passages';
import { READING_T2 } from './tier2_passages';
import { READING_T3 } from './tier3_passages';

export const ALL_PASSAGES = [
  ...READING_T1,
  ...READING_T2,
  ...READING_T3,
];

export const PASSAGES_BY_TIER = {
  1: READING_T1,
  2: READING_T2,
  3: READING_T3,
};

// Flatten all questions for stats
export const ALL_READING_QUESTIONS = ALL_PASSAGES.flatMap(p =>
  p.questions.map(q => ({ ...q, passageId: p.id, passageTier: p.tier }))
);

export const READING_STATS = {
  passageCount: ALL_PASSAGES.length,
  questionCount: ALL_READING_QUESTIONS.length,
};
