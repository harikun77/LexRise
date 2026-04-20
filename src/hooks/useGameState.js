import { useState, useEffect, useCallback } from 'react';
import { generateDailyQuests } from '../data/quests';
import { updateSM2 } from '../utils/sm2';

const STORAGE_KEY = 'lexrise_save';

const XP_PER_LEVEL = (level) => Math.floor(100 * Math.pow(1.3, level - 1));

const CLASS_TITLES = [
  { minLevel: 1, title: 'Apprentice Scholar', emoji: '📜' },
  { minLevel: 5, title: 'Word Seeker', emoji: '🔍' },
  { minLevel: 10, title: 'Lexicon Warrior', emoji: '⚔️' },
  { minLevel: 15, title: 'Grammar Knight', emoji: '🛡️' },
  { minLevel: 20, title: 'Syntax Mage', emoji: '🔮' },
  { minLevel: 30, title: 'Rhetoric Sage', emoji: '📚' },
  { minLevel: 40, title: 'Master Linguist', emoji: '👑' },
  { minLevel: 50, title: 'SAT Champion', emoji: '🏆' },
];

export function getPlayerClass(level) {
  for (let i = CLASS_TITLES.length - 1; i >= 0; i--) {
    if (level >= CLASS_TITLES[i].minLevel) return CLASS_TITLES[i];
  }
  return CLASS_TITLES[0];
}

