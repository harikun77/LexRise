// ============================================================
// LexRise RPG — Items
// Weapons (10), Armor (20), Potions (4)
// ============================================================
// SPRITE PLACEHOLDERS:
//   Weapons: /sprites/items/weapon_{id}.png
//   Armor:   /sprites/items/armor_{id}.png
//   Potions: /sprites/items/potion_{id}.png
//
// PRICE: in gems  |  SELL: 50% of buy price (rounded down)
//
// WEAPON DAMAGE FORMULA:
//   Player total attack = player.baseAttack + weapon.atk
//
// ARMOR DEFENSE FORMULA:
//   Player total defense = player.baseDefense + armor.def
//   Some armor has bonus HP (hpBonus), XP multiplier (xpMult),
//   or passive attack bonus (atkBonus).
// ============================================================

// ── WEAPONS ──────────────────────────────────────────────────

export const WEAPONS = [
  {
    id: 'weapon_staff_wood',
    name: 'Wooden Staff',
    sprite: 'weapon_staff_wood',
    emoji: '🪵',
    type: 'weapon',
    atk: 2,
    price: 0,
    sell: 0,
    tier: 'starter',
    description: 'A gnarly branch found outside the dungeon entrance. Better than nothing.',
    flavorText: '"Every scholar begins with wood."',
  },
  {
    id: 'weapon_dagger_iron',
    name: 'Iron Dagger',
    sprite: 'weapon_dagger_iron',
    emoji: '🗡️',
    type: 'weapon',
    atk: 5,
    price: 20,
    sell: 10,
    tier: 'common',
    description: 'A short iron blade. Quick to wield. Good for the first few floors.',
    flavorText: '"Swift and sharp — like a well-placed comma."',
  },
  {
    id: 'weapon_tome_scholar',
    name: "Scholar's Tome",
    sprite: 'weapon_tome_scholar',
    emoji: '📕',
    type: 'weapon',
    atk: 8,
    price: 45,
    sell: 22,
    tier: 'common',
    description: 'A heavy book of forgotten knowledge. Deals surprising damage on a direct hit.',
    flavorText: '"Knowledge is the sharpest weapon."',
  },
  {
    id: 'weapon_wand_crystal',
    name: 'Crystal Wand',
    sprite: 'weapon_wand_crystal',
    emoji: '🔮',
    type: 'weapon',
    atk: 12,
    price: 80,
    sell: 40,
    tier: 'uncommon',
    description: 'A wand carved from a single shard of dungeon crystal. Hums faintly.',
    flavorText: '"The answers come clearer when you hold it."',
  },
  {
    id: 'weapon_blade_phantom',
    name: 'Phantom Blade',
    sprite: 'weapon_blade_phantom',
    emoji: '⚔️',
    type: 'weapon',
    atk: 16,
    price: 120,
    sell: 60,
    tier: 'uncommon',
    description: 'A sword that phases through armor but strikes the mind directly.',
    flavorText: '"It finds the gaps in your enemy\'s reasoning."',
  },
  {
    id: 'weapon_staff_rune',
    name: 'Runic Staff',
    sprite: 'weapon_staff_rune',
    emoji: '🔱',
    type: 'weapon',
    atk: 20,
    price: 180,
    sell: 90,
    tier: 'rare',
    description: 'Carved with ancient runes that amplify the power of correct answers.',
    flavorText: '"Each rune is a lesson mastered."',
  },
  {
    id: 'weapon_lance_dragon',
    name: 'Dragon Lance',
    sprite: 'weapon_lance_dragon',
    emoji: '🏹',
    type: 'weapon',
    atk: 25,
    price: 250,
    sell: 125,
    tier: 'rare',
    description: 'Forged from a dragon fang. Penetrates even the strongest enemy defense.',
    flavorText: '"Taken from Draxling\'s elder. It still remembers."',
  },
  {
    id: 'weapon_scepter_void',
    name: 'Void Scepter',
    sprite: 'weapon_scepter_void',
    emoji: '🌑',
    type: 'weapon',
    atk: 32,
    price: 350,
    sell: 175,
    tier: 'epic',
    description: 'A scepter that channels the energy of the void. Answers land with crushing force.',
    flavorText: '"The void asks no questions. It only judges."',
  },
  {
    id: 'weapon_grimoire_ancient',
    name: 'Ancient Grimoire',
    sprite: 'weapon_grimoire_ancient',
    emoji: '📚',
    type: 'weapon',
    atk: 40,
    price: 500,
    sell: 250,
    tier: 'epic',
    description: 'A grimoire older than the dungeon itself. Every correct answer shakes the walls.',
    flavorText: '"Written by those who mastered the SAT… and ascended."',
  },
  {
    id: 'weapon_lexicons_edge',
    name: "Lexicon's Edge",
    sprite: 'weapon_lexicons_edge',
    emoji: '✨',
    type: 'weapon',
    atk: 50,
    price: 800,
    sell: 400,
    tier: 'legendary',
    description: 'The legendary blade of the Scholar-King. Said to end the dungeon in a single run.',
    flavorText: '"Only those who truly know language may wield it."',
  },
];

