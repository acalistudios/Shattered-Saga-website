// Structured Game Rules & Help Content for Shattered Saga
// Sourced directly from GAME_RULES.md (v6.1). Can be rendered by in-game help modals.

export const GAME_RULES_SECTIONS = [
  {
    id: 'dice_resolution',
    title: 'Opposed Skill & Attribute Checks',
    icon: '🎲',
    summary: 'The Step-Die rolling formula, attribute dies, skill d2s, and margins.',
    points: [
      'Opposed Check Formula: Player Roll = Primary Attribute Die + Secondary Attribute Die + Skill d2s + Modifiers vs. Resistance Roll.',
      'Primary Attribute Die: Score 1 (1d4), 2 (1d6), 3 (1d8), 4 (1d10), 5 (1d12), 6+ (1d20). Represents raw natural aptitude.',
      'Secondary Attribute Die: Score 1 (1d2), 2 (1d2+1), 3 (1d4), 4 (1d4+1), 5 (1d6), 6+ (1d10). Represents supporting finesse.',
      'Skill Ranks (0-5): Each rank adds 1d2 (coin flip: 1 or 2). Gives reliable, training-based consistency instead of wild variance.',
      'Margin of Success (Player - Resistance): Margin > 0 is Success; Margin 0 is Standoff/Tension; Margin < 0 is Failure with complications.',
      'Combat Margin Bonus: Every full 3 points of margin over the defender adds +1 Raw Weapon Damage (+2 at margin 6, etc.). High-margin edged attacks also trigger Bleeding.'
    ]
  },
  {
    id: 'attributes_and_skills',
    title: 'Attributes & The 36 Skills',
    icon: '⚔️',
    summary: 'The 8 core attributes, starting pools, and 36 canonical skills.',
    points: [
      '8 Attributes: Power, Coordination, Vigor, Willpower, Intellect, Charisma, Attunement, Empathy.',
      'Attribute Pool: Base 1 in all stats + 16 points to allocate freely (Total 24). Normal cap is 5. Attributes are locked by default.',
      'Max Health: 10 + (Vigor * 2). Starting HP ranges from 12 to 20.',
      '36 Skills: Each skill is tied to 1 Primary Attribute (1.0 weight) and 1 Secondary Attribute (0.5 weight).',
      'Canonical Alignment: Skill 24 is Lore (Intellect + Empathy); Skill 27 is Negotiation (Charisma + Empathy).'
    ]
  },
  {
    id: 'virtues_vices_morality',
    title: 'Virtues, Vices & Roleplay Modifiers',
    icon: '⚖️',
    summary: 'Moral anchors, roleplay roll bonuses (+1/-1), and morality combat scaling.',
    points: [
      'Moral Anchors: Virtues (Justice, Mercy, Courage, Integrity, Humility, Wisdom) and Vices (Wrath, Greed, Pride, Deceit, Stubbornness, Cruelty).',
      'Roleplay Roll Modifier: Acting strongly in character awards +1 to the next check ([roleplay_modifier: +1]). Wildly out-of-character actions suffer -1.',
      'Morality Scale (-100 to +100): Heroic choices shift positive (+morality); villainous/selfish choices shift negative.',
      'Heroic Combat Advantage: At +15, +30, +45 morality, gain up to +3 Hit and +3 Damage against demonic, undead, and monstrous foes.',
      'Villainous Combat Advantage: At -15, -30, -45 morality, gain up to +3 Hit and +3 Damage against holy and innocent defenders.'
    ]
  },
  {
    id: 'progression_rewards',
    title: 'Progression, Leveling & Skill Upgrades',
    icon: '⭐',
    summary: 'Engine-authoritative leveling, spendable skill points, and upgrade costs.',
    points: [
      'Level Up: Grants +1 Max HP base. Even levels grant bonus HP if Vigor >= 3.',
      'Skill Points: Awarded on adventure completion (Wave 1-2: 2 pts, Wave 3-4: 3 pts, Wave 5-6: 4 pts).',
      'Skill Upgrade Cost: Cost = currentRank + 1 (Rank 0->1 costs 1 pt; 1->2 costs 2 pts; 2->3 costs 3 pts; 3->4 costs 4 pts; 4->5 costs 5 pts). Max rank is 5.',
      'Attributes Locked: Attributes do not increase on normal level-ups; permanent boosts are rare, named story rewards tied to specific milestones.'
    ]
  },
  {
    id: 'combat_and_defense',
    title: 'Combat Flow, Armor Soak & Damage Matrix',
    icon: '🛡️',
    summary: '10-second combat rounds, dodging, shield blocking, and the damage-type matrix.',
    points: [
      'Actions: 1 primary action per round + defensive reactions against incoming attacks.',
      'Dodging (Acrobatics): Completely avoids incoming damage on a successful roll. Medium/Heavy armor applies check penalties.',
      'Blocking (Blocking): Uses equipped shield/weapon. Absorbs damage via shield soak (Buckler 1d4, Medium 1d6, Tower 1d8 + magic bonus).',
      'Multi-Defense Penalty: First defense rolls normally; each additional defense in the same round suffers a cumulative -2 penalty.',
      'Armor Soak: Light (1d3), Medium (1d4, -1 check penalty), Heavy (1d6, -2 check penalty) + magic bonus.',
      'Tactical Damage Matrix: Blunt breaks heavy armor (+0 vs Leather, -2 vs Chain, -2 vs Plate). Piercing punctures leather (-2 vs Leather, +2 vs Chain, +0 vs Plate). Edged cuts unarmored (+0 vs Leather, +0 vs Chain, +2 vs Plate).'
    ]
  },
  {
    id: 'health_bleeding_death',
    title: 'Health, Bleeding & Dying',
    icon: '🩸',
    summary: 'Bandages, bleeding tiers 1-4, unconscious countdown, and true death.',
    points: [
      'Bleeding (Tiers 1-4): High-margin edged attacks cause bleeding (-1 to -4 HP per action). 10% chance per action to reduce tier naturally.',
      'Bandages: Usable anytime as 1 action: restores +1 HP and halts all bleeding immediately.',
      'Unconscious (0 to -4 HP): A 5-round death countdown begins while active bleeding continues to tick.',
      'True Death: Occurs if HP reaches -5 or the death countdown reaches 0.'
    ]
  },
  {
    id: 'resurrection_undeath',
    title: 'Resurrection, Undeath & Gear Recovery',
    icon: '💀',
    summary: 'Consequences of death, attribute sacrifice, the undead curse, and gear trails.',
    points: [
      'The Resurrection Rite: Permadeath is replaced by resurrection at unlocked sanctuaries (Ashveil Chapel or Merrin Abbey).',
      'Sacrifice of Power: Player permanently loses 1 of 2 offered random attributes (cannot drop below 1).',
      'Undead Curse: Resurrected characters become Undead, suffering a permanent -1 penalty to social skills (-2 on repeat death). Curable ONLY by the rare Rite of Quiet Return.',
      'Gear Recovery Trail: Carried gear is stripped on death. Intelligent killers carry it (relocates every 12h); beasts leave a cache (relocates every 24h). Trails go cold at 72h.',
      'Divine Intervention: Consuming Breath of the Creator revives in place at 1 HP. Thread of Returning restarts the quest. Both bypass death penalties.'
    ]
  },
  {
    id: 'survival_fatigue_time',
    title: 'Time, Fatigue, Rations & Survival',
    icon: '⏳',
    summary: 'Dynamic time advancement, fatigue drain, starvation, and 8-hour rests.',
    points: [
      'Dynamic Time: Actions advance time (10s combat, 1m dialogue, 5m lockpicking, 10m search, 30m craft, 1h smith).',
      'Midnight & Rations: Crossing midnight advances the Day and consumes 1 Ration.',
      'Starvation: Going without food increases Starvation Level, inflicting a cumulative -1 penalty to all checks per level. Eating a ration cures hunger.',
      'Fatigue Pool: Max Fatigue = 12.5 + (2.5 * Vigor). Below 0 fatigue inflicts Exhaustion (-1 per 0.5 below 0). Below -10 triggers collapse.',
      '8-Hour Rest: Consumes 1 ration, fully restores Fatigue and SP, and heals HP via Vigor + Healing skill.'
    ]
  },
  {
    id: 'magic_system',
    title: 'Arcane & Divine Spellcasting',
    icon: '✨',
    summary: 'Freeform spell shaping, Channeling magnitude (S), Burnout, and SP conversion.',
    points: [
      'Arcane Magic: Uses Arcane SP (Max = Arcane Drawing * 3) rolled with Arcane Shaping. Allowed shapes: Attack (S d6 damage) and Ward (+1d4 soak per S).',
      'Divine Magic: Uses Divine SP (Max = Divine Communion * 3) rolled with Divine Manifestation. Allowed shapes: Heal (S d6 HP), Control (bind/charm for S rounds), and Smite (S d8 radiant vs evil).',
      'Channeling (S): Caster chooses SP invested up to skill rank. Adds +4 * S complexity to the obstacle resistance.',
      'Burnout: Overspending Arcane SP damages HP directly; overspending Divine SP drains Fatigue directly.',
      'SP Conversion: Arcane and Divine SP can be converted at a 3:1 ratio.'
    ]
  },
  {
    id: 'economy_trading',
    title: 'Economy, Currency & Trade',
    icon: '💰',
    summary: 'Copper, Silver, Gold conversion, merchant buying rates, and item conditions.',
    points: [
      'Currency: 10 Copper (cp) = 1 Silver (sp); 10 Silver (sp) = 1 Gold (gp); 1 Gold = 100 Copper.',
      'Merchant Trade: Merchants buy relevant goods at 50% listed value. Successful Negotiation checks improve rates up to 75%.',
      'Item Condition: Multipliers adjust item values (Broken x0.1, Worn x0.75, Common x1, Masterwork x2.5, Magical x10, +1 Relic x15-x20).'
    ]
  }
];
