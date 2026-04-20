export const QUEST_TEMPLATES = [
  { id: 'q1',  title: 'First Steps',       description: 'Answer 5 vocabulary questions',          icon: '⚔️', type: 'vocab',   target: 5,  xpReward: 50,  gemReward: 5  },
  { id: 'q2',  title: 'Grammar Guardian',  description: 'Complete 3 grammar challenges',           icon: '🛡️', type: 'grammar', target: 3,  xpReward: 40,  gemReward: 4  },
  { id: 'q3',  title: 'Streak Keeper',     description: 'Get 3 correct answers in a row',          icon: '🔥', type: 'streak',  target: 3,  xpReward: 30,  gemReward: 3  },
  { id: 'q4',  title: 'Vocab Warrior',     description: 'Answer 10 vocabulary questions',          icon: '📖', type: 'vocab',   target: 10, xpReward: 80,  gemReward: 8  },
  { id: 'q5',  title: 'Grammar Master',    description: 'Complete 5 grammar challenges',           icon: '✍️', type: 'grammar', target: 5,  xpReward: 70,  gemReward: 7  },
  { id: 'q6',  title: 'Perfect Round',     description: 'Get 5 correct in a row with no mistakes', icon: '⭐', type: 'perfect', target: 5,  xpReward: 100, gemReward: 10 },
  { id: 'q7',  title: 'Daily Scholar',     description: 'Complete any 8 questions today',          icon: '🎓', type: 'any',     target: 8,  xpReward: 60,  gemReward: 6  },
  { id: 'q8',  title: 'Tier Climber',      description: 'Answer 3 advanced-tier questions',        icon: '🏆', type: 'tier3',   target: 3,  xpReward: 90,  gemReward: 9  },
  { id: 'q9',  title: 'Ancient Scholar',   description: 'Answer 3 reading comprehension questions',icon: '📜', type: 'reading', target: 3,  xpReward: 60,  gemReward: 6  },
  { id: 'q10', title: 'Passage Explorer',  description: 'Complete a full reading passage',         icon: '🗺️', type: 'reading', target: 4,  xpReward: 80,  gemReward: 8  },
  { id: 'q11', title: 'Well-Rounded',      description: 'Answer questions from 2 different skills',icon: '🌟', type: 'any',     target: 10, xpReward: 75,  gemReward: 7  },
];

export function generateDailyQuests(seed) {
  const available = [...QUEST_TEMPLATES];
  const picked = [];
  const indices = [seed % available.length, (seed + 3) % available.length, (seed + 5) % available.length];
  const unique = [...new Set(indices)].slice(0, 3);
  while (unique.length < 3) {
    const next = (unique[unique.length - 1] + 1) % available.length;
    if (!unique.includes(next)) unique.push(next);
  }
  return unique.map(i => ({ ...available[i], progress: 0, completed: false }));
}
