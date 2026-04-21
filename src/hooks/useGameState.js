import { useState, useEffect, useCallback } from 'react';
import { generateDailyQuests } from '../data/quests';
import { updateSM2 } from '../utils/sm2';
import { idbSave, idbLoad } from '../utils/idbStorage';
import {
  STARTER_WEAPON, STARTER_ARMOR,
  applyPotion, getTotalAttack, getTotalDefense,
  getXPMultFromArmor, getHPBonusFromArmor, getAttackBonusFromArmor,
  hasSpecialEffect, getSellPrice, ALL_ITEMS_MAP, POTIONS_MAP,
} from '../data/rpg/items';
import { getXPMultiplier } from '../data/rpg/enemies';
import { getDungeonFarmMultiplier } from '../data/rpg/dungeons';

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
  lastBossDate: null,
  vocabSM2: {},

  // ── RPG Stats ───────────────────────────────────────────
  rpg: {
    // Combat stats (recalculated from level + gear)
    hp:          100,   // current HP
    maxHp:       100,   // base max HP (grows with level)
    baseAttack:  5,     // base attack (grows with level)
    baseDefense: 2,     // base defense (grows with level)
    // Dungeon progress
    currentFloor:  1,
    deepestFloor:  1,
    // Farming tracker: { [floor]: count } for XP diminishing returns
    floorEncounterCounts: {},
    // Phoenix Guard resurrection used this battle
    phoenixUsed: false,
  },

  // ── Inventory ───────────────────────────────────────────
  inventory: {
    weaponId: null,    // equipped weapon ID (null = starter)
    armorId:  null,    // equipped armor ID (null = starter)
    // Potion bag: { [potionId]: quantity }
    potions: {},
    // General bag: array of { itemId, quantity }
    bag: [],
  },

  // ── Dungeon Progress ─────────────────────────────────────
  // { [dungeonId]: { bossDefeated, floorsCleared, runCount } }
  dungeonProgress: {
    dungeon_01: { bossDefeated: false, floorsCleared: 0, runCount: 0 },
  },

  // Active dungeon run state (null when not inside a dungeon)
  // Set by the Phaser dungeon game when a run begins
  activeDungeon: null,
};

// ── Deep merge helper ────────────────────────────────────
function mergeWithDefaults(saved) {
  return {
    ...DEFAULT_STATE,
    ...saved,
    player: { ...DEFAULT_STATE.player, ...(saved.player || {}) },
    skills: {
      vocabulary: { ...DEFAULT_STATE.skills.vocabulary, ...(saved.skills?.vocabulary || {}) },
      grammar:    { ...DEFAULT_STATE.skills.grammar,    ...(saved.skills?.grammar    || {}) },
      reading:    { ...DEFAULT_STATE.skills.reading,    ...(saved.skills?.reading    || {}) },
    },
    vocabSM2: { ...(saved.vocabSM2 || {}) },
    // Deep merge RPG stats — existing save values take priority
    rpg: { ...DEFAULT_STATE.rpg, ...(saved.rpg || {}),
      floorEncounterCounts: { ...(saved.rpg?.floorEncounterCounts || {}) },
    },
    // Deep merge inventory
    inventory: { ...DEFAULT_STATE.inventory, ...(saved.inventory || {}),
      potions: { ...(saved.inventory?.potions || {}) },
      bag:     Array.isArray(saved.inventory?.bag) ? [...saved.inventory.bag] : [],
    },
    // Deep merge dungeon progress — merge each dungeon's record individually
    dungeonProgress: {
      ...DEFAULT_STATE.dungeonProgress,
      ...(saved.dungeonProgress || {}),
    },
    activeDungeon: saved.activeDungeon ?? null,
  };
}

// ── Load: localStorage first, fall back to IndexedDB ────
// loadState is called synchronously on React init, so it reads
// localStorage. The async IDB fallback runs as a side-effect if
// localStorage is empty (i.e. was cleared by iOS Safari).
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return mergeWithDefaults(JSON.parse(raw));
  } catch {}
  return DEFAULT_STATE; // IDB fallback runs in useEffect below
}

// ── Save: write to localStorage synchronously + IDB async ─
function saveState(state) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, json);
    // Async backup to IndexedDB — fire-and-forget, never blocks
    idbSave(json);
  } catch {}
}