// ── ARMOR ─────────────────────────────────────────────────────

export const ARMOR = [
  // ── Light (low def, cheap) ─────────────────────────────────
  {
    id: 'armor_robe_cloth',
    name: 'Cloth Robe',
    sprite: 'armor_robe_cloth',
    emoji: '👘',
    type: 'armor',
    def: 1,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 0,
    sell: 0,
    tier: 'starter',
    description: 'Standard dungeon attire. Provides minimal protection from enemy attacks.',
    flavorText: '"It\'s clean, at least."',
  },
  {
    id: 'armor_tunic_leather',
    name: 'Leather Tunic',
    sprite: 'armor_tunic_leather',
    emoji: '🧥',
    type: 'armor',
    def: 3,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 15,
    sell: 7,
    tier: 'common',
    description: 'Tough leather that deflects light blows from B1 enemies.',
    flavorText: '"Zolvrak slime doesn\'t stick to it. A win."',
  },
  {
    id: 'armor_cloak_traveler',
    name: "Traveler's Cloak",
    sprite: 'armor_cloak_traveler',
    emoji: '🧣',
    type: 'armor',
    def: 5,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 35,
    sell: 17,
    tier: 'common',
    description: 'A thick wool cloak with a deep hood. Protects against cold attacks too.',
    flavorText: '"Good against Brundak. Great against rain."',
  },
  {
    id: 'armor_vestments_scholar',
    name: "Scholar's Vestments",
    sprite: 'armor_vestments_scholar',
    emoji: '🎓',
    type: 'armor',
    def: 7,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 60,
    sell: 30,
    tier: 'common',
    description: 'Academic robes reinforced with subtle enchantments.',
    flavorText: '"The traditional uniform of B2 graduates."',
  },
  {
    id: 'armor_coat_enchanted',
    name: 'Enchanted Coat',
    sprite: 'armor_coat_enchanted',
    emoji: '✨',
    type: 'armor',
    def: 9,
    hpBonus: 10,
    atkBonus: 0,
    xpMult: 1.0,
    price: 90,
    sell: 45,
    tier: 'common',
    description: 'A long coat woven with minor defensive runes. Adds a little extra HP.',
    flavorText: '"Sewn by a B2 shopkeeper with talent beyond her pay grade."',
  },
  // ── Medium ────────────────────────────────────────────────
  {
    id: 'armor_shirt_chain',
    name: 'Chain Shirt',
    sprite: 'armor_shirt_chain',
    emoji: '⛓️',
    type: 'armor',
    def: 12,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 130,
    sell: 65,
    tier: 'uncommon',
    description: 'Interlocked iron rings. Serious protection starting on B3.',
    flavorText: '"The rings catch the Zephirin\'s wind-cuts."',
  },
  {
    id: 'armor_cuirass_bronze',
    name: 'Bronze Cuirass',
    sprite: 'armor_cuirass_bronze',
    emoji: '🛡️',
    type: 'armor',
    def: 15,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 180,
    sell: 90,
    tier: 'uncommon',
    description: 'A solid bronze chest plate. Heavy but effective against physical blows.',
    flavorText: '"Kronvex\'s lesser cousins wear this."',
  },
  {
    id: 'armor_breastplate_iron',
    name: 'Iron Breastplate',
    sprite: 'armor_breastplate_iron',
    emoji: '🔩',
    type: 'armor',
    def: 18,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 240,
    sell: 120,
    tier: 'uncommon',
    description: 'Full iron coverage. Required equipment for B4 adventurers.',
    flavorText: '"Nekraal\'s bones can\'t pierce this."',
  },
  {
    id: 'armor_guard_knight',
    name: "Knight's Guard",
    sprite: 'armor_guard_knight',
    emoji: '⚔️',
    type: 'armor',
    def: 22,
    hpBonus: 15,
    atkBonus: 0,
    xpMult: 1.0,
    price: 320,
    sell: 160,
    tier: 'uncommon',
    description: 'Full knightly plate. Provides bonus HP alongside excellent defense.',
    flavorText: '"Even Volthorn\'s thunder struggle against this."',
  },
  {
    id: 'armor_mail_rune',
    name: 'Rune Mail',
    sprite: 'armor_mail_rune',
    emoji: '🌀',
    type: 'armor',
    def: 26,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 420,
    sell: 210,
    tier: 'rare',
    description: 'Mail etched with protective runes. Absorbs magical damage effectively.',
    flavorText: '"The runes hum when Cynthara attacks."',
  },
  // ── Heavy ─────────────────────────────────────────────────
  {
    id: 'armor_scale_dragon',
    name: 'Dragon Scale',
    sprite: 'armor_scale_dragon',
    emoji: '🐉',
    type: 'armor',
    def: 30,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 550,
    sell: 275,
    tier: 'rare',
    description: 'Scales shed by an elder dragon. Lighter than it looks, harder than iron.',
    flavorText: '"Drakmoor doesn\'t appreciate you wearing this."',
  },
  {
    id: 'armor_plate_crystal',
    name: 'Crystal Plate',
    sprite: 'armor_plate_crystal',
    emoji: '💎',
    type: 'armor',
    def: 35,
    hpBonus: 20,
    atkBonus: 0,
    xpMult: 1.0,
    price: 700,
    sell: 350,
    tier: 'rare',
    description: 'Armor grown from dungeon crystals. Shimmers in the dark. Hard as diamond.',
    flavorText: '"The light inside it matches your potential."',
  },
  {
    id: 'armor_mantle_shadow',
    name: 'Shadow Mantle',
    sprite: 'armor_mantle_shadow',
    emoji: '🌑',
    type: 'armor',
    def: 38,
    hpBonus: 0,
    atkBonus: 5,
    xpMult: 1.0,
    price: 850,
    sell: 425,
    tier: 'epic',
    description: 'A mantle woven from shadow itself. Hard to hit, and somehow boosts your attacks.',
    flavorText: '"Xaldrath wore this before he fell."',
  },
  {
    id: 'armor_aegis_mystic',
    name: 'Mystic Aegis',
    sprite: 'armor_aegis_mystic',
    emoji: '🔮',
    type: 'armor',
    def: 42,
    hpBonus: 25,
    atkBonus: 0,
    xpMult: 1.0,
    price: 1000,
    sell: 500,
    tier: 'epic',
    description: 'A magical shield-armor hybrid that absorbs both physical and verbal attacks.',
    flavorText: '"Even Malachar\'s misinterpreted texts bounce off."',
  },
  {
    id: 'armor_void_plate',
    name: 'Void Armor',
    sprite: 'armor_void_plate',
    emoji: '🕳️',
    type: 'armor',
    def: 46,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    price: 1200,
    sell: 600,
    tier: 'epic',
    description: 'Forged in the void. Attacks that hit it sometimes disappear entirely.',
    flavorText: '"Krevatar knows its origin. He is afraid."',
  },
  // ── Special ───────────────────────────────────────────────
  {
    id: 'armor_amulet_warding',
    name: 'Amulet of Warding',
    sprite: 'armor_amulet_warding',
    emoji: '📿',
    type: 'armor',
    def: 8,
    hpBonus: 20,
    atkBonus: 0,
    xpMult: 1.0,
    price: 200,
    sell: 100,
    tier: 'uncommon',
    description: 'A warding amulet that boosts HP significantly. Worn over existing armor.',
    flavorText: '"Quilbane\'s thorns can\'t pierce the ward."',
  },
  {
    id: 'armor_robe_sage',
    name: "Sage's Robe",
    sprite: 'armor_robe_sage',
    emoji: '🌟',
    type: 'armor',
    def: 12,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.10,
    price: 350,
    sell: 175,
    tier: 'rare',
    description: "A sage's robe that boosts XP earned by 10%. Ideal for grinding.",
    flavorText: '"The faster you learn, the brighter it glows."',
  },
  {
    id: 'armor_plate_berserker',
    name: 'Berserker Plate',
    sprite: 'armor_plate_berserker',
    emoji: '⚡',
    type: 'armor',
    def: 20,
    hpBonus: 0,
    atkBonus: 10,
    xpMult: 1.0,
    price: 600,
    sell: 300,
    tier: 'rare',
    description: 'Heavy armor that channels damage into attack power. Aggressive protection.',
    flavorText: '"Brundak wore something similar. Now he doesn\'t."',
  },
  {
    id: 'armor_guard_phoenix',
    name: 'Phoenix Guard',
    sprite: 'armor_guard_phoenix',
    emoji: '🦅',
    type: 'armor',
    def: 35,
    hpBonus: 0,
    atkBonus: 0,
    xpMult: 1.0,
    specialEffect: 'resurrect',  // revive once with 30 HP when HP reaches 0
    price: 900,
    sell: 450,
    tier: 'epic',
    description: 'If you fall in battle while wearing this, it revives you once with 30 HP.',
    flavorText: '"The phoenix does not yield. Neither will you."',
  },
  {
    id: 'armor_vestment_eternal',
    name: 'Eternal Vestment',
    sprite: 'armor_vestment_eternal',
    emoji: '👑',
    type: 'armor',
    def: 55,
    hpBonus: 50,
    atkBonus: 15,
    xpMult: 1.15,
    price: 1500,
    sell: 750,
    tier: 'legendary',
    description: "The Scholar-King's legendary vestment. Boosts everything. Required for the final boss.",
    flavorText: '"Only those who have mastered all four skills may wear this without burning."',
  },
];

