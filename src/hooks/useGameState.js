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

// ─────────────────────────────────────────────────────────────
// applyXPGainToState — shared XP → level-up helper
//
// Every path that awards XP to the player (battles, scrolls, daily quests,
// dungeon completion bonuses) routes through this function so the level-up
// + RPG-stat-scaling logic only lives in one place.
//
// Previously `updateQuestProgress` and `finishDungeonRun` mutated player.xp
// directly, so a bonus that crossed the level threshold would leave the player
// at e.g. xp=150/xpToNext=100 without ever levelling up — the XP bar would
// overflow past 100% and only reset when the next battle awarded XP through
// awardXP. Now all XP goes through the same loop.
//
// Returns patches that should be spread into the setState return:
//   { player: {...}, rpg?: {...}, levelsGained }
// ─────────────────────────────────────────────────────────────
function applyXPGainToState(state, xpGain, extraPlayerPatches = {}) {
  let level        = state.player.level;
  let remainingXp  = state.player.xp + xpGain;
  let levelsGained = 0;
  while (remainingXp >= XP_PER_LEVEL(level)) {
    remainingXp -= XP_PER_LEVEL(level);
    level        += 1;
    levelsGained += 1;
  }

  const rpgPatch = levelsGained > 0
    ? {
        rpg: {
          ...state.rpg,
          maxHp:       12 + (level - 1) * 8,
          hp:          Math.min((state.rpg?.hp ?? 12) + 5 * levelsGained, 12 + (level - 1) * 8),
          baseAttack:  3  + (level - 1) * 2,
          baseDefense: Math.floor((level - 1) * 1),
        },
      }
    : null;

  return {
    playerPatch: {
      ...state.player,
      ...extraPlayerPatches,
      xp: remainingXp,
      level,
    },
    rpgPatch,
    levelsGained,
  };
}

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
    hp:          12,    // current HP
    maxHp:       12,    // base max HP (grows with level)
    baseAttack:  3,     // base attack (grows with level)
    baseDefense: 0,     // base defense (grows with level)
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

  // Active dungeon run (null when not in a run)
  activeDungeon: null,

  // Pre-run snapshot — restored on abandon (no-exit rule)
  // Stores { player, rpg } at the moment the player confirmed entry
  preDungeonSnapshot: null,
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
    activeDungeon:       saved.activeDungeon       ?? null,
    preDungeonSnapshot:  saved.preDungeonSnapshot  ?? null,
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
        if (import.meta.env.DEV) {
          console.log('[LexRise] Progress restored from IndexedDB backup ✓');
        }
      } catch {
        // Corrupt backup — ignore, user starts fresh
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Daily rollover + streak reset ────────────────────────
  // Runs on mount AND every 5 minutes so the rollover fires even if the
  // user keeps the tab open across midnight.
  useEffect(() => {
    const check = () => {
      const today = new Date().toDateString();
      setState(s => {
        let next = s;
        if (next.dailyQuestDate !== today) {
          const seed = new Date().getDate() + new Date().getMonth() * 31;
          next = {
            ...next,
            dailyQuests: generateDailyQuests(seed),
            dailyQuestDate: today,
          };
        }
        if (next.player.lastPlayedDate) {
          const last     = new Date(next.player.lastPlayedDate);
          const now      = new Date();
          const daysDiff = Math.floor((now - last) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1 && next.player.streak !== 0) {
            next = { ...next, player: { ...next.player, streak: 0 } };
          }
        }
        return next;
      });
    };
    check();
    const interval = setInterval(check, 5 * 60 * 1000); // every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const addXpPopup = useCallback((amount, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setXpPopups(p => [...p, { id, amount, x, y }]);
    setTimeout(() => setXpPopups(p => p.filter(pp => pp.id !== id)), 1400);
  }, []);

  const awardXP = useCallback((xpGain, skill, questionId) => {
    setState(s => {
      const today    = new Date().toDateString();
      const wasToday = s.player.lastPlayedDate === today;

      // Delegate level-up + RPG scaling to the shared helper so quest rewards
      // and dungeon bonuses follow identical rules.
      const { playerPatch, rpgPatch, levelsGained } = applyXPGainToState(s, xpGain, {
        gems:                   s.player.gems + Math.floor(xpGain / 20),
        streak:                 wasToday ? s.player.streak : s.player.streak + 1,
        lastPlayedDate:         today,
        totalQuestionsAnswered: s.player.totalQuestionsAnswered + 1,
        totalCorrect:           s.player.totalCorrect + 1,
        longestStreak:          Math.max(s.player.longestStreak, wasToday ? s.player.streak : s.player.streak + 1),
      });

      if (levelsGained > 0) {
        setTimeout(() => {
          setLevelUpAnim(true);
          setTimeout(() => setLevelUpAnim(false), 1200);
        }, 100);
      }

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
        ...(rpgPatch || {}),
        player: playerPatch,
      };
    });
    addXpPopup(xpGain);
  }, [addXpPopup]);

  /** Award gems outside of the XP pipeline (e.g. streak-milestone chests) */
  const awardGems = useCallback((amount) => {
    if (!amount || amount <= 0) return;
    setState(s => ({
      ...s,
      player: { ...s.player, gems: (s.player.gems ?? 0) + amount },
    }));
  }, []);

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
      let bonusXp   = 0;
      let bonusGems = 0;
      const updated = s.dailyQuests.map(q => {
        if (q.completed) return q;
        const matches = q.type === 'any' || q.type === type;
        if (!matches) return q;
        const newProgress   = Math.min(q.progress + amount, q.target);
        const justCompleted = newProgress >= q.target;
        if (justCompleted) {
          bonusXp   += q.xpReward  ?? 0;
          bonusGems += q.gemReward ?? 0;
          setTimeout(() => setQuestCompleted(q), 100);
        }
        return { ...q, progress: newProgress, completed: justCompleted };
      });
      if (bonusXp === 0 && bonusGems === 0) {
        return { ...s, dailyQuests: updated };
      }
      // Route quest XP through the shared level-up helper so a big completion
      // bonus that crosses the threshold triggers a proper level-up (and the
      // XP bar never overflows past 100%).
      const { playerPatch, rpgPatch, levelsGained } = applyXPGainToState(s, bonusXp, {
        gems: s.player.gems + bonusGems,
      });
      if (levelsGained > 0) {
        setTimeout(() => {
          setLevelUpAnim(true);
          setTimeout(() => setLevelUpAnim(false), 1200);
        }, 100);
      }
      return {
        ...s,
        dailyQuests: updated,
        ...(rpgPatch || {}),
        player: playerPatch,
      };
    });
  }, []);

  const xpToNextLevel = XP_PER_LEVEL(state.player.level);
  const xpPercent = Math.min(100, Math.floor((state.player.xp / xpToNextLevel) * 100));

  // ── RPG Computed Values ──────────────────────────────────
  const equippedWeaponId = state.inventory?.weaponId || STARTER_WEAPON?.id;
  const equippedArmorId  = state.inventory?.armorId  || STARTER_ARMOR?.id;
  const totalAttack  = getTotalAttack(state.rpg?.baseAttack  ?? 3, equippedWeaponId)
                     + getAttackBonusFromArmor(equippedArmorId);
  const totalDefense = getTotalDefense(state.rpg?.baseDefense ?? 0, equippedArmorId);
  const hpBonus      = getHPBonusFromArmor(equippedArmorId);
  const effectiveMaxHp = (state.rpg?.maxHp ?? 12) + hpBonus;

  // ── RPG Actions ──────────────────────────────────────────

  /** Heal player HP (from potion or battle reward) */
  const healPlayer = useCallback((amount) => {
    setState(s => ({
      ...s,
      rpg: {
        ...s.rpg,
        hp: Math.min(effectiveMaxHp, (s.rpg?.hp ?? 12) + amount),
      },
    }));
  }, [effectiveMaxHp]);

  /** Take damage in battle. Returns true if player survives. */
  const takeDamage = useCallback((rawDamage) => {
    setState(s => {
      const armor = s.inventory?.armorId || STARTER_ARMOR?.id;
      const defense = getTotalDefense(s.rpg?.baseDefense ?? 0, armor)
                    + getAttackBonusFromArmor(armor); // defensive bonus
      const damage = Math.max(1, rawDamage - defense);
      const currentHp = s.rpg?.hp ?? 12;
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
      const maxHp   = (s.rpg?.maxHp ?? 12) + getHPBonusFromArmor(armorId);
      const newHp   = applyPotion(potion, s.rpg?.hp ?? 12, maxHp);
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
      const baseMaxHp    = 12 + (newLevel - 1) * 8;
      const baseAttack   = 3  + (newLevel - 1) * 2;
      const baseDefense  = Math.floor((newLevel - 1) * 1);
      return {
        ...s,
        rpg: {
          ...s.rpg,
          maxHp:       baseMaxHp,
          hp:          Math.min(s.rpg?.hp ?? 12, baseMaxHp),
          baseAttack,
          baseDefense,
        },
      };
    });
  }, []);

  // ── Dungeon Run Actions (map-based system) ─────────────────

  /**
   * Begin a dungeon run — saves a pre-run snapshot (for no-exit restore)
   * and records the map seed.
   */
  const startDungeonRun = useCallback((dungeonId, mapSeed) => {
    setState(s => ({
      ...s,
      activeDungeon: { dungeonId, mapSeed, visitedNodes: [], startTime: Date.now() },
      // Snapshot: restore point if player abandons
      preDungeonSnapshot: {
        player: { ...s.player },
        rpg:    { ...s.rpg },
      },
    }));
  }, []);

  /**
   * Mark a node as visited in the active run.
   */
  const completeDungeonNode = useCallback((nodeId) => {
    setState(s => ({
      ...s,
      activeDungeon: s.activeDungeon
        ? { ...s.activeDungeon, visitedNodes: [...(s.activeDungeon.visitedNodes ?? []), nodeId] }
        : s.activeDungeon,
    }));
  }, []);

  /**
   * Finish a successful run — award completion XP/gems, mark boss defeated,
   * unlock next dungeon, clear snapshot.
   */
  const finishDungeonRun = useCallback((dungeonId, bonusXP, bonusGems) => {
    setState(s => {
      const prev = s.dungeonProgress?.[dungeonId] || { bossDefeated: false, floorsCleared: 0, runCount: 0 };
      const farmMult  = getDungeonFarmMultiplier(dungeonId, s.dungeonProgress);
      const finalXP   = Math.floor((bonusXP   ?? 0) * farmMult);
      const finalGems = Math.floor((bonusGems ?? 0) * farmMult);

      // Route dungeon completion XP through the shared level-up helper so
      // the bonus can legitimately level the player up (and bypass the old
      // bug where completing a dungeon at 90 XP left you at 190/100 with no
      // level-up until the next battle).
      const { playerPatch, rpgPatch, levelsGained } = applyXPGainToState(s, finalXP, {
        gems: s.player.gems + finalGems,
      });
      if (levelsGained > 0) {
        setTimeout(() => {
          setLevelUpAnim(true);
          setTimeout(() => setLevelUpAnim(false), 1200);
        }, 100);
      }

      return {
        ...s,
        ...(rpgPatch || {}),
        player: playerPatch,
        dungeonProgress: {
          ...s.dungeonProgress,
          [dungeonId]: { ...prev, bossDefeated: true, runCount: prev.runCount + 1 },
        },
        activeDungeon:      null,
        preDungeonSnapshot: null,
      };
    });
  }, []);

  /**
   * Abandon a run mid-way — restores pre-run snapshot (no-exit rule).
   * Player loses all XP/gems earned during the run.
   */
  const abandonDungeonRun = useCallback(() => {
    setState(s => {
      if (!s.preDungeonSnapshot) return { ...s, activeDungeon: null };
      const snap = s.preDungeonSnapshot;
      return {
        ...s,
        player:             { ...s.player, ...snap.player },
        rpg:                { ...s.rpg,    ...snap.rpg    },
        activeDungeon:      null,
        preDungeonSnapshot: null,
      };
    });
  }, []);

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
    awardGems,
    recordWrong,
    updateQuestProgress,
    xpToNextLevel,
    xpPercent,
    getPlayerClass,
    // Count of dungeons the player has fully cleared (boss defeated).
    // Used by the Study reward multiplier so deep dungeon progress buffs
    // study XP — incentivizing study at high levels.
    dungeonsCleared: Object.values(state.dungeonProgress || {})
      .filter(d => d?.bossDefeated === true)
      .length,
    // ── RPG ─────────────────────────────────────────────────
    rpgStats: {
      hp:          state.rpg?.hp ?? 12,
      maxHp:       effectiveMaxHp,
      baseAttack:  state.rpg?.baseAttack  ?? 3,
      baseDefense: state.rpg?.baseDefense ?? 0,
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
    // ── Dungeon (map-based run system) ───────────────────────
    startDungeonRun,
    completeDungeonNode,
    finishDungeonRun,
    abandonDungeonRun,
  };
}
