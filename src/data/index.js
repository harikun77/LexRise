// ============================================================
// LexRise Question Bank — Master Index
// ============================================================
//
// HOW TO ADD NEW CONTENT:
//   Vocab:   Add entries to the correct tier file in src/data/vocab/
//            Use the next sequential ID (t1v071, t2v081, t3v081...)
//            Never rename or reuse existing IDs — progress is tracked by ID.
//
//   Grammar: Add entries to the correct domain file in src/data/grammar/
//            Use the next sequential ID (gbnd026, gagr026, gmod021...)
//            Add a matching `domain` field (boundaries/agreement/modifiers/parallel/usage)
//
//   New domain: Create src/data/grammar/newdomain.js, export GRAMMAR_NEWDOMAIN,
//               then add one import + one spread below. Zero other changes needed.
//
//   PDF import: Paste extracted questions matching the shape of any entry below.
//               Required fields for vocab: id, word, definition, example, options (array of 4), answer (0-3), tier (1-3), xp
//               Required fields for grammar: id, sentence, question, options, answer, explanation, tier, xp, domain
//
// QUESTION COUNTS (update this comment when you add more):
//   Vocab legacy (v1-v40):     40 words  ← original seed bank
//   Vocab T1 (8th grade):      70 words
//   Vocab T2 (9th-10th grade): 80 words
//   Vocab T3 (SAT level):      80 words
//   Grammar legacy (g1-g22):   22 questions ← original seed bank
//   Grammar - Boundaries:      25 questions
//   Grammar - Agreement:       25 questions
//   Grammar - Modifiers:       20 questions
//   Grammar - Parallel:        20 questions
//   Grammar - Usage:           25 questions
//   TOTAL:                     407 questions
// ============================================================

// Legacy seed banks (IDs: v1-v40, g1-g22) — do NOT remove; progress saved by ID
import { VOCAB_WORDS    as VOCAB_LEGACY   } from './vocabulary';
import { GRAMMAR_CHALLENGES as GRAMMAR_LEGACY } from './grammar';

import { VOCAB_T1 } from './vocab/tier1_8th';
import { VOCAB_T2 } from './vocab/tier2_9th10th';
import { VOCAB_T3 } from './vocab/tier3_sat';

import { GRAMMAR_BOUNDARIES } from './grammar/boundaries';
import { GRAMMAR_AGREEMENT }  from './grammar/agreement';
import { GRAMMAR_MODIFIERS }  from './grammar/modifiers';
import { GRAMMAR_PARALLEL }   from './grammar/parallel';
import { GRAMMAR_USAGE }      from './grammar/usage';

// ── Vocab ────────────────────────────────────────────────────
export const ALL_VOCAB = [
  ...VOCAB_LEGACY,   // v1-v40: original 40 words
  ...VOCAB_T1,       // t1v001-t1v070
  ...VOCAB_T2,       // t2v001-t2v080
  ...VOCAB_T3,       // t3v001-t3v080
];

// ── Grammar ──────────────────────────────────────────────────
export const ALL_GRAMMAR = [
  ...GRAMMAR_LEGACY,     // g1-g22: original 22 challenges
  ...GRAMMAR_BOUNDARIES,
  ...GRAMMAR_AGREEMENT,
  ...GRAMMAR_MODIFIERS,
  ...GRAMMAR_PARALLEL,
  ...GRAMMAR_USAGE,
];

// Backward-compatible named exports (VocabForge + GrammarDojo use these)
export const VOCAB_WORDS      = ALL_VOCAB;
export const GRAMMAR_CHALLENGES = ALL_GRAMMAR;

// ── Metadata helpers ─────────────────────────────────────────
export const VOCAB_BY_TIER = {
  1: VOCAB_T1,
  2: VOCAB_T2,
  3: VOCAB_T3,
};

export const GRAMMAR_BY_DOMAIN = {
  boundaries: GRAMMAR_BOUNDARIES,
  agreement:  GRAMMAR_AGREEMENT,
  modifiers:  GRAMMAR_MODIFIERS,
  parallel:   GRAMMAR_PARALLEL,
  usage:      GRAMMAR_USAGE,
};

export const STATS = {
  vocabTotal:   ALL_VOCAB.length,
  grammarTotal: ALL_GRAMMAR.length,
  total:        ALL_VOCAB.length + ALL_GRAMMAR.length,
};