// ── POTIONS ───────────────────────────────────────────────────

export const POTIONS = [
  {
    id: 'potion_small',
    name: 'Small Vial',
    sprite: 'potion_small',
    emoji: '🧪',
    type: 'potion',
    healAmount: 20,
    healPercent: 0,     // 0 = flat heal; >0 = % of max HP
    price: 8,
    sell: 4,
    tier: 'common',
    description: 'A tiny vial of healing liquid. Restores a small amount of HP.',
    flavorText: '"Tastes like determination."',
    stackLimit: 10,
  },
  {
    id: 'potion_standard',
    name: 'Potion',
    sprite: 'potion_standard',
    emoji: '⚗️',
    type: 'potion',
    healAmount: 50,
    healPercent: 0,
    price: 20,
    sell: 10,
    tier: 'common',
    description: 'A standard healing potion. The go-to supply for mid-dungeon exploration.',
    flavorText: '"The dungeon shopkeeper brews these herself."',
    stackLimit: 10,
  },
  {
    id: 'potion_hi',
    name: 'Hi-Potion',
    sprite: 'potion_hi',
    emoji: '💊',
    type: 'potion',
    healAmount: 100,
    healPercent: 0,
    price: 45,
    sell: 22,
    tier: 'uncommon',
    description: 'A concentrated healing potion. Restores a significant chunk of HP.',
    flavorText: '"For those who stayed on B4 one encounter too long."',
    stackLimit: 10,
  },
  {
    id: 'potion_elixir',
    name: 'Elixir',
    sprite: 'potion_elixir',
    emoji: '✨',
    type: 'potion',
    healAmount: 0,
    healPercent: 100,   // 100% = full HP restore
    price: 100,
    sell: 50,
    tier: 'rare',
    description: 'A legendary elixir that fully restores HP. Only use when desperate.',
    flavorText: '"Said to be distilled from the tears of a mastered vocabulary list."',
    stackLimit: 5,
  },
];

