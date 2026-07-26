import React, { useState, useEffect } from 'react';
import { TAVERNS, EXCLUSIVE_STOCK, TRAINING_EXPERTS } from '../data/downtimeMerchants';
import { ADVENTURE_ECONOMY_METADATA } from '../data/adventureEconomy';
import { GENERIC_ITEM_VALUES, GENERIC_ITEM_VALUE_BY_NAME, coinValue } from '../data/economy';
import { ADVENTURES_LIST } from '../data/adventures';
import { SKILLS_LIST } from '../data/gms';

export default function DowntimeMarketModal({
  character,
  isOpen,
  onClose,
  buyItemFromMerchant,
  sellItemToMerchant,
  adjustMerchantRelationship,
  buyTavernService,
  triggerPriceRecovery,
  initializeMerchantStock,
  trainSkillWithMerchant,
  strongholdChest = [],
  onUpdateStrongholdChest,
  onUpdateCharacterStats
}) {
  const [selectedHubId, setSelectedHubId] = useState(null);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'sell' | 'tavern' | 'interact' | 'stash' | 'train'
  const [interactMessage, setInteractMessage] = useState('');
  const [giftItemName, setGiftItemName] = useState('');

  const relationships = character.localEconomy?.relationships || {};
  const currentRelation = selectedMerchant ? (relationships[selectedMerchant.name] || 0) : 0;

  // Trigger price recovery on modal load
  useEffect(() => {
    if (isOpen) {
      triggerPriceRecovery();
    }
  }, [isOpen]);

  // Lazy-initialize merchant stock when selected merchant changes
  useEffect(() => {
    if (isOpen && selectedMerchant && !selectedMerchant.isTavern) {
      initializeMerchantStock(selectedMerchant.name, currentRelation);
    }
  }, [isOpen, selectedMerchant]);

  const handleStashDeposit = (itemName) => {
    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => {
        const idx = prev.inventory.indexOf(itemName);
        if (idx === -1) return prev;
        const nextInv = [...prev.inventory];
        nextInv.splice(idx, 1);
        return { ...prev, inventory: nextInv };
      });
    }
    if (onUpdateStrongholdChest) {
      onUpdateStrongholdChest([...strongholdChest, itemName]);
    }
    setInteractMessage(`Stashed 📦 ${itemName} into Stronghold chest.`);
  };

  const handleStashWithdraw = (chestIdx) => {
    const itemName = strongholdChest[chestIdx];
    if (!itemName) return;
    if (character.inventory.length >= 20) {
      setInteractMessage("Your backpack is full! Free some slots first.");
      return;
    }
    if (onUpdateCharacterStats) {
      onUpdateCharacterStats(prev => ({
        ...prev,
        inventory: [...prev.inventory, itemName]
      }));
    }
    if (onUpdateStrongholdChest) {
      const nextChest = [...strongholdChest];
      nextChest.splice(chestIdx, 1);
      onUpdateStrongholdChest(nextChest);
    }
    setInteractMessage(`Withdrew 🎒 ${itemName} into active inventory.`);
  };

  if (!isOpen) return null;

  const completedAdventures = character.completed_adventures || [];
  
  // Find completed adventures that have merchant metadata or a tavern definition
  const unlockedHubs = ADVENTURES_LIST.filter(adv => {
    const isCompleted = completedAdventures.includes(adv.id);
    const hasEconomy = ADVENTURE_ECONOMY_METADATA[adv.id]?.merchants?.length > 0;
    const hasTavern = !!TAVERNS[adv.id];
    return isCompleted && (hasEconomy || hasTavern);
  });

  // Default to first unlocked hub if none selected
  if (unlockedHubs.length > 0 && !selectedHubId) {
    setSelectedHubId(unlockedHubs[0].id);
  }

  const activeHub = unlockedHubs.find(hub => hub.id === selectedHubId);

  // Get merchants for active hub
  const hubEconomy = activeHub ? ADVENTURE_ECONOMY_METADATA[activeHub.id] : null;
  let merchantsList = [];
  if (hubEconomy && hubEconomy.merchants) {
    merchantsList = [...hubEconomy.merchants];
  }

  // Inject tavern keeper as a merchant if defined
  const tavernDef = activeHub ? TAVERNS[activeHub.id] : null;
  if (tavernDef) {
    merchantsList.push({
      name: tavernDef.keeper,
      role: 'Tavern Keeper',
      location: tavernDef.location,
      isTavern: true,
      notes: `Proprietor of ${tavernDef.name}.`
    });
  }

  // Set default merchant if none selected
  if (merchantsList.length > 0 && (!selectedMerchant || !merchantsList.find(m => m.name === selectedMerchant.name))) {
    setSelectedMerchant(merchantsList[0]);
  }

  const isBanned = currentRelation <= -30;

  // Determine relationship rank label
  let relationRank = 'Neutral';
  let rankColor = 'text-slate-400';
  if (currentRelation <= -30) {
    relationRank = 'Banned 🔒';
    rankColor = 'text-red-500 font-extrabold';
  } else if (currentRelation <= -11) {
    relationRank = 'Hostile';
    rankColor = 'text-red-400';
  } else if (currentRelation >= 80) {
    relationRank = 'Allied';
    rankColor = 'text-emerald-400 font-extrabold';
  } else if (currentRelation >= 50) {
    relationRank = 'Respected';
    rankColor = 'text-amber-400';
  } else if (currentRelation >= 11) {
    relationRank = 'Friendly';
    rankColor = 'text-emerald-500';
  }

  // Dynamic calculations
  const calculateBuyPrice = (itemName, baseCp) => {
    // Buy price modifier is -0.2% per relationship point
    const discountFactor = 1 - (currentRelation * 0.002);
    let finalPrice = Math.max(1, Math.round(baseCp * discountFactor));
    
    // Clamp to ensure it doesn't fall below sell price
    const sellPrice = calculateSellPrice(itemName, baseCp);
    if (finalPrice < sellPrice) {
      finalPrice = sellPrice;
    }
    return finalPrice;
  };

  const calculateSellPrice = (itemName, baseCp) => {
    // Base sell rate is 50%
    // Relation modifier is +0.25% per relationship point
    const relationFactor = 0.50 + (currentRelation * 0.0025);
    
    // Decay factors
    const mercDecayMap = character.localEconomy?.decay?.[selectedMerchant?.name] || {};
    const itemDecayCount = mercDecayMap[itemName] || 0;
    
    const regDecayMap = character.localEconomy?.regionDecay?.[selectedHubId] || {};
    const itemRegionDecayCount = regDecayMap[itemName] || 0;

    const decayFactor = Math.pow(0.95, itemDecayCount) * Math.pow(0.97, itemRegionDecayCount);

    // Apply modifiers
    let finalSellRate = relationFactor * decayFactor;
    // Cap minimum sell rate at 20%
    if (finalSellRate < 0.20) finalSellRate = 0.20;

    let finalPrice = Math.max(1, Math.round(baseCp * finalSellRate));
    
    // Clamp so sell price doesn't exceed base buy price
    if (finalPrice > baseCp) {
      finalPrice = baseCp;
    }
    return finalPrice;
  };

  // Helper to format copper value into gold/silver/copper string
  const formatCoins = (cp) => {
    const val = coinValue(cp);
    const parts = [];
    if (val.gp > 0) parts.push(`${val.gp} gp`);
    if (val.sp > 0) parts.push(`${val.sp} sp`);
    if (val.cp > 0 || parts.length === 0) parts.push(`${val.cp} cp`);
    return parts.join(', ');
  };

  // Get stock for sale
  let merchantStock = [];
  if (selectedMerchant) {
    if (selectedMerchant.isTavern) {
      merchantStock = [
        { name: "Ration", valueCp: 5 },
        { name: "Rations (5)", valueCp: 25 }
      ];
    } else {
      // 1. Get generated pool stock from character state
      const poolStock = character.localEconomy?.merchantStock?.[selectedMerchant.name] || [];
      merchantStock = poolStock.filter(s => s.stock > 0).map(s => ({
        name: s.item,
        valueCp: s.priceCp,
        stock: s.stock
      }));

      // 2. Add fixed items from selectedMerchant's sells list (filtered to prevent duplicates)
      const standardSells = selectedMerchant.sells || [];
      standardSells.forEach(s => {
        if (!merchantStock.find(mItem => mItem.name === s.item)) {
          const itemInfo = GENERIC_ITEM_VALUE_BY_NAME[s.item] || { valueCp: s.priceCp || 100 };
          merchantStock.push({
            name: s.item,
            valueCp: itemInfo.valueCp,
            stock: s.stock
          });
        }
      });

      // 3. Add rare exclusive items based on relationship
      const rareItems = EXCLUSIVE_STOCK[selectedMerchant.name] || [];
      rareItems.forEach(rare => {
        if (currentRelation >= rare.reqRelationship) {
          if (!merchantStock.find(mItem => mItem.name === rare.item)) {
            merchantStock.push({
              name: rare.item,
              valueCp: rare.priceCp,
              stock: rare.stock,
              isRare: true
            });
          }
        }
      });
    }
  }

  // Handle interaction actions
  const handleChat = () => {
    if (isBanned) return;
    
    const roll = Math.floor(Math.random() * 20) + 1;
    const charisma = character.attributes?.charisma || 1;
    const totalRoll = roll + charisma;
    
    if (totalRoll >= 12) {
      adjustMerchantRelationship(selectedMerchant.name, 2);
      setInteractMessage(`Success! You engage in pleasant conversation and compliment their wares. (Roll: ${totalRoll} vs 12). Relationship +2.`);
    } else {
      adjustMerchantRelationship(selectedMerchant.name, -1);
      setInteractMessage(`Oops! You accidentally say something awkward and annoy them. (Roll: ${totalRoll} vs 12). Relationship -1.`);
    }
  };

  const handleGiveGift = () => {
    if (isBanned) return;
    if (!giftItemName) return;

    const itemIdx = character.inventory.indexOf(giftItemName);
    if (itemIdx === -1) return;

    const itemInfo = GENERIC_ITEM_VALUE_BY_NAME[giftItemName] || { valueCp: 100 };
    const giftValue = itemInfo.valueCp;

    // Gift relation points: 1 point per 50 cp value (min 2, max 10)
    const points = Math.max(2, Math.min(10, Math.floor(giftValue / 50)));

    // Consume the item
    character.inventory.splice(itemIdx, 1);
    adjustMerchantRelationship(selectedMerchant.name, points);

    setInteractMessage(`You gift a ${giftItemName} to ${selectedMerchant.name}. They accept it warmly! Relationship +${points}.`);
    setGiftItemName('');
  };

  const handleSteal = () => {
    if (isBanned) return;

    const roll = Math.floor(Math.random() * 20) + 1;
    const attunement = character.attributes?.attunement || 1; // Sleight of Hand / Agility simulation
    const totalRoll = roll + attunement;

    if (totalRoll >= 15) {
      // Steal a random item from standard stock
      if (merchantStock.length === 0) {
        setInteractMessage("There is nothing to steal!");
        return;
      }
      const randomItem = merchantStock[Math.floor(Math.random() * merchantStock.length)];
      
      // Add to inventory
      character.inventory.push(randomItem.name);
      setInteractMessage(`Success! You slide a ${randomItem.name} into your pack without anyone noticing. (Roll: ${totalRoll} vs 15).`);
    } else {
      // Busted! Huge relationship penalty
      adjustMerchantRelationship(selectedMerchant.name, -40);
      setInteractMessage(`Caught! The merchant calls you a thief and kicks you out! (Roll: ${totalRoll} vs 15). Relationship -40.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full h-[620px] shadow-2xl flex flex-col overflow-hidden relative font-sans text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <h2 className="text-lg font-bold text-amber-400 font-serif">Downtime Marketplace</h2>
              <p className="text-5xs text-slate-400 uppercase tracking-widest">Trade, rest, and build relationships in completed towns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 font-bold text-lg p-1.5 hover:bg-slate-900 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Outer Layout Grid */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar - Trade Hubs & Merchant List */}
          <div className="w-60 bg-slate-950/65 border-r border-slate-850 p-4 flex flex-col gap-4 overflow-y-auto">
            
            {/* Hubs Selector */}
            <div>
              <label className="text-6xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Select Trade Hub</label>
              {unlockedHubs.length === 0 ? (
                <div className="text-4xs text-slate-500 italic p-2 border border-dashed border-slate-800 rounded">
                  No trade hubs unlocked yet. Complete adventures to unlock towns!
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {unlockedHubs.map(hub => (
                    <button
                      key={hub.id}
                      onClick={() => {
                        setSelectedHubId(hub.id);
                        setInteractMessage('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-3xs font-serif font-bold transition-all border cursor-pointer ${
                        selectedHubId === hub.id
                          ? 'bg-amber-950/30 border-amber-600/50 text-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.15)]'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200'
                      }`}
                    >
                      🏰 {hub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Merchants in Selected Hub */}
            {activeHub && (
              <div>
                <label className="text-6xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Local Merchants</label>
                <div className="flex flex-col gap-1">
                  {merchantsList.map(m => (
                    <button
                      key={m.name}
                      onClick={() => {
                        setSelectedMerchant(m);
                        setInteractMessage('');
                        if (m.isTavern) {
                          setActiveTab('tavern');
                        } else {
                          setActiveTab('buy');
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-3xs transition-all border cursor-pointer ${
                        selectedMerchant?.name === m.name
                          ? 'bg-slate-800 border-amber-500/40 text-amber-305'
                          : 'bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>👤 {m.name}</span>
                        {relationships[m.name] <= -30 && <span className="text-red-400">🔒</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">{m.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stronghold Wallet */}
            <div className="mt-auto pt-4 border-t border-slate-850 bg-slate-950/80 p-3 rounded-lg border border-slate-900">
              <span className="text-6xs text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Stronghold Purse</span>
              <div className="text-xs font-serif font-black text-amber-400 flex items-center justify-between">
                <span>💰 Total Balance</span>
              </div>
              <div className="text-3xs text-slate-300 mt-1 font-mono">
                {formatCoins(character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp)}
              </div>
            </div>

          </div>

          {/* Main Panel */}
          <div className="flex-1 flex flex-col bg-slate-900/40 overflow-hidden">
            
            {selectedMerchant ? (
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                
                {/* Merchant Bio & Relation Banner */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 mb-4 flex justify-between items-center relative">
                  <div>
                    <h3 className="text-base font-extrabold text-amber-300 font-serif flex items-center gap-1.5">
                      {selectedMerchant.name}
                      <span className="text-4xs font-sans px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 italic">
                        {selectedMerchant.role}
                      </span>
                    </h3>
                    <p className="text-3xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                      {selectedMerchant.notes || "Ready to trade and supply you for your journeys."}
                    </p>
                  </div>
                  
                  {/* Reputation Badge */}
                  <div className="text-right border-l border-slate-850 pl-6">
                    <span className="text-6xs text-slate-500 font-bold uppercase tracking-wider block">Relationship</span>
                    <span className={`text-sm font-black font-serif block mt-0.5 ${rankColor}`}>
                      {relationRank}
                    </span>
                    <span className="text-4xs text-slate-400 font-mono mt-0.5 block">
                      {currentRelation > 0 ? `+${currentRelation}` : currentRelation} / 100
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 mb-4 gap-1">
                  {!selectedMerchant.isTavern && (
                    <>
                      <button
                        onClick={() => setActiveTab('buy')}
                        className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                          activeTab === 'buy' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Buy Stock
                      </button>
                      <button
                        onClick={() => setActiveTab('sell')}
                        className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                          activeTab === 'sell' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Sell Items
                      </button>
                    </>
                  )}
                  {selectedMerchant.isTavern && (
                    <button
                      onClick={() => setActiveTab('tavern')}
                      className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                        activeTab === 'tavern' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tavern Services
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('interact')}
                    className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                      activeTab === 'interact' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Interact & Influence
                  </button>

                  <button
                    onClick={() => setActiveTab('stash')}
                    className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                      activeTab === 'stash' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📦 Stronghold Stash
                  </button>

                  {TRAINING_EXPERTS[selectedMerchant.name] && (
                    <button
                      onClick={() => setActiveTab('train')}
                      className={`px-4 py-2 border-b-2 text-3xs font-bold transition-all cursor-pointer ${
                        activeTab === 'train' ? 'border-amber-500 text-amber-305' : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🎓 Skill Training
                    </button>
                  )}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  
                  {isBanned ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-red-955/20 border border-red-500/20 rounded-xl">
                      <span className="text-4xl mb-3">🔒</span>
                      <h4 className="text-red-400 font-serif font-black text-sm">Access Denied</h4>
                      <p className="text-3xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                        Your reputation with {selectedMerchant.name} is too low ({currentRelation}). They have banned you from their shop, refuse to speak with you, and will refuse any gifts.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* BUY TAB */}
                      {activeTab === 'buy' && (
                        <div className="flex flex-col gap-2">
                          {merchantStock.length === 0 ? (
                            <p className="text-3xs text-slate-500 italic">No wares available.</p>
                          ) : (
                            merchantStock.map((stockItem, idx) => {
                              const baseCost = stockItem.valueCp;
                              const cost = calculateBuyPrice(stockItem.name, baseCost);
                              const walletCp = character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp;
                              const canAfford = walletCp >= cost;

                              return (
                                <div
                                  key={idx}
                                  className={`flex justify-between items-center p-3 rounded-lg border bg-slate-950/30 transition-all ${
                                    stockItem.isRare ? 'border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]' : 'border-slate-850'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-3xs font-bold text-slate-200">{stockItem.name}</span>
                                      {stockItem.isRare && (
                                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.5 rounded font-black uppercase tracking-wider">
                                          Rare Exclusive
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
                                      <div>Listed: {formatCoins(baseCost)}</div>
                                      <div className="flex gap-2 text-[9px] text-slate-500 font-mono">
                                        <span>Standing: {currentRelation > 0 ? '-' : currentRelation < 0 ? '+' : ''}{Math.round(Math.abs(currentRelation) * 0.2)}%</span>
                                        {cost > baseCost && <span className="text-red-400/80">Penalty: +{Math.round(((cost / baseCost) - 1) * 100)}%</span>}
                                        {cost < baseCost && <span className="text-emerald-400/80">Discount: -{Math.round((1 - (cost / baseCost)) * 100)}%</span>}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-bold text-amber-305">
                                      {formatCoins(cost)}
                                    </span>
                                    <button
                                      onClick={() => buyItemFromMerchant(selectedMerchant.name, stockItem.name, cost, 1)}
                                      disabled={!canAfford}
                                      className={`px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                        canAfford
                                          ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                                      }`}
                                    >
                                      Buy Item
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* SELL TAB */}
                      {activeTab === 'sell' && (
                        <div className="flex flex-col gap-2">
                          {character.inventory.length === 0 ? (
                            <p className="text-3xs text-slate-500 italic">Your inventory is empty.</p>
                          ) : (
                            character.inventory.map((invItem, idx) => {
                              const itemVal = GENERIC_ITEM_VALUE_BY_NAME[invItem] || { valueCp: 100 };
                              const baseCost = itemVal.valueCp;
                              const sellVal = calculateSellPrice(invItem, baseCost);

                              return (
                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-850 bg-slate-950/30">
                                  <div>
                                    <span className="text-3xs font-bold text-slate-200">{invItem}</span>
                                    <div className="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
                                      <div>Listed Value: {formatCoins(baseCost)}</div>
                                      {(() => {
                                        const relationFactor = 0.50 + (currentRelation * 0.0025);
                                        const mercDecayMap = character.localEconomy?.decay?.[selectedMerchant?.name] || {};
                                        const itemDecayCount = mercDecayMap[invItem] || 0;
                                        const regDecayMap = character.localEconomy?.regionDecay?.[selectedHubId] || {};
                                        const itemRegionDecayCount = regDecayMap[invItem] || 0;
                                        const decayFactor = Math.pow(0.95, itemDecayCount) * Math.pow(0.97, itemRegionDecayCount);
                                        const finalSellRate = Math.max(0.20, relationFactor * decayFactor);

                                        return (
                                          <div className="flex flex-wrap gap-x-2 text-[9px] text-slate-500 font-mono">
                                            <span>Base: 50%</span>
                                            {currentRelation !== 0 && (
                                              <span className={currentRelation > 0 ? "text-emerald-500/80" : "text-red-500/80"}>
                                                Rep: {currentRelation > 0 ? '+' : ''}{Math.round(currentRelation * 0.25)}%
                                              </span>
                                            )}
                                            {(itemDecayCount > 0 || itemRegionDecayCount > 0) && (
                                              <span className="text-amber-500/80">
                                                Decay: -{Math.round((1 - decayFactor) * 100)}%
                                              </span>
                                            )}
                                            <span className="text-slate-400">Rate: {Math.round(finalSellRate * 100)}%</span>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-bold text-emerald-400">
                                      {formatCoins(sellVal)}
                                    </span>
                                    <button
                                      onClick={() => sellItemToMerchant(selectedMerchant.name, selectedHubId, invItem, sellVal)}
                                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold cursor-pointer transition-colors"
                                    >
                                      Sell Item
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* TAVERN SERVICES TAB */}
                      {activeTab === 'tavern' && tavernDef && (
                        <div className="flex flex-col gap-3">
                          
                          {/* Hearty Meal */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-bold text-amber-205">🥣 {tavernDef.mealName}</h4>
                              <p className="text-[10px] text-slate-450 mt-1">Consuming this hearty meal restores 2 points of physical fatigue (0 HP).</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-xs font-bold text-amber-400">{formatCoins(10)}</span>
                              <button
                                onClick={() => {
                                  buyTavernService(selectedMerchant.name, 'meal', 10, 0, 2);
                                  setInteractMessage(`You eat the ${tavernDef.mealName}. Your physical fatigue is partially restored!`);
                                }}
                                disabled={(character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp) < 10}
                                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold cursor-pointer transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                Purchase Meal
                              </button>
                            </div>
                          </div>

                          {/* Inn Lodging Rest */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-bold text-amber-205">🛌 Spend the Night (Inn Lodging)</h4>
                              <p className="text-[10px] text-slate-450 mt-1">Rent a private chamber. Fully restores your health (HP) and physical energy (Fatigue). Advances the game clock by 8 hours without consuming rations.</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-xs font-bold text-amber-400">{formatCoins(30)}</span>
                              <button
                                onClick={() => {
                                  buyTavernService(selectedMerchant.name, 'inn', 30, 0, 0, 8);
                                  setInteractMessage(`You spend the night in a comfortable bed at the inn. Time advances by 8 hours. Health and physical energy are completely restored!`);
                                }}
                                disabled={(character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp) < 30}
                                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold cursor-pointer transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                Stay the Night
                              </button>
                            </div>
                          </div>

                          {/* Rumors */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-bold text-amber-205">📣 Listen for Rumors</h4>
                              <p className="text-[10px] text-slate-450 mt-1">Spend coins to hear local gossip and whispers about the region.</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-xs font-bold text-amber-400">{formatCoins(50)}</span>
                              <button
                                onClick={() => {
                                  const walletCp = character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp;
                                  if (walletCp < 50) return;
                                  buyTavernService(selectedMerchant.name, 'rumor', 50, 0, 0);
                                  
                                  const rumorList = tavernDef.rumors || ["Nothing new in the tavern today."];
                                  const randomRumor = rumorList[Math.floor(Math.random() * rumorList.length)];
                                  setInteractMessage(`You slide some coins to ${selectedMerchant.name} who leans in and whispers: "${randomRumor}"`);
                                }}
                                disabled={(character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp) < 50}
                                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold cursor-pointer transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                Listen & Bribe
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* INTERACT TAB */}
                      {activeTab === 'interact' && (
                        <div className="flex flex-col gap-6">
                          
                          {/* Chat & Compliment */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-bold text-slate-200">💬 Compliment & Socialize</h4>
                              <p className="text-[10px] text-slate-450 mt-1">Chat up the merchant. Rolls Charisma (Difficulty 12). Success adds +2 reputation; fail subtracts -1.</p>
                            </div>
                            <button
                              onClick={handleChat}
                              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-750 hover:border-amber-505 text-[10px] font-bold text-slate-200 hover:text-amber-305 transition-colors cursor-pointer"
                            >
                              Engage Conversation
                            </button>
                          </div>

                          {/* Give Gift */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20">
                            <h4 className="text-3xs font-bold text-slate-200">🎁 Give a Gift</h4>
                            <p className="text-[10px] text-slate-450 mt-1">Offer an item from your pack. Generates relationship points (+2 to +10) based on item value.</p>
                            
                            <div className="flex gap-2 mt-3">
                              <select
                                value={giftItemName}
                                onChange={(e) => setGiftItemName(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-3xs text-slate-200"
                              >
                                <option value="">-- Choose item to gift --</option>
                                {character.inventory.map((inv, idx) => (
                                  <option key={idx} value={inv}>{inv}</option>
                                ))}
                              </select>
                              <button
                                onClick={handleGiveGift}
                                disabled={!giftItemName}
                                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[10px] font-bold cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                              >
                                Send Gift
                              </button>
                            </div>
                          </div>

                          {/* Steal */}
                          <div className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-bold text-red-400">🕵️ Attempt to Steal</h4>
                              <p className="text-[10px] text-slate-450 mt-1">Sleight of Hand roll (Difficulty 15). Success gets a free stock item; fail triggers a **-40 reputation penalty** (instant ban if relationship drops below -30).</p>
                            </div>
                            <button
                              onClick={handleSteal}
                              className="px-4 py-2 rounded bg-red-955/40 hover:bg-red-950 border border-red-500/20 hover:border-red-500/50 text-[10px] font-bold text-red-400 hover:text-red-305 transition-colors cursor-pointer"
                            >
                              Steal Item
                            </button>
                          </div>

                        </div>
                      )}

                      {/* STASH TAB */}
                      {activeTab === 'stash' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Active Pack */}
                          <div className="flex flex-col border border-slate-850 bg-slate-950/20 rounded-lg p-4">
                            <h4 className="text-3xs font-bold text-amber-205 mb-3 pb-1.5 border-b border-slate-800">🎒 Active Backpack ({character.inventory.length}/20)</h4>
                            {character.inventory.length === 0 ? (
                              <div className="text-3xs text-slate-500 italic py-6 text-center">Your pack is empty.</div>
                            ) : (
                              <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                                {character.inventory.map((item, idx) => (
                                  <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-3xs">
                                    <span className="font-semibold text-slate-250 capitalize">{item}</span>
                                    <button
                                      onClick={() => handleStashDeposit(item)}
                                      className="px-2 py-1 rounded bg-amber-955 hover:bg-amber-600/20 text-4xs font-bold cursor-pointer transition-colors"
                                    >
                                      Stash 📥
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Stronghold Stash */}
                          <div className="flex flex-col border border-slate-850 bg-slate-950/20 rounded-lg p-4">
                            <h4 className="text-3xs font-bold text-amber-205 mb-3 pb-1.5 border-b border-slate-800">📦 Stronghold Chest ({strongholdChest.length})</h4>
                            {strongholdChest.length === 0 ? (
                              <div className="text-3xs text-slate-500 italic py-6 text-center">Chest is empty.</div>
                            ) : (
                              <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                                {strongholdChest.map((item, idx) => (
                                  <li key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-850 text-3xs">
                                    <span className="font-semibold text-slate-250 capitalize">{item}</span>
                                    <button
                                      onClick={() => handleStashWithdraw(idx)}
                                      disabled={character.inventory.length >= 20}
                                      className="px-2 py-1 rounded bg-emerald-955 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-600/20 text-4xs font-bold cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Withdraw 📤
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TRAINING TAB */}
                      {activeTab === 'train' && (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 rounded-lg bg-amber-955/10 border border-amber-500/20 flex justify-between items-center">
                            <div>
                              <h4 className="text-3xs font-serif font-black text-amber-300">🎓 Guild Training</h4>
                              <p className="text-[10px] text-slate-400 mt-1">Study specialized skills under {selectedMerchant.name}. Success is guaranteed, costs 100 cp per skill level, and advances time by 24 hours (fully resting HP/Fatigue).</p>
                            </div>
                            <div className="px-3 py-2 bg-amber-950/40 border border-amber-800/40 text-[10px] font-extrabold text-amber-300 rounded shadow-inner">
                              Banked Slots: {character.trainingSlots || 0}
                            </div>
                          </div>

                          {(!TRAINING_EXPERTS[selectedMerchant.name] || TRAINING_EXPERTS[selectedMerchant.name].length === 0) ? (
                            <div className="text-center py-6 text-slate-500 text-3xs italic">This merchant does not offer specialized training.</div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {TRAINING_EXPERTS[selectedMerchant.name].map(skillId => {
                                const skill = SKILLS_LIST.find(s => s.id === skillId) || { name: skillId, desc: "Special training." };
                                const rank = character.skills?.[skillId] || 0;
                                const costCp = (rank + 1) * 100;
                                const walletCp = character.currency?.gp * 100 + character.currency?.sp * 10 + character.currency?.cp;
                                const canAfford = walletCp >= costCp;
                                const hasSlots = (character.trainingSlots || 0) > 0;

                                return (
                                  <div key={skillId} className="p-4 rounded-lg border border-slate-850 bg-slate-950/20 flex justify-between items-center">
                                    <div>
                                      <h5 className="text-2xs font-extrabold text-amber-200 capitalize">{skill.name} <span className="text-[9px] text-slate-500 ml-1.5">(Current Rank: {rank}/5)</span></h5>
                                      <p className="text-[10px] text-slate-450 mt-1 max-w-md">{skill.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {rank >= 5 ? (
                                        <span className="text-4xs font-bold text-emerald-450 uppercase border border-emerald-950 bg-emerald-950/20 px-2 py-1 rounded">Max Rank (5)</span>
                                      ) : (
                                        <>
                                          <span className="font-mono text-3xs font-extrabold text-amber-400">{formatCoins(costCp)}</span>
                                          <button
                                            onClick={() => {
                                              trainSkillWithMerchant(selectedMerchant.name, skillId);
                                              setInteractMessage(`Successfully trained ${skill.name} to Rank ${rank + 1}! It cost ${formatCoins(costCp)} and advanced game time by 24 hours. HP and fatigue fully restored.`);
                                            }}
                                            disabled={!hasSlots || !canAfford}
                                            className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-3xs font-extrabold cursor-pointer transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            title={!hasSlots ? "No training slots left! Complete adventures to earn more." : !canAfford ? "Cannot afford this training cost." : `Train ${skill.name}`}
                                          >
                                            Train Rank {rank + 1}
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interaction Feedback Log */}
                      {interactMessage && (
                        <div className="mt-4 p-3 bg-slate-950/80 border border-amber-600/20 rounded-lg text-3xs text-amber-305 font-mono leading-relaxed">
                          ⚡ {interactMessage}
                        </div>
                      )}
                    </>
                  )}

                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6 text-slate-500 italic">
                Select a Trade Hub and a Merchant from the sidebar to trade.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
