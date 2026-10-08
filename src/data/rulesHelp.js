// Structured Game Rules & Help Content for Shattered Saga
// Sourced directly from GAME_RULES.md (v7.0 Player's Manual Edition).
// Powers in-game help modals, rulebook drawers, and player guides.

export const GAME_RULES_SECTIONS = [
  {
    id: 'world_and_lore',
    title: 'The Shattered World & Cosmology',
    icon: '🌍',
    summary: 'The Great Sundering, 5 Cosmic Elements, and the 4 Realm Provinces.',
    points: [
      'The Great Sundering: 500 years ago, mortal kings shattered the Prime Keystone, fracturing the realm into planar pockets.',
      'The 5 Elements: Air (Speed/Freedom), Earth (Endurance/Duty), Fire (Passion/Destruction), Water (Adaptation/Healing), and Aether (The Weave/Time/Space).',
      'Region 1: Aethelgard — Central temperate lowlands, gothic keeps, ancient yew groves, and forgotten subterranean crypts.',
      'Region 2: Ignis Ridge — Volcanic calderas, iron smelters, clockwork factories, and illicit Flare mining refineries.',
      'Region 3: Frostfire Glacier — Howling blizzards, permafrost bogs, blackroot caverns, and the necrotic Brass Plague.',
      'Region 4: The Sapphire Deep — Oceanic abyssal trenches, coral citadels, glass orchards, and floating astral islands.'
    ]
  },
  {
    id: 'quick_start',
    title: 'Quick Start & Core Gameplay Loop',
    icon: '⚡',
    summary: 'Playing in 5 minutes, turn economy, and player intent.',
    points: [
      'Core Loop: AI GM presents narrative scene -> Player chooses or writes custom action -> Engine rolls Step-Die opposed check -> AI narrates outcome & updates state.',
      'Exploration Turns: Room searches, dialogue, and investigation advance the in-game world clock by 10 minutes.',
      'Combat Rounds: Battle occurs in 10-second tactical combat rounds (1 major action, 1 free action, defensive reactions).',
      'Short Rest (1 Hour): Patch wounds with First Aid and recover minor stamina in the field.',
      'Full Rest (8 Hours): Consumes 1 Ration; restores 40 Fatigue, resets SP to maximum, and clears temporary conditions.'
    ]
  },
  {
    id: 'character_creation',
    title: 'Character Creation & Philosophies',
    icon: '👤',
    summary: 'Elemental Affinities, Age Tiers, Backgrounds, Attributes, and Morality.',
    points: [
      'Elemental Affinities: Fire (Cinderbreath), Earth (Stone Mantle), Air (Gale Flash), Water (Tide Mend), Aether (Threadstep). Usable once per rest.',
      'Age Tiers: Youth (physical boost), Adult (balanced), Middle-Aged (mental boost + skills), Veteran (spiritual/SP boost).',
      'Professions: Iron Legionnaire, Shadow Scout, Scholarly Hedge Mage, Wandering Pilgrim, Guild Artisan.',
      '8 Attributes: Power, Coordination, Vigor, Willpower, Intellect, Charisma, Attunement, Empathy (Starting pool: 24 total points).',
      'Roleplay Modifier ([roleplay_modifier: +1/-1]): In-character bonus (+1 to next roll) when acting in harmony with Virtue/Philosophy; Out-of-character penalty (-1 to next roll) for breaking vows or metagaming.',
      'Morality (-100 to +100 Scale): Heroic (>= +15/+30/+45) awards up to +3 Hit and +3 Damage vs evil/monstrous foes; Malevolent (<= -15/-30/-45) awards up to +3 Hit and +3 Damage vs holy/innocents.'
    ]
  },
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
      'Combat Margin Bonus: Every full 3 points of margin over defender adds +1 Raw Weapon Damage (+2 at margin 6, etc.). High-margin edged attacks also trigger Bleeding.'
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
      'Max Health: 12 + (Vigor * 4) + (Power * 2) + (Level * 2).',
      '36 Skills: Each skill is tied to 1 Primary Attribute (1.0 weight) and 1 Secondary Attribute (0.5 weight).',
      'Canonical Alignment: Skill 24 is Lore (Intellect + Empathy); Skill 27 is Negotiation (Charisma + Empathy).'
    ]
  },
  {
    id: 'progression_rewards',
    title: 'Progression, Leveling & Skill Upgrades',
    icon: '⭐',
    summary: 'Engine-authoritative leveling, spendable skill points, and upgrade costs.',
    points: [
      'Engine Authority: Code strictly controls stats, skill points, currency, and rewards; the AI narrates the milestone moment.',
      'Skill Points: Awarded on adventure completion (Wave 1: 2 pts, Wave 2: 3 pts, Wave 3: 4 pts).',
      'Skill Upgrade Cost: Cost = currentRank + 1 (Rank 0->1 costs 1 pt; 1->2 costs 2 pts; 2->3 costs 3 pts; 3->4 costs 4 pts; 4->5 costs 5 pts). Max rank is 5.',
      'Milestone Boons: Signature elemental abilities unlock at Level 2; attribute increases at Levels 4 and 8; Planar Champion at Level 10.'
    ]
  },
  {
    id: 'combat_and_defense',
    title: 'Combat Flow, Armor Soak & Damage Matrix',
    icon: '🛡️',
    summary: '10-second combat rounds, dodging, shield blocking, and the damage-type matrix.',
    points: [
      'Actions: 1 primary action per round + defensive reactions against incoming attacks.',
      'Dodging (Coordination + Vigor): Completely avoids incoming damage on a successful roll.',
      'Blocking (Power + Coordination + Shield): Absorbs damage via shield soak (Buckler 1d4, Medium 1d6, Tower 1d8 + magic bonus).',
      'Multi-Defense Penalty: First defense rolls normally; each additional defense in the same round suffers a cumulative -2 penalty.',
      'Armor Soak: Light (1d3), Medium (1d4+1), Heavy (1d6) + magic bonus.',
      'Tactical Damage Matrix: Slashing (+2 vs unarmored, -2 vs plate). Piercing (+2 penetration vs chainmail). Bludgeoning (+2 soak bypass vs plate).'
    ]
  },
  {
    id: 'health_bleeding_death',
    title: 'Health, Bleeding & Dying',
    icon: '🩸',
    summary: 'Bandages, bleeding tiers 1-4, unconscious countdown, and true death.',
    points: [
      'Bleeding (Tiers 1-4): High-margin edged attacks cause ongoing bleeding (-1 to -8 HP per round/turn).',
      'Bandages: Usable as 1 action: halts Bleeding Tier 1-2 immediately.',
      'Dying Countdown (0 HP): Character collapses; a 3-round Vigor survival countdown (DC 11) begins.',
      'True Death: Occurs if the dying countdown reaches 0 or fails 3 consecutive checks.'
    ]
  },
  {
    id: 'resurrection_undeath',
    title: 'Resurrection, Undeath & Gear Recovery',
    icon: '💀',
    summary: 'Consequences of death, attribute sacrifice, the undead curse, and gear trails.',
    points: [
      'The Resurrection Rite: Permadeath is replaced by resurrection at regional leylines.',
      'Sacrifice of Power: Player permanently loses 1 of 2 offered random attributes (cannot drop below 1).',
      'Undead Curse: Resurrected characters become Undead, suffering a permanent -1 penalty to social skills (-2 on repeat death). Curable ONLY by the rare Rite of Quiet Return.',
      'Gear Recovery Trail: Carried gear is stripped on death. Intelligent killers carry it (12h window); hidden caches last 24h; trails expire at 72h.'
    ]
  },
  {
    id: 'survival_fatigue_time',
    title: 'Time, Fatigue, Rations & Survival',
    icon: '⏳',
    summary: 'Dynamic time advancement, fatigue drain, starvation, and 8-hour rests.',
    points: [
      'Dynamic Time: Actions advance time (10s combat, 10m search, 30m craft, 1h smith).',
      'Midnight & Rations: Crossing midnight advances the Day and consumes 1 Ration.',
      'Starvation: Crossing midnight with 0 rations inflicts Starving debuff and +15 Fatigue.',
      'Fatigue Pool (0-100): Over 50 causes Exhaustion (-2 to all rolls); 100 triggers physical collapse.',
      '8-Hour Rest: Consumes 1 ration, fully restores SP, restores 40 Fatigue, and heals 20% Max HP.'
    ]
  },
  {
    id: 'magic_system',
    title: 'Arcane & Divine Spellcasting',
    icon: '✨',
    summary: 'Freeform spell shaping, Channeling magnitude (S), Burnout, and SP conversion.',
    points: [
      'Arcane Shaping (Intellect + Attunement): Dynamic leylines for kinetic force, lightning, fire, and spatial manipulation.',
      'Divine Manifestation (Attunement + Willpower): Holy miracles for healing, radiant smites, and warding against corruption.',
      'Channeling Magnitude (S = 1 to 5): Choose SP cost and die scaling (1d4 up to 4d8+6).',
      'Planar Burnout: Casting without sufficient SP drains Fatigue directly; catastrophic failures risk lethal Arcane Backlash.'
    ]
  },
  {
    id: 'campaign_saga',
    title: 'The Campaign Saga: Planar Convergence',
    icon: '📜',
    summary: 'The 3-Act overarching storyline connecting all 18 adventures.',
    points: [
      'Act I: The Whispering Static (Region 1: Aethelgard) — Local crises (Ashveil, Saltblood, Clockwork) culminate in the Elemental Crucible, uncovering deliberate planar fractures.',
      'Act II: The Smoldering Conspiracies (Regions 2 & 3) — The Redvein Syndicate and Baron Threx weaponize Flare in Ignis Ridge while Frostfire thermal seals thaw.',
      'Act III: The Sunken Convergence (Region 4: The Sapphire Deep) — Infiltrate the Planar Architects in the Astral Sky to decide the realm fate (Restoration, Convergence, Ascendance).',
      'Affinity Loci: Each adventure contains unique secret pathways resonant with your chosen elemental affinity.',
      'Campfire Interludes: Rescued NPCs and traveling companions react dynamically to your choices and morality during camp rests.'
    ]
  },
  {
    id: 'ai_gamemaster',
    title: 'The AI Game Master & Interactive Play',
    icon: '🎭',
    summary: 'The Chronicler narrator, prompting tips, and engine tags.',
    points: [
      'The Master Narrator: The Chronicler — a unified, grounded, neutral narrator addressing you as "you" without purple clichés or forced theatrics.',
      'Adaptive Atmosphere: Dynamically shifts tone between Gothic Dread (crypts), Planar Wonder (fonts), and Kinetic Grit (iron forges).',
      'Player Prompting Secrets: State clear intent rather than assuming success; include sensory details; use the environment; speak in character with quotes.',
      'Free-Roam Mode: Step off the beaten path to explore roadside inns, ancient ruins, and regional bounties.',
      'Constrained Tags: The AI communicates with the engine via tags like [check: skill dc], [damage: X type], [heal: X], and [objective_complete: id].'
    ]
  },
  {
    id: 'economy_trading',
    title: 'Economy, Currency & Trade',
    icon: '💰',
    summary: 'Copper, Silver, Gold conversion, merchant buying rates, and item conditions.',
    points: [
      'Currency: 10 Copper (cp) = 1 Silver (sp); 10 Silver (sp) = 1 Gold (gp); 1 Gold = 100 Copper; 1 Electrum = 500 Copper.',
      'Merchant Trade: Merchants buy relevant goods at 50% listed value. Successful Negotiation checks improve rates up to 70%.',
      'Patrols & Arena: Low-risk wilderness patrols award steady copper; the Iron Colosseum awards gladiatorial gold and rare weapons.'
    ]
  }
];
