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
          // Must match PROFESSIONS in data/gms.js (the skills a character actually starts with).
          'Bandit: Cunning highwayman; skilled in Stealth, Lockpicking, One-Handed Weapons, and Thievery.',
          'Bard: Traveling skald and poet; skilled in Performance, Deception, Negotiation, and One-Handed Weapons.',
          'Cleric: Ordained chapel minister; skilled in Divine Communion, Lore, Healing, and Blocking.',
          'Craftsman: Artisan builder; skilled in Crafting, Appraise, Smithing, and Negotiation.',
          'Duelist: Disciplined blade fencer; skilled in One-Handed Weapons, Acrobatics, Blocking, and Performance.',
          'Farmer: Hardy tiller; skilled in Survival, Herbalism, Animal Rapport, and Negotiation.',
          'Healer: Field apothecary; skilled in Healing, Herbalism, Insight, and Lore.',
          'Hunter: Wilderness tracker; skilled in Marksmanship, Tracking, Trapping, and Perception.',
          'Merchant: Shrewd trader; skilled in Negotiation, Appraise, Languages, and Leadership.',
          'Sailor: Veteran coastal mariner; skilled in Athletics, Blocking, Survival, and Brawling.',
          'Scholar: Academic researcher; skilled in Lore, Languages, Arcane Drawing, and Arcane Shaping.',
          'Shaman: Elemental seer; skilled in Arcane Drawing, Divine Communion, Animal Rapport, and Herbalism.',
          'Soldier: Castle garrison infantry; skilled in Two-Handed Weapons, Blocking, Athletics, and Leadership.',
          'Wilderness Guide: Trail scout; skilled in Survival, Tracking, Perception, and Athletics.'
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
          'Acrobatics (Dodge): Coordination + Vigor. Completely avoids damage on success (Medium armor -1, Heavy armor -2, and -1 for every two metal helm/leg/foot/hand pieces).',
          'Blocking (Shield/Parry): Power + Coordination. A shield adds to the roll (Buckler +1, Wooden +2, Iron or steel +3, Tower or heavy +4) and, on success, soaks damage (Wooden or buckler 1d4, Iron or steel 1d6, Tower or heavy 1d8, plus any +N on the shield). Parrying with a weapon and no shield soaks 1d2 with a one-handed weapon or 1d4 with a two-handed one. Dodge avoids all damage; Block makes up for it with the shield bonus and works in heavy armour.',
          'Resist (Willpower): Willpower + Empathy + your Divine Communion or Arcane Drawing ranks, whichever is higher. When an attack is mental or magical (a curse, terror, possession), the defence buttons become a single Resist button. Success avoids it entirely; armour and shields do nothing against it.',
          'Armour: body armour soaks damage when you are hit (light 1d3, medium 1d4, heavy 1d6). Helmets, leggings, boots and gloves add to it: each metal piece counts 2 and each leather piece 1, and every 4 adds +1 soak (a full metal set +2, a full leather set +1). Every two metal pieces cost -1 on dodges, and a full metal set of four also costs -1 on blocks. A blow that gets past your defence always does at least 1 damage, however good your armour.',
          'Your Combat Stats panel (in Equipment) shows your current to-hit, damage, attacks per action, soak, dodge, block and resist.'
        ]
      },
      {
        title: 'Multi-Defense & Swarm Penalty (-2 Cumulative)',
        content: [
          'Each defensive reaction beyond the first in the same round suffers a cumulative -2 penalty (-2 on 2nd, -4 on 3rd, -6 on 4th).',
          'Tactical rule: Avoid being surrounded by minions or taking multiple flurries from rapid foes without cover!'
        ]
      },
      {
        title: 'Weapons & Fighting Styles',
        content: [
          'Weapons held in one hand use the One-Handed Weapons skill; weapons held in both use Two-Handed Weapons; bows and crossbows use Marksmanship. Each item shows its damage, skill and hands in your inventory and in shops.',
          'One-handed: dagger 1d4+1; shortsword, hatchet 1d6; rapier 1d6 (Finesse, +1 to hit); spear 1d6 (Reach, +1 to your first defence each round); mace 1d6 (Crushing, +2 damage against medium or heavy armour); sword, axe 1d8; flail 1d8 (wraps around shields so they add nothing to a block, but -1 to hit).',
          'Two-handed: greatsword and war scythe 1d10 (balanced); halberd 1d10 (its haft parries 1d6); warhammer 1d10 (Crushing +1); battle axe 1d12 (unwieldy, -1 to hit).',
          'Bows: short bow 1d6, two quick shots per action at -2 each; longbow 1d8, +1 to hit; crossbow 1d10+1 whose bolts ignore 2 armour, but it must reload after every shot (the next ranged action reloads). Every item shows its trait in the shop and your inventory.',
          'Dual wielding: hold a one-handed melee weapon in each hand and every melee attack strikes twice, at a penalty that depends on the weapon in each hand. Light weapons (daggers, knives, torches): no penalty in the main hand, -1 to hit in the off hand. Heavier one-handers: main hand -1 to hit, off hand -2 to hit and -1 damage. You can parry with the main-hand weapon, but there is no shield bonus or shield soak.',
          'Fighting styles: two-handed fighters have a small edge on shield fighters, shield fighters on dual wielders, and dual wielders on two-handed fighters. Archers do well against everyone except shields. The edges are small: any style can win any fight. Enemies show their style beside their name in combat.',
          'Heavy blow: a two-handed attack weakens a shield (its block bonus and block die count three-quarters). Quick blows: a shield blocks each of the two strikes of a dual wielder. Arrows: no weapon can parry an arrow, and without a shield you defend against one at -2; a shield blocks arrows normally.',
          'Enemies with a shield block your attacks instead of dodging: a block still lets part of the blow through, after their armour and the shield die.',
          'Hunger, exhaustion and a heavy load lower your attack rolls, dodges and blocks, as well as your skill checks.'
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
          'Immunity to Mundane Steel: incorporeal and planar foes (like Malachar the Bound Demon) take no damage from ordinary weapons, and some take only half, until the story\'s weakness is used (holy water, a seal, an oath restored). Magic weapons (+N or story rewards), spells and divine power hurt them normally. The combat log says when steel passes through.',
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
          'Each power can be used once between rests. The Game Master narrates its effect; the engine tracks whether it has been used.',
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
          'Camp with a ration (8 hours): fully restores Fatigue and Arcane & Divine Energy, recharges your elemental power, and heals 25% of Max HP plus 1 per Healing rank. A character at 0 HP or below needs real healing first.',
          'Camp without food: heals nothing and restores no magic, but you get back half your Fatigue. Hunger then lowers every roll until you eat.',
          'Inn: a paid room at a tavern restores more than a camp; the innkeeper lists what each room gives.'
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
          'Darkness is judged by the Game Master: expect it to make spotting things and shooting harder, and carry a torch or lantern into caves and crypts.'
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
          'Hotkeys: L opens and closes the dice log; Escape closes it.',
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
          'After your first completed adventure, rougher bands join the roads: zealot processions, toll-road crossbowmen, anarchist gangs and Inquisition enforcers. They attack several times a round with modest blows, so each extra defence is harder and good armour pays for itself. Each can also be talked down, outwitted or avoided.',
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