// ── Lookup helpers ─────────────────────────────────────────────

export const WEAPONS_MAP = Object.fromEntries(WEAPONS.map(w => [w.id, w]));
export const ARMOR_MAP   = Object.fromEntries(ARMOR.map(a => [a.id, a]));
export const POTIONS_MAP = Object.fromEntries(POTIONS.map(p => [p.id, p]));

export const ALL_ITEMS = [...WEAPONS, ...ARMOR, ...POTIONS];
export const ALL_ITEMS_MAP = Object.fromEntries(ALL_ITEMS.map(i => [i.id, i]));

export const STARTER_WEAPON = WEAPONS.find(w => w.price === 0);
export const STARTER_ARMOR  = ARMOR.find(a => a.price === 0);

/** Compute sell price (50% rounded down, min 1) */
export function getSellPrice(item) {
  return Math.max(1, Math.floor(item.price * 0.5));
}

/** Apply a potion to current HP, return new HP */
export function applyPotion(potion, currentHp, maxHp) {
  if (potion.healPercent > 0) {
    return Math.min(maxHp, Math.round(maxHp * (potion.healPercent / 100)));
  }
  return Math.min(maxHp, currentHp + potion.healAmount);
}

/** Compute player total attack with weapon equipped */
export function getTotalAttack(baseAttack, weaponId) {
  const weapon = WEAPONS_MAP[weaponId];
  return baseAttack + (weapon?.atk ?? 0);
}

