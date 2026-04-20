import { useState } from 'react';
import { WEAPONS, ARMOR, POTIONS, WEAPONS_MAP, ARMOR_MAP, POTIONS_MAP, ALL_ITEMS_MAP, getSellPrice } from '../data/rpg/items';
import { ItemSprite } from './EnemySprite';

const TIER_COLORS = {
  starter:   'border-gray-600 text-gray-400',
  common:    'border-green-700 text-green-400',
  uncommon:  'border-blue-700 text-blue-400',
  rare:      'border-purple-700 text-purple-400',
  epic:      'border-orange-700 text-orange-400',
  legendary: 'border-yellow-500 text-yellow-400',
};

function StatBadge({ label, value, color = 'text-white' }) {
  return (
    <div className="text-center">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ItemCard({ item, isEquipped, onEquip, onSell, compact = false }) {
  const tierStyle = TIER_COLORS[item.tier] || TIER_COLORS.common;
  const sellPrice = getSellPrice(item);

  return (
    <div className={`bg-gray-800/60 border rounded-xl p-3 ${isEquipped ? 'border-amber-500/60' : 'border-gray-700/60'} transition-all`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <ItemSprite item={item} size={40} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white truncate">{item.name}</span>
            {isEquipped && (
              <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-700/50 px-1.5 py-0.5 rounded-full">
                ✓ Equipped
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${tierStyle}`}>
              {item.tier}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-1">
            {item.type === 'weapon' && (
              <span className="text-xs text-red-400">⚔️ ATK +{item.atk}</span>
            )}
            {item.type === 'armor' && (
              <>
                <span className="text-xs text-blue-400">🛡️ DEF +{item.def}</span>
                {item.hpBonus  > 0 && <span className="text-xs text-green-400">❤️ HP +{item.hpBonus}</span>}
                {item.atkBonus > 0 && <span className="text-xs text-red-400">⚔️ ATK +{item.atkBonus}</span>}
                {item.xpMult   > 1 && <span className="text-xs text-amber-400">✨ XP ×{item.xpMult.toFixed(2)}</span>}
                {item.specialEffect === 'resurrect' && (
                  <span className="text-xs text-pink-400">🦅 Revive ×1</span>
                )}
              </>
            )}
            {item.type === 'potion' && (
              <span className="text-xs text-green-400">
                {item.healPercent > 0 ? `❤️ Full HP` : `❤️ +${item.healAmount} HP`}
              </span>
            )}
          </div>

          {!compact && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {onEquip && !isEquipped && (
          <button
            onClick={() => onEquip(item.id)}
            className="flex-1 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold transition-all btn-press"
          >
            Equip
          </button>
        )}
        {onEquip && isEquipped && (
          <div className="flex-1 py-1.5 rounded-lg bg-amber-900/30 text-amber-400 text-xs font-semibold text-center border border-amber-700/40">
            Equipped ✓
          </div>
        )}
        {onSell && item.price > 0 && (
          <button
            onClick={() => onSell(item.id)}
            className="py-1.5 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold transition-all btn-press"
          >
            Sell 💎{sellPrice}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Inventory({ state, equipWeapon, equipArmor, usePotion, sellItem, equippedWeaponId, equippedArmorId, rpgStats }) {
  const [tab, setTab] = useState('equipment'); // 'equipment' | 'bag' | 'potions'
  const inventory = state.inventory || {};
  const potions   = inventory.potions || {};
  const bag       = inventory.bag     || [];

  // Build lists
  const ownedWeapons = bag.filter(b => WEAPONS_MAP[b.itemId]).map(b => ({ ...WEAPONS_MAP[b.itemId], qty: b.quantity }));
  const ownedArmor   = bag.filter(b => ARMOR_MAP[b.itemId]).map(b => ({ ...ARMOR_MAP[b.itemId], qty: b.quantity }));
  const ownedPotions = Object.entries(potions)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...POTIONS_MAP[id], qty }));

  const equippedWeapon = WEAPONS_MAP[equippedWeaponId];
  const equippedArmor  = ARMOR_MAP[equippedArmorId];

  const tabs = [
    { id: 'equipment', label: '⚔️ Equipment' },
    { id: 'bag',       label: `🎒 Bag (${bag.length})` },
    { id: 'potions',   label: `⚗️ Potions (${ownedPotions.length})` },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-700 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
          🎒
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Inventory</h1>
          <div className="text-sm text-gray-400">Manage equipment and items</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-lg font-bold text-cyan-400">💎 {state.player.gems}</div>
          <div className="text-xs text-gray-500">gems</div>
        </div>
      </div>

      {/* Combat stats bar */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-5">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Combat Stats</div>
        <div className="grid grid-cols-4 gap-2">
          <StatBadge label="HP" value={`${rpgStats.hp}/${rpgStats.maxHp}`} color="text-green-400" />
          <StatBadge label="Attack" value={rpgStats.totalAttack} color="text-red-400" />
          <StatBadge label="Defense" value={rpgStats.totalDefense} color="text-blue-400" />
          <StatBadge label="Floor" value={`B${rpgStats.currentFloor}`} color="text-amber-400" />
        </div>
        {/* HP bar */}
        <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, (rpgStats.hp / rpgStats.maxHp) * 100)}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all btn-press ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Equipment tab */}
      {tab === 'equipment' && (
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">⚔️ Weapon</div>
            {equippedWeapon ? (
              <ItemCard item={equippedWeapon} isEquipped={true} onEquip={null} onSell={sellItem} />
            ) : (
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center text-gray-500 text-sm">
                No weapon equipped — using {state.rpg?.baseAttack ?? 5} base attack
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🛡️ Armor</div>
            {equippedArmor ? (
              <ItemCard item={equippedArmor} isEquipped={true} onEquip={null} onSell={sellItem} />
            ) : (
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-center text-gray-500 text-sm">
                No armor equipped — using {state.rpg?.baseDefense ?? 2} base defense
              </div>
            )}
          </div>
          <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <div>⚔️ Total damage on correct answer: <span className="text-red-400 font-bold">{rpgStats.totalAttack}</span></div>
            <div>🛡️ Damage absorbed per wrong answer: <span className="text-blue-400 font-bold">{rpgStats.totalDefense}</span></div>
            {equippedArmor?.specialEffect === 'resurrect' && !rpgStats.phoenixUsed && (
              <div>🦅 Phoenix Guard: <span className="text-pink-400 font-bold">Ready</span></div>
            )}
          </div>
        </div>
      )}

      {/* Bag tab */}
      {tab === 'bag' && (
        <div className="space-y-3">
          {ownedWeapons.length === 0 && ownedArmor.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🎒</div>
              <div className="text-sm">Your bag is empty</div>
              <div className="text-xs mt-1">Visit the Shop to buy weapons and armor</div>
            </div>
          ) : (
            <>
              {ownedWeapons.length > 0 && (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weapons</div>
                  {ownedWeapons.map(w => (
                    <ItemCard
                      key={w.id}
                      item={w}
                      isEquipped={w.id === equippedWeaponId}
                      onEquip={equipWeapon}
                      onSell={sellItem}
                    />
                  ))}
                </>
              )}
              {ownedArmor.length > 0 && (
                <>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Armor</div>
                  {ownedArmor.map(a => (
                    <ItemCard
                      key={a.id}
                      item={a}
                      isEquipped={a.id === equippedArmorId}
                      onEquip={equipArmor}
                      onSell={sellItem}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Potions tab */}
      {tab === 'potions' && (
        <div className="space-y-3">
          {ownedPotions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">⚗️</div>
              <div className="text-sm">No potions in bag</div>
              <div className="text-xs mt-1">Buy potions from the Shop to survive tough battles</div>
            </div>
          ) : (
            ownedPotions.map(p => (
              <div key={p.id} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 flex items-center gap-3">
                <ItemSprite item={p} size={40} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{p.name}</span>
                    <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">×{p.qty}</span>
                  </div>
                  <div className="text-xs text-green-400">
                    {p.healPercent > 0 ? '❤️ Restores full HP' : `❤️ +${p.healAmount} HP`}
                  </div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => usePotion(p.id)}
                    disabled={rpgStats.hp >= rpgStats.maxHp}
                    className="py-1.5 px-3 rounded-lg bg-green-800 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all btn-press"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => sellItem(p.id)}
                    className="py-1.5 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold transition-all btn-press"
                  >
                    💎{getSellPrice(p)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tip */}
      <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">💡 Tip</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          You can use potions <span className="text-white">during battle</span> when your HP is low.
          Wrong answers deal damage equal to the enemy's attack minus your defense.
          Equip better armor before entering deeper floors.
        </div>
      </div>
    </div>
  );
}