const DEFAULT_STATE = {
  player: {
    name: 'Scholar',
    level: 1,
    xp: 0,
    gems: 0,
    streak: 0,
    lastPlayedDate: null,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    longestStreak: 0,
    currentStreak: 0,
  },
  skills: {
    vocabulary: { level: 1, xp: 0, correct: 0, total: 0, masteredIds: [] },
    grammar:    { level: 1, xp: 0, correct: 0, total: 0, masteredIds: [] },
    reading:    { level: 1, xp: 0, correct: 0, total: 0, masteredIds: [] },
  },
  dailyQuests: [],
  dailyQuestDate: null,
  achievements: [],
  lastBossDate: null,    // ISO week string (YYYY-Www) to enforce weekly cooldown
  vocabSM2: {},   // SM-2 records: { wordId: { easeFactor, interval, repetitions, nextReview } }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw);
    // Deep merge so new fields added to DEFAULT_STATE are picked up by
    // existing saves automatically — no progress wipe on schema changes.
    return {
      ...DEFAULT_STATE,
      ...saved,
      player: { ...DEFAULT_STATE.player, ...(saved.player || {}) },
      skills: {
        vocabulary: { ...DEFAULT_STATE.skills.vocabulary, ...(saved.skills?.vocabulary || {}) },
        grammar:    { ...DEFAULT_STATE.skills.grammar,    ...(saved.skills?.grammar    || {}) },
        reading:    { ...DEFAULT_STATE.skills.reading,    ...(saved.skills?.reading    || {}) },
      },
      // Preserve existing SM-2 records; new keys default to empty object
      vocabSM2: { ...(saved.vocabSM2 || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function useGameState() {
  const [state, setState] = useState(loadState);
  const [xpPopups, setXpPopups] = useState([]);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(null);

  // Persist on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Check/reset daily quests
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.dailyQuestDate !== today) {
      const seed = new Date().getDate() + new Date().getMonth() * 31;
      setState(s => ({
        ...s,
        dailyQuests: generateDailyQuests(seed),
        dailyQuestDate: today,
      }));
    }
    // Check streak
    if (state.player.lastPlayedDate) {
      const last = new Date(state.player.lastPlayedDate);
      const now = new Date();
      const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        setState(s => ({
          ...s,
          player: { ...s.player, streak: 0 },
        }));
      }
    }
  }, []);

  const addXpPopup = useCallback((amount, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setXpPopups(p => [...p, { id, amount, x, y }]);
    setTimeout(() => setXpPopups(p => p.filter(pp => pp.id !== id)), 1400);
  }, []);

  const awardXP = useCallback((xpGain, skill, questionId) => {
    setState(s => {
      const newPlayerXp = s.player.xp + xpGain;
      const xpNeeded = XP_PER_LEVEL(s.player.level);
      const levelsUp = newPlayerXp >= xpNeeded;
      const newLevel = levelsUp ? s.player.level + 1 : s.player.level;
      const remainingXp = levelsUp ? newPlayerXp - xpNeeded : newPlayerXp;

      if (levelsUp) {
        setTimeout(() => {
          setLevelUpAnim(true);
          setTimeout(() => setLevelUpAnim(false), 1200);
        }, 100);
      }

      const today = new Date().toDateString();
      const wasToday = s.player.lastPlayedDate === today;
      const newStreak = wasToday ? s.player.streak : s.player.streak + 1;

      const skillUpdate = skill ? {
        skills: {
          ...s.skills,
          [skill]: {
            ...s.skills[skill],
            xp: s.skills[skill].xp + xpGain,
            correct: s.skills[skill].correct + 1,
            total: s.skills[skill].total + 1,
            masteredIds: questionId && !s.skills[skill].masteredIds.includes(questionId)
              ? [...s.skills[skill].masteredIds, questionId]
              : s.skills[skill].masteredIds,
          }
        }
      } : {};

      return {
        ...s,
        ...skillUpdate,
        player: {
          ...s.player,
          xp: remainingXp,
          level: newLevel,
          gems: s.player.gems + Math.floor(xpGain / 20),
          streak: newStreak,
          lastPlayedDate: today,
          totalQuestionsAnswered: s.player.totalQuestionsAnswered + 1,
          totalCorrect: s.player.totalCorrect + 1,
          longestStreak: Math.max(s.player.longestStreak, newStreak),
        },
      };
    });
    addXpPopup(xpGain);
  }, [addXpPopup]);

  const recordWrong = useCallback((skill) => {
    setState(s => ({
      ...s,
      skills: skill ? {
        ...s.skills,
        [skill]: {
          ...s.skills[skill],
          total: s.skills[skill].total + 1,
        }
      } : s.skills,
      player: {
        ...s.player,
        totalQuestionsAnswered: s.player.totalQuestionsAnswered + 1,
        currentStreak: 0,
      },
    }));
  }, []);

  const setPlayerName = useCallback((name) => {
    setState(s => ({ ...s, player: { ...s.player, name } }));
  }, []);

  // Update SM-2 record for a vocab word after answering
  // Helper: returns ISO week string "YYYY-Www"
  function getISOWeek() {
    const d = new Date();
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const weekNo = Math.ceil(((d - jan4) / 86400000 + jan4.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
  }

  const bossAvailableThisWeek = state.lastBossDate !== getISOWeek();

  const claimBossWeek = useCallback(() => {
    setState(s => ({ ...s, lastBossDate: getISOWeek() }));
  }, []);

  // ── Save Export / Import ───────────────────────────────
  const exportSave = useCallback(() => {
    try {
      const raw  = localStorage.getItem(STORAGE_KEY) || '{}';
      const date = new Date().toISOString().split('T')[0];
      const blob = new Blob([raw], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `lexrise-save-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const importSave = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.name.endsWith('.json')) {
        reject(new Error('Please select a valid LexRise .json save file.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          // Basic validation — must look like a LexRise save
          if (!parsed.player || !parsed.skills) {
            reject(new Error('This does not appear to be a valid LexRise save file.'));
            return;
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          // Reload state from the imported save without a page refresh
          setState(loadState());
          resolve({ ok: true, playerName: parsed.player?.name });
        } catch {
          reject(new Error('Could not read the save file. It may be corrupted.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }, []);

  const updateVocabSM2 = useCallback((wordId, correct) => {
    setState(s => ({
      ...s,
      vocabSM2: {
        ...s.vocabSM2,
        [wordId]: updateSM2(s.vocabSM2[wordId], correct),
      },
    }));
  }, []);

  const updateQuestProgress = useCallback((type, amount = 1) => {
    setState(s => {
      const updated = s.dailyQuests.map(q => {
        if (q.completed) return q;
        // q.type === 'any' matches everything; otherwise type must match exactly
        const matches = q.type === 'any' || q.type === type;
        if (!matches) return q;
        const newProgress = Math.min(q.progress + amount, q.target);
        const justCompleted = newProgress >= q.target && !q.completed;
        if (justCompleted) {
          setTimeout(() => setQuestCompleted(q), 100);
        }
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      });
      const completedQ = updated.find(q => q.completed && !s.dailyQuests.find(old => old.id === q.id && old.completed));
      if (completedQ) {
        return {
          ...s,
          dailyQuests: updated,
          player: {
            ...s.player,
            xp: s.player.xp + completedQ.xpReward,
            gems: s.player.gems + completedQ.gemReward,
          },
        };
      }
      return { ...s, dailyQuests: updated };
    });
  }, []);

  const xpToNextLevel = XP_PER_LEVEL(state.player.level);
  const xpPercent = Math.min(100, Math.floor((state.player.xp / xpToNextLevel) * 100));

  return {
    state,
    xpPopups,
    levelUpAnim,
    questCompleted,
    setQuestCompleted,
    setPlayerName,
    updateVocabSM2,
    bossAvailableThisWeek,
    claimBossWeek,
    exportSave,
    importSave,
    awardXP,
    recordWrong,
    updateQuestProgress,
    xpToNextLevel,
    xpPercent,
    getPlayerClass,
  };
}