/** Compute player total defense with armor equipped */
export function getTotalDefense(baseDefense, armorId) {
  const armor = ARMOR_MAP[armorId];
  return baseDefense + (armor?.def ?? 0);
}

/** Compute XP multiplier from equipped armor */
export function getXPMultFromArmor(armorId) {
  const armor = ARMOR_MAP[armorId];
  return armor?.xpMult ?? 1.0;
}

/** Compute HP bonus from equipped armor */
export function getHPBonusFromArmor(armorId) {
  const armor = ARMOR_MAP[armorId];
  return armor?.hpBonus ?? 0;
}

/** Compute attack bonus from equipped armor */
export function getAttackBonusFromArmor(armorId) {
  const armor = ARMOR_MAP[armorId];
  return armor?.atkBonus ?? 0;
}

/** Check if armor has special effect */
export function hasSpecialEffect(armorId, effect) {
  const armor = ARMOR_MAP[armorId];
  return armor?.specialEffect === effect;
}

/** Shop stock: what's available at each floor's shop */
export function getShopStock(floor) {
  const maxPrice = floor <= 1 ? 60
                 : floor <= 2 ? 130
                 : floor <= 3 ? 280
                 : floor <= 4 ? 550
                 : floor <= 5 ? 1000
                 : 9999;

  return {
    weapons: WEAPONS.filter(w => w.price > 0 && w.price <= maxPrice),
    armor:   ARMOR.filter(a => a.price > 0 && a.price <= maxPrice),
    potions: POTIONS,   // potions always available
  };
}