export default function useGameState() {
  const [state, setState] = useState(loadState);
  const [xpPopups, setXpPopups] = useState([]);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(null);

  // Persist on every state change (localStorage + IDB)
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── IDB Fallback Recovery ──────────────────────────────
  // If localStorage was cleared by iOS (7-day eviction), this
  // runs once on mount, detects the empty localStorage, and
  // restores the last known state from IndexedDB.
  useEffect(() => {
    const lsEmpty = !localStorage.getItem(STORAGE_KEY);
    if (!lsEmpty) return; // localStorage is fine — nothing to do

    idbLoad().then(json => {
      if (!json) return; // No IDB backup either
      try {
        const saved = JSON.parse(json);
        if (!saved?.player) return; // Not a valid save
        const restored = mergeWithDefaults(saved);
        setState(restored);
        // Immediately write it back to localStorage so next
        // sync reads are fast again
        localStorage.setItem(STORAGE_KEY, json);
        console.log('[LexRise] Progress restored from IndexedDB backup ✓');
      } catch {
        // Corrupt backup — ignore, user starts fresh
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── RPG Computed Values ──────────────────────────────────
  const equippedWeaponId = state.inventory?.weaponId || STARTER_WEAPON?.id;
  const equippedArmorId  = state.inventory?.armorId  || STARTER_ARMOR?.id;
  const totalAttack  = getTotalAttack(state.rpg?.baseAttack  ?? 5, equippedWeaponId)
                     + getAttackBonusFromArmor(equippedArmorId);
  const totalDefense = getTotalDefense(state.rpg?.baseDefense ?? 2, equippedArmorId);
  const hpBonus      = getHPBonusFromArmor(equippedArmorId);
  const effectiveMaxHp = (state.rpg?.maxHp ?? 100) + hpBonus;

  // ── RPG Actions ──────────────────────────────────────────

  /** Heal player HP (from potion or battle reward) */
  const healPlayer = useCallback((amount) => {
    setState(s => ({
      ...s,
      rpg: {
        ...s.rpg,
        hp: Math.min(effectiveMaxHp, (s.rpg?.hp ?? 100) + amount),
      },
    }));
  }, [effectiveMaxHp]);

  /** Take damage in battle. Returns true if player survives. */
  const takeDamage = useCallback((rawDamage) => {
    setState(s => {
      const armor = s.inventory?.armorId || STARTER_ARMOR?.id;
      const defense = getTotalDefense(s.rpg?.baseDefense ?? 2, armor)
                    + getAttackBonusFromArmor(armor); // defensive bonus
      const damage = Math.max(1, rawDamage - defense);
      const currentHp = s.rpg?.hp ?? 100;
      let newHp = currentHp - damage;

      // Phoenix Guard: revive once when HP hits 0
      if (newHp <= 0 && hasSpecialEffect(armor, 'resurrect') && !s.rpg?.phoenixUsed) {
        newHp = 30;
        return { ...s, rpg: { ...s.rpg, hp: newHp, phoenixUsed: true } };
      }

      return { ...s, rpg: { ...s.rpg, hp: Math.max(0, newHp) } };
    });
  }, []);

  /** Reset HP to max (used when returning to town / floor entrance) */
  const resetPhoenix = useCallback(() => {
    setState(s => ({ ...s, rpg: { ...s.rpg, phoenixUsed: false } }));
  }, []);

  /** Fully restore HP to max */
  const fullHeal = useCallback(() => {
    setState(s => ({
      ...s,
      rpg: { ...s.rpg, hp: effectiveMaxHp },
    }));
  }, [effectiveMaxHp]);

  /** Use a potion from inventory during battle */
  const usePotion = useCallback((potionId) => {
    setState(s => {
      const qty = s.inventory?.potions?.[potionId] ?? 0;
      if (qty <= 0) return s;
      const potion = POTIONS_MAP[potionId];
      if (!potion) return s;
      const armorId = s.inventory?.armorId || STARTER_ARMOR?.id;
      const maxHp   = (s.rpg?.maxHp ?? 100) + getHPBonusFromArmor(armorId);
      const newHp   = applyPotion(potion, s.rpg?.hp ?? 100, maxHp);
      return {
        ...s,
        rpg: { ...s.rpg, hp: newHp },
        inventory: {
          ...s.inventory,
          potions: { ...s.inventory.potions, [potionId]: qty - 1 },
        },
      };
    });
  }, []);

  /** Equip a weapon from bag */
  const equipWeapon = useCallback((weaponId) => {
    setState(s => ({
      ...s,
      inventory: { ...s.inventory, weaponId },
    }));
  }, []);

  /** Equip armor from bag */
  const equipArmor = useCallback((armorId) => {
    setState(s => ({
      ...s,
      inventory: { ...s.inventory, armorId },
    }));
  }, []);

  /** Buy an item from the shop */
  const buyItem = useCallback((itemId) => {
    setState(s => {
      const item = ALL_ITEMS_MAP[itemId];
      if (!item) return s;
      if ((s.player.gems ?? 0) < item.price) return s; // not enough gems

      const newGems = s.player.gems - item.price;

      if (item.type === 'potion') {
        const current = s.inventory?.potions?.[itemId] ?? 0;
        const limit   = item.stackLimit ?? 10;
        if (current >= limit) return s;
        return {
          ...s,
          player: { ...s.player, gems: newGems },
          inventory: {
            ...s.inventory,
            potions: { ...s.inventory.potions, [itemId]: current + 1 },
          },
        };
      }

      // Weapon or armor — goes into bag (or equip immediately if no item of that type equipped)
      const bag = [...(s.inventory?.bag ?? [])];
      const existingIdx = bag.findIndex(b => b.itemId === itemId);
      if (existingIdx >= 0) {
        bag[existingIdx] = { ...bag[existingIdx], quantity: bag[existingIdx].quantity + 1 };
      } else {
        bag.push({ itemId, quantity: 1 });
      }

      // Auto-equip if slot is empty (starter or null)
      let weaponId = s.inventory?.weaponId;
      let armorId  = s.inventory?.armorId;
      if (item.type === 'weapon' && !weaponId) weaponId = itemId;
      if (item.type === 'armor'  && !armorId)  armorId  = itemId;

      return {
        ...s,
        player: { ...s.player, gems: newGems },
        inventory: { ...s.inventory, bag, weaponId, armorId },
      };
    });
  }, []);

  /** Sell an item back at 50% */
  const sellItem = useCallback((itemId) => {
    setState(s => {
      const item = ALL_ITEMS_MAP[itemId];
      if (!item || item.price === 0) return s;
      const sellPrice = getSellPrice(item);

      if (item.type === 'potion') {
        const qty = s.inventory?.potions?.[itemId] ?? 0;
        if (qty <= 0) return s;
        return {
          ...s,
          player: { ...s.player, gems: s.player.gems + sellPrice },
          inventory: {
            ...s.inventory,
            potions: { ...s.inventory.potions, [itemId]: qty - 1 },
          },
        };
      }

      // Remove from bag
      const bag = (s.inventory?.bag ?? [])
        .map(b => b.itemId === itemId ? { ...b, quantity: b.quantity - 1 } : b)
        .filter(b => b.quantity > 0);

      // Unequip if was equipped
      let weaponId = s.inventory?.weaponId;
      let armorId  = s.inventory?.armorId;
      if (weaponId === itemId) weaponId = null;
      if (armorId  === itemId) armorId  = null;

      return {
        ...s,
        player: { ...s.player, gems: s.player.gems + sellPrice },
        inventory: { ...s.inventory, bag, weaponId, armorId },
      };
    });
  }, []);

  /** Record a floor encounter for XP diminishing returns tracking */
  const recordFloorEncounter = useCallback((floor) => {
    setState(s => {
      const counts = { ...(s.rpg?.floorEncounterCounts ?? {}) };
      counts[floor] = (counts[floor] ?? 0) + 1;
      return { ...s, rpg: { ...s.rpg, floorEncounterCounts: counts } };
    });
  }, []);

  /** Get current XP multiplier for a floor (diminishing returns) */
  const getFloorXPMultiplier = useCallback((floor) => {
    const count = state.rpg?.floorEncounterCounts?.[floor] ?? 0;
    return getXPMultiplier(count);
  }, [state.rpg?.floorEncounterCounts]);

  /** Update deepest floor reached */
  const updateFloor = useCallback((floor) => {
    setState(s => ({
      ...s,
      rpg: {
        ...s.rpg,
        currentFloor: floor,
        deepestFloor: Math.max(s.rpg?.deepestFloor ?? 1, floor),
      },
    }));
  }, []);

  /** Level up RPG stats (called from awardXP level-up) */
  const upgradeRPGStats = useCallback((newLevel) => {
    setState(s => {
      const baseMaxHp    = 100 + (newLevel - 1) * 10;
      const baseAttack   = 5   + Math.floor((newLevel - 1) * 1.5);
      const baseDefense  = 2   + Math.floor((newLevel - 1) * 0.8);
      return {
        ...s,
        rpg: {
          ...s.rpg,
          maxHp:       baseMaxHp,
          hp:          Math.min(s.rpg?.hp ?? 100, baseMaxHp),
          baseAttack,
          baseDefense,
        },
      };
    });
  }, []);

  // ── Dungeon Actions ─────────────────────────────────────

  /** Start a dungeon run */
  const startDungeon = useCallback((dungeonId) => {
    setState(s => ({
      ...s,
      activeDungeon: {
        dungeonId,
        currentFloor: 1,
        encounterOnFloor: 1,
        floorEncounterCounts: {},
        startTime: Date.now(),
      },
    }));
  }, []);

  /** Record floor cleared progress */
  const recordFloorCleared = useCallback((dungeonId, floor) => {
    setState(s => {
      const prev = s.dungeonProgress?.[dungeonId] || { bossDefeated: false, floorsCleared: 0, runCount: 0 };
      return {
        ...s,
        dungeonProgress: {
          ...s.dungeonProgress,
          [dungeonId]: { ...prev, floorsCleared: Math.max(prev.floorsCleared, floor) },
        },
        activeDungeon: s.activeDungeon
          ? { ...s.activeDungeon, currentFloor: floor + 1, encounterOnFloor: 1 }
          : s.activeDungeon,
      };
    });
  }, []);

  /** Record boss defeated — unlock next dungeon */
  const defeatBoss = useCallback((dungeonId, bonusXP, bonusGems) => {
    setState(s => {
      const prev = s.dungeonProgress?.[dungeonId] || { bossDefeated: false, floorsCleared: 0, runCount: 0 };
      const farmMult = getDungeonFarmMultiplier(dungeonId, s.dungeonProgress);
      const finalXP   = Math.floor((bonusXP   ?? 0) * farmMult);
      const finalGems = Math.floor((bonusGems ?? 0) * farmMult);
      return {
        ...s,
        player: {
          ...s.player,
          xp:   s.player.xp   + finalXP,
          gems: s.player.gems + finalGems,
        },
        dungeonProgress: {
          ...s.dungeonProgress,
          [dungeonId]: {
            ...prev,
            bossDefeated: true,
            runCount: prev.runCount + 1,
          },
        },
        activeDungeon: null,  // run complete
      };
    });
  }, []);

  /** Exit dungeon without completing (retreat) */
  const retreatDungeon = useCallback(() => {
    setState(s => ({ ...s, activeDungeon: null }));
  }, []);

  /** Record an encounter in the active dungeon for per-floor XP tracking */
  const recordDungeonEncounter = useCallback((dungeonId, floor) => {
    setState(s => {
      const counts = { ...(s.activeDungeon?.floorEncounterCounts ?? {}) };
      counts[floor] = (counts[floor] ?? 0) + 1;
      return {
        ...s,
        activeDungeon: s.activeDungeon
          ? { ...s.activeDungeon, floorEncounterCounts: counts,
              encounterOnFloor: (s.activeDungeon.encounterOnFloor ?? 1) + 1 }
          : s.activeDungeon,
      };
    });
  }, []);

  /** Get XP multiplier for an encounter in the active dungeon */
  const getDungeonEncounterXPMult = useCallback((dungeonId, floor) => {
    const floorCount  = state.activeDungeon?.floorEncounterCounts?.[floor] ?? 0;
    const dungeonMult = getDungeonFarmMultiplier(dungeonId, state.dungeonProgress);
    const floorMult   = getXPMultiplier(floorCount);
    return floorMult * dungeonMult;
  }, [state.activeDungeon, state.dungeonProgress]);

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
    // ── RPG ─────────────────────────────────────────────────
    rpgStats: {
      hp:          state.rpg?.hp ?? 100,
      maxHp:       effectiveMaxHp,
      baseAttack:  state.rpg?.baseAttack  ?? 5,
      baseDefense: state.rpg?.baseDefense ?? 2,
      totalAttack,
      totalDefense,
      currentFloor: state.rpg?.currentFloor  ?? 1,
      deepestFloor: state.rpg?.deepestFloor  ?? 1,
      phoenixUsed:  state.rpg?.phoenixUsed   ?? false,
    },
    equippedWeaponId,
    equippedArmorId,
    healPlayer,
    takeDamage,
    fullHeal,
    resetPhoenix,
    usePotion,
    equipWeapon,
    equipArmor,
    buyItem,
    sellItem,
    recordFloorEncounter,
    getFloorXPMultiplier,
    updateFloor,
    upgradeRPGStats,
    // ── Dungeon ──────────────────────────────────────────────
    startDungeon,
    recordFloorCleared,
    defeatBoss,
    retreatDungeon,
    recordDungeonEncounter,
    getDungeonEncounterXPMult,
  };
}
