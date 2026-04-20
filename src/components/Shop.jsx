import { useState } from 'react';
import { getShopStock, WEAPONS_MAP, ARMOR_MAP, getSellPrice } from '../data/rpg/items';
import { FLOOR_INFO } from '../data/rpg/enemies';
import { ItemSprite } from './EnemySprite';

const TIER_COLORS = {
  starter:   'border-gray-600/50 bg-gray-800/30',
  common:    'border-green-700/50 bg-green-900/10',
  uncommon:  'border-blue-700/50 bg-blue-900/10',
  rare:      'border-purple-700/50 bg-purple-900/10',
  epic:      'border-orange-700/50 bg-orange-900/10',
  legendary: 'border-yellow-600/60 bg-yellow-900/10',
};

const TIER_BADGE = {
  starter:   'bg-gray-800 text-gray-400 border-gray-600',
  common:    'bg-green-900/40 text-green-400 border-green-700/50',
  uncommon:  'bg-blue-900/40 text-blue-400 border-blue-700/50',
  rare:      'bg-purple-900/40 text-purple-400 border-purple-700/50',
  epic:      'bg-orange-900/40 text-orange-400 border-orange-700/50',
  legendary: 'bg-yellow-900/40 text-yellow-400 border-yellow-600/50',
};

function ShopItem({ item, gems, isOwned, isEquipped, onBuy, canAfford }) {
  const tierStyle  = TIER_COLORS[item.tier]  || TIER_COLORS.common;
  const badgeStyle = TIER_BADGE[item.tier] || TIER_BADGE.common;

  return (
    <div className={`border rounded-xl p-3 transition-all ${tierStyle} ${!canAfford ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <ItemSprite item={item} size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-white">{item.name}</span>
              {isEquipped && (
                <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-700/50 px-1.5 py-0.5 rounded-full">
                  Equipped
                </span>
              )}
              {isOwned && !isEquipped && (
                <span className="text-xs bg-indigo-900/40 text-indigo-400 border border-indigo-700/50 px-1.5 py-0.5 rounded-full">
                  Owned
                </span>
              )}
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${badgeStyle}`}>
              {item.tier}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-0.5 flex-wrap">
            {item.type === 'weapon' && (
              <span className="text-xs text-red-400">⚔️ ATK +{item.atk}</span>
            )}
            {item.type === 'armor' && (
              <>
                <span className="text-xs text-blue-400">🛡️ DEF +{item.def}</span>
                {item.hpBonus  > 0 && <span className="text-xs text-green-400">❤️ +{item.hpBonus} HP</span>}
                {item.atkBonus > 0 && <span className="text-xs text-red-400">⚔️ +{item.atkBonus} ATK</span>}
                {item.xpMult   > 1 && <span className="text-xs text-amber-400">✨ XP ×{item.xpMult.toFixed(2)}</span>}
                {item.specialEffect === 'resurrect' && (
                  <span className="text-xs text-pink-400">🦅 Revive ×1</span>
                )}
              </>
            )}
            {item.type === 'potion' && (
              <span className="text-xs text-green-400">
                {item.healPercent > 0 ? '❤️ Full HP restore' : `❤️ +${item.healAmount} HP`}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</div>

          {/* Price + Buy */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <span className={`text-sm font-bold ${canAfford ? 'text-cyan-400' : 'text-red-400'}`}>
                💎 {item.price}
              </span>
              {item.price > 0 && (
                <span className="text-xs text-gray-500">(sell: {getSellPrice(item)})</span>
              )}
            </div>
            <button
              onClick={() => onBuy(item.id)}
              disabled={!canAfford}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all btn-press ${
                canAfford
                  ? 'bg-gradient-to-r from-cyan-700 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAfford ? 'Buy' : 'Need 💎' + item.price}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop({ state, buyItem, equippedWeaponId, equippedArmorId }) {
  const [tab, setTab] = useState('weapons');
  const floor    = state.rpg?.currentFloor ?? 1;
  const gems     = state.player?.gems ?? 0;
  const floorInfo = FLOOR_INFO[floor] || FLOOR_INFO[1];
  const stock    = getShopStock(floor);
  const inventory = state.inventory || {};
  const bag       = inventory.bag || [];
  const potions   = inventory.potions || {};

  function isItemOwned(itemId) {
    return bag.some(b => b.itemId === itemId && b.quantity > 0);
  }

  function potionCount(potionId) {
    return potions[potionId] ?? 0;
  }

  const tabs = [
    { id: 'weapons', label: '⚔️ Weapons', count: stock.weapons.length },
    { id: 'armor',   label: '🛡️ Armor',   count: stock.armor.length   },
    { id: 'potions', label: '⚗️ Potions',  count: stock.potions.length },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-700 to-amber-600 flex items-center justify-center text-2xl shadow-lg">
          🏪
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dungeon Shop</h1>
          <div className="text-sm" style={{ color: floorInfo.color }}>
            Floor {floor} — {floorInfo.name}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xl font-bold text-cyan-400">💎 {gems}</div>
          <div className="text-xs text-gray-500">your gems</div>
        </div>
      </div>

      {/* Floor notice */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 mb-5 text-xs text-gray-400">
        🏪 Stock expands as you reach deeper floors. Deeper floors unlock better weapons and armor.
        <span className="text-amber-400 ml-1">Sell price is always 50% of buy price.</span>
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
            <span className="ml-1 text-gray-500">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Weapons */}
      {tab === 'weapons' && (
        <div className="space-y-3">
          {stock.weapons.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">⚔️</div>
              <div className="text-sm">No weapons available on this floor</div>
              <div className="text-xs mt-1">Reach deeper floors to unlock better weapons</div>
            </div>
          ) : (
            stock.weapons.map(w => (
              <ShopItem
                key={w.id}
                item={w}
                gems={gems}
                isOwned={isItemOwned(w.id)}
                isEquipped={w.id === equippedWeaponId}
                onBuy={buyItem}
                canAfford={gems >= w.price}
              />
            ))
          )}
        </div>
      )}

      {/* Armor */}
      {tab === 'armor' && (
        <div className="space-y-3">
          {stock.armor.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🛡️</div>
              <div className="text-sm">No armor available on this floor</div>
              <div className="text-xs mt-1">Reach deeper floors to unlock better armor</div>
            </div>
          ) : (
            stock.armor.map(a => (
              <ShopItem
                key={a.id}
                item={a}
                gems={gems}
                isOwned={isItemOwned(a.id)}
                isEquipped={a.id === equippedArmorId}
                onBuy={buyItem}
                canAfford={gems >= a.price}
              />
            ))
          )}
        </div>
      )}

      {/* Potions — always available */}
      {tab === 'potions' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-1">
            Potions can be used mid-battle via the Inventory screen or battle UI.
          </div>
          {stock.potions.map(p => {
            const owned = potionCount(p.id);
            const atLimit = owned >= (p.stackLimit ?? 10);
            return (
              <div
                key={p.id}
                className={`border rounded-xl p-3 transition-all ${TIER_COLORS[p.tier] || TIER_COLORS.common} ${atLimit ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <ItemSprite item={p} size={44} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{p.name}</span>
                      {owned > 0 && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                          ×{owned} owned
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-green-400">
                      {p.healPercent > 0 ? '❤️ Restores full HP' : `❤️ +${p.healAmount} HP`}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.description}</div>
                    <div className="text-xs text-gray-600 mt-0.5 italic">{p.flavorText}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-sm font-bold ${gems >= p.price ? 'text-cyan-400' : 'text-red-400'}`}>
                        💎 {p.price}
                        <span className="text-xs text-gray-500 ml-1">(sell: {getSellPrice(p)})</span>
                      </span>
                      <button
                        onClick={() => buyItem(p.id)}
                        disabled={gems < p.price || atLimit}
                        className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all btn-press ${
                          gems >= p.price && !atLimit
                            ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {atLimit ? 'Bag Full' : gems < p.price ? `Need 💎${p.price}` : 'Buy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tip */}
      <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
        <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">💡 Strategy</div>
        <div className="text-xs text-gray-400 leading-relaxed">
          Enemies on B3+ <span className="text-white">hit significantly harder</span> than early floors.
          Buy at least a <span className="text-blue-300">Chain Shirt</span> before attempting B3,
          and stock up on <span className="text-green-300">Hi-Potions</span> before boss encounters.
          Gems drop from every enemy you defeat.
        </div>
      </div>
    </div>
  );
}
