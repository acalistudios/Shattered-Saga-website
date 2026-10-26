// Structured Game Rules & Help Content for Shattered Saga
// Sourced directly from GAME_RULES.md (v7.0 Canonical Edition).
// Powers in-game help modals, rulebook drawers, and player guides.

export const GAME_RULES_SECTIONS = [
  {
    id: 'world_and_lore',
    title: 'The Shattered Realm & Cosmology',
    icon: '🌍',
    subsections: [
      {
        title: 'The Fivefold Font & The Ancient Calamity',
        content: [
          'The Shattered Realm was once unified under an ancient covenant of elemental balance centered at The Fivefold Font in Aethelgard.',
          'Five ancient champions attempted to seize every element simultaneously, cracking the central font and fracturing the spiritual equilibrium of the land.',
          'The cataclysm tore the empire apart into isolated city-states, lawless highways, and dangerous frontiers now troubled by rising planar static.'
        ]
      },
      {
        title: 'The Five Cosmic Elements',
        content: [
          'Air (Swift & Free): Masters of speed, perception, wind currents, and ranged marksmanship.',
          'Earth (Resilient & Dense): Anchored in endurance, heavy stone, physical fortitude, and craftsmanship.',
          'Fire (Volatile & Fierce): Driven by passion, explosive martial strength, courage, and searing combustion.',
          'Water (Flowing & Adaptable): Bound to healing, empathy, fluid movement, and spiritual cleansing.',
          'Aether (Ethereal & Planar): Attuned to the metaphysical weave, sacred relics, spatial seams, and memory.'
        ]
      },
      {
        title: 'The Four Geographic Provinces',
        content: [
          'Region 1: Aethelgard (Central Heartland) — 9 adventures: The Elemental Crucible, Ashveil Keep, Saltblood Mines, Sunken Spire, Clockwork Conservatory, Greywash Bandit Crown, Thorn Treaty, Harvest Hill Hunger, Mirror War of Saint Orra.',
          'Region 2: Ignis Ridge (Volcanic Calderas) — 3 adventures: The Obsidian Vault, Chains of the Iron Colosseum, The Brass Plague of Tinkertown.',
          'Region 3: Frostfire Glacier (The Permafrost) — 3 adventures: The Frostfire Crypt, Webbed Cavern of Blackroot Hollow, Plague Bells of Merrin Abbey.',
          'Region 4: The Sapphire Deep (Abyssal Seas & Sky) — 3 adventures: Threads of the Astral Sky, The Glass Orchard Masquerade, The Drowned Market of Bellweather Quay.'
        ]
      }
    ]
  },
  {
    id: 'core_loop',
    title: 'The Core Loop & Action Economy',
    icon: '⚔️',
    subsections: [
      {
        title: 'The Narrative Cycle',
        content: [
          '1. The Chronicler narrates the immediate tactical scene, NPC dialogue, and environmental hazards.',
          '2. You declare your character intent using suggested actions or natural language typing. Use quotes for speech: "Stand back, Vance!"',
          '3. For uncertain or dangerous actions, the engine rolls an Opposed Check instantly: Primary Die + Secondary Die + Skill Ranks (as 1d2 coin flips) + Modifiers vs. Challenge Resistance.',
          '4. The Chronicler narrates the outcome based on your Margin of Success, while the engine updates HP, Fatigue, and Inventory.'
        ]
      },
      {
        title: 'Turn & Time Economy',
        content: [
          'Each tactical turn represents ~10 seconds of combat or 10-15 minutes of dungeon/wilderness exploration.',
          'You may take 1 Primary Action (attack, cast, sprint, pick lock) alongside reasonable Free Actions (drawing a blade, dropping an item, battle cries).',
          'At 18:00 dusk, the engine prompts for your daily evening meal, consuming 1 ration per 24 hours.'
        ]
      }
    ]
  },
  {
    id: 'character_creation',
    title: 'Character Creation & Professions',
    icon: '👤',
    subsections: [
      {
        title: 'The 14 Canonical Professions',
        content: [
          'Bandit: Cunning highwayman; skilled in Light Weapons, Stealth, Thievery, Escapology, and Intimidation.',
          'Bard: Traveling skald and poet; skilled in Performance, Deception, Lore, Insight, and Negotiation.',
          'Cleric: Ordained chapel minister; skilled in Divine Communion, Divine Manifestation, Healing, Lore, and Leadership.',
          'Craftsman: Artisan builder; skilled in Crafting, Smithing, Appraise, Athletics, and Perception.',
          'Duelist: Disciplined blade fencer; skilled in Light Weapons, Acrobatics, Insight, Brawling, and Deception.',
          'Farmer: Hardy tiller; skilled in Survival, Herbalism, Animal Rapport, Athletics, and Brawling.',
          'Healer: Field apothecary; skilled in Healing, Herbalism, Alchemy, Insight, and Divine Communion.',
          'Hunter: Wilderness tracker; skilled in Marksmanship, Tracking, Stealth, Survival, and Trapping.',
          'Merchant: Shrewd trader; skilled in Negotiation, Appraise, Deception, Insight, and Languages.',
          'Sailor: Veteran coastal mariner; skilled in Athletics, Acrobatics, Brawling, Survival, and Escapology.',
          'Scholar: Academic researcher; skilled in Lore, Languages, Insight, Arcane Drawing, and Appraise.',
          'Shaman: Elemental seer; skilled in Divine Communion, Arcane Shaping, Herbalism, Animal Rapport, and Survival.',
          'Soldier: Castle garrison infantry; skilled in Heavy Weapons, Blocking, Athletics, Leadership, and Intimidation.',
          'Wilderness Guide: Trail scout; skilled in Survival, Tracking, Perception, Marksmanship, and Athletics.'
        ]
      },
      {
        title: 'Granular Roleplay Modifiers (-3 to +3)',
        content: [
          'Virtue Alignment: +1 when upholding virtue under peril or temptation; -1 for direct violation.',
          'Vice Temptation: +1 when struggling against or mastering vice in character; -1 for mindless indulgence.',
          'Philosophical Conviction: +1 when acting on core life philosophy; -1 for acting against core creed.',
          'Cumulative Modifier: Can stack from -3 to +3 on your next roll, flashing on-screen and logging in the Action Log.'
        ]
      }
    ]
  },
  {
    id: 'opposed_rolls',
    title: 'Opposed Skill & Attribute Checks',
    icon: '🎲',
    subsections: [
      {
        title: 'The Step-Die Progression',
        content: [
          'Primary Attribute Die: Score 1 (1d4), 2 (1d6), 3 (1d8), 4 (1d10), 5 (1d12), 6+ (1d20). Represents raw natural aptitude.',
          'Secondary Attribute Die: Score 1 (1d2), 2 (1d2+1), 3 (1d4), 4 (1d4+1), 5 (1d6), 6+ (1d10). Represents supporting finesse.',
          'Skill Ranks (0-5): Each rank adds 1d2 (coin flip: 1 or 2). Gives reliable, training-based consistency instead of wild variance.'
        ]
      },
      {
        title: 'Margins of Success',
        content: [
          'Critical Triumph (+8 or higher): Spectacular victory with bonus tactical effects.',
          'Standard Success (+1 to +7): Clean, decisive execution of intent.',
          'Dynamic Standoff (0 — Tie): Tense stalemate, locked blades, or temporary impasse.',
          'Failure with Complication (-1 to -7): Clean miss or success at heavy cost.',
          'Catastrophic Fumble (-8 or lower): Disastrous failure, broken weapon, or ambush.'
        ]
      }
    ]
  },
  {
    id: 'combat_and_tactics',
    title: 'Combat, Defenses & Warfare',
    icon: '🛡️',
    subsections: [
      {
        title: 'Active Defenses',
        content: [
          'Acrobatics (Dodge): Coordination + Vigor. Completely avoids damage on success (Medium armor -1, Heavy armor -2).',
          'Blocking (Shield/Parry): Power + Coordination. Interposes shield or weapon to soak damage (Wooden: 1d4, Iron: 1d6+1, Tower: 1d8+2).',
          'Ward (Willpower/Arcane): Willpower + Empathy (or Attunement + Intellect). Resists mental terror, curses, and spellblasts.'
        ]
      },
      {
        title: 'Multi-Defense & Swarm Penalty (-2 Cumulative)',
        content: [
          'Each defensive reaction beyond the first in the same round suffers a cumulative -2 penalty (-2 on 2nd, -4 on 3rd, -6 on 4th).',
          'Tactical rule: Avoid being surrounded by minions or taking multiple flurries from rapid foes without cover!'
        ]
      }
    ]
  },
  {
    id: 'tactical_survival_guide',
    title: 'Tactical Survival & Boss Encounters',
    icon: '🧭',
    subsections: [
      {
        title: 'The Investigative Mindset (Tactics vs. Brute Force)',
        content: [
          'Shattered Saga is not a hack-and-slash brawler where raw martial force solves every crisis.',
          'Many encounters are investigative and tactical puzzles: gather local intelligence from NPCs like Martha and Vance before embarking.',
          'Search for sacred relics, ciphered notes, signet rings, and holy water fonts in ruins before challenging the depths.',
          'Ghosts bound by oaths, cowardly goblins, and ancient guardians can often be pacified, bargained with, or outmaneuvered.'
        ]
      },
      {
        title: 'Boss Encounters & The Malachar Rule',
        content: [
          'Immunity to Mundane Steel: Planar, demonic, and spectral bosses (like Malachar the Bound Demon) ignore normal weapons and roll monstrous d20 resistance dice.',
          'Attempting to duel an ancient demon head-on with a starting character is swift suicide.',
          'The Ritual Solution: Dismantle bosses through preparation—restore Lord Aldric Voss’s broken oath with his signet ring, deploy chapel Holy Water to weaken incorporeal forms, and use sacred Binding Scrolls and Keystones to re-seal the horror while allies hold the line.'
        ]
      },
      {
        title: 'Opposed Check Strategy & Odds',
        content: [
          'Novice Challenges (EV ~6.0): Trained primary skills succeed ~85-90% of the time.',
          'Professional Challenges (EV ~8.0): Trained skills succeed ~70-75%; untrained attempts drop below 20%.',
          'Veteran Challenges (EV ~10.0): Specialized mastery required (~50-60% success for specialists; under 10% for novices).',
          'Rule of thumb: Play to your champion’s primary attributes and trained skill coins. Avoid low-die untrained rolls when an alternate route or ally exists.'
        ]
      }
    ]
  },
  {
    id: 'magic_system',
    title: 'Freeform Magic: Arcane & Divine',
    icon: '✨',
    subsections: [
      {
        title: 'Dual Energy Pools',
        content: [
          'Arcane Energy (arcaneSP): Powers Arcane Drawing and Arcane Shaping (elemental combustion, kinetic shields, lightning bursts).',
          'Divine Energy (divineSP): Powers Divine Communion and Divine Manifestation (holy smites, radiant healing, expelling undead).'
        ]
      },
      {
        title: 'Signature Elemental Powers',
        content: [
          'Fire (Cinderbreath): Unleash a 2d6 flame cone once between rests; scales up to 4d6 lingering fireburst.',
          'Earth (Stone Mantle): Gain +1d6 armor soak for 3 rounds once between rests; scales up to +1d10 soak with stun immunity.',
          'Air (Gale Flash): Disorient a foe for 2 rounds once between rests; scales up to 10-yard blinding tempest.',
          'Water (Tide Mend): Heal 1d6+2 HP and staunch bleeding once between rests; scales up to 3d6+6 party healing surge.',
          'Aether (Threadstep): Teleport 15 yards or turn failure into narrow success once between rests; scales up to rerolls with +4 bonus.'
        ]
      }
    ]
  },
  {
    id: 'survival_and_health',
    title: 'Survival, Injury & Camping',
    icon: '🏕️',
    subsections: [
      {
        title: 'Resting & Camping',
        content: [
          'Full Camp (1 ration at dusk): Restores 50 Fatigue, fully resets Arcane & Divine Energy, and heals 25% Max HP.',
          'Starving Camp (no food): Restores only 15 Fatigue, resets half magic energy, and heals 0 HP.',
          'Safe Tavern Inn: Fully clears all Fatigue, fully resets magic energy, and heals 50% Max HP.'
        ]
      },
      {
        title: 'Venous Bleeding & Direct Pressure',
        content: [
          'Venous bleeding deals direct damage every 3 rounds. Wiping with a cloth does nothing.',
          'Can only be staunched by sustained direct pressure (occupies hands for 2 rounds), First Aid bandages, or Water/Divine healing.',
          'Warning: Stabilizing at 1 HP without staunching bleed will cause re-collapse on the next bleed tick!'
        ]
      },
      {
        title: 'Scaled Encumbrance',
        content: [
          'Tier 1 (1-3 slots over): -1 Acrobatics, +2 Fatigue/turn, no sprinting.',
          'Tier 2 (4-6 slots over): -3 all physical checks, +5 Fatigue/turn, speed halved.',
          'Tier 3 (7+ slots over): Immobile / Encumbered Stasis (cannot move or dodge until excess weight is dropped).'
        ]
      },
      {
        title: 'Darkness & Torches',
        content: [
          'Pitch darkness inflicts -4 penalty to visual Perception and Ranged Marksmanship.',
          'Torches illuminate 15 yards (normal melee), but distant targets beyond the light circle still suffer -2 dim-light penalty.'
        ]
      }
    ]
  },
  {
    id: 'ai_and_ui',
    title: 'AI Game Master & Interface',
    icon: '🖥️',
    subsections: [
      {
        title: 'Player-to-GM Communication',
        content: [
          'Use quotation marks for character speech: "Stand down, Vance."',
          'Use [OOC: ...] or ((out of character)) to clarify intent or correct GM misunderstandings directly without breaking narrative flow.',
          'The engine prevents godmoding: declare intent, not direct outcomes.'
        ]
      },
      {
        title: 'Save Slots & Hotkeys',
        content: [
          '2 complimentary Cloud Save Slots; additional slots (up to 8 total) unlock permanently for 5 Gems each.',
          'Hotkeys: C (Character Sheet), I (Inventory), M (Regional Map), J (Quest Journal), ? (Rules Modal), 1-3 (Suggested Actions).',
          'Mobile devices feature an expandable bottom touch drawer for instant one-tap navigation.'
        ]
      }
    ]
  },
  {
    id: 'travel_and_companions',
    title: 'Travel Encounters & Teamwork Allies',
    icon: '🐎',
    subsections: [
      {
        title: 'Road Patrols & Highway Hazards',
        content: [
          'Between adventures or during transit across dangerous frontiers, outlaws, brigands, and monsters roam the high roads.',
          'One patrol is available before your first completed adventure. Each newly completed adventure replaces your allowance with two patrols; unused patrols do not bank. Resting does not replenish the allowance.',
          'A patrol is a GM-run scene: choose your own actions, fight, negotiate, or escape. Setting out costs 3 fatigue; at least four hours pass. You must have positive fatigue and sufficient HP to start. Negative fatigue imposes a check penalty of floor(2 × fatigue deficit).',
          'Patrol spoils are engine-defined: consumables, a chance of one gear item, and gold capped at 2 gp per character level (maximum 20 gp), never above the authored reward. Escaping pays no spoils. Unlocked region maps remain accessible for recovery.'
        ]
      },
      {
        title: 'Companions & Teamwork Assists',
        content: [
          'Solo adventurers can recruit allies across the campaign (e.g. Skritt the Goblin Scout in Ashveil Keep, Kaelen the Miner in Saltblood, Silas the Hound in Blackroot Hollow, Sister Maren in Merrin Abbey, Cog-Tail the Familiar in Clockwork Conservatory).',
          'Active companions provide an automatic +1 Teamwork Assist bonus to skill checks matching their specialized training.',
          'Companions shore up untrained skill weaknesses, allowing martial characters to overcome occult barriers or scholars to navigate dangerous wilderness traps.'
        ]
      }
    ]
  }
];
