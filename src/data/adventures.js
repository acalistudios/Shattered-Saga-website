import oracleBanner from '../assets/images/oracle.png';
import titanBanner from '../assets/images/titan.png';
import ancientBanner from '../assets/images/ancient.png';

export const ADVENTURES_LIST = [
  {
    id: 'ashveil_keep',
    name: 'Ashveil Keep',
    desc: 'Investigate the three missing children last seen walking toward the looming gothic ruins of Ashveil Keep at dawn. Uncover Lord Aldric Voss\'s ancient vigil and deal with the demonic shadow of Malachar.',
    element: 'air',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 13.0, // 1:00 PM
    startingPrompt: 'The player stands in the quiet, dusty square of Ashveil Village at early afternoon. The looming grey stone walls of Ashveil Keep dominate the hill above, silhouetted against the pale sky. Villagers speak in hushed whispers behind locked doors. From Martha\'s Provisions, the sound of quiet weeping. From Vance\'s Forge, the slow, distracted rhythm of a hammer. The hill road leads up past a yew-screened graveyard before it reaches the keep gate. Three children are missing. Ask the player where they want to go first.',
    objectives: [
      'Find and rescue Tam, Lira, and Oswin before the keep fully claims them.',
      'Gain entry to the keep through the locked gate, the graveyard passage, or a Voss crest mechanism.',
      'If the player refuses or delays the rescue for two full days, apply morality loss and have them awaken trapped inside the keep by Malachar\'s pull.',
      'Learn the truth of Aldric Voss, the bound priest, the cult seal, and Malachar\'s imprisonment.',
      'Resolve Malachar by re-binding, banishing, destroying, bargaining with, or fleeing from the demon.'
    ],
    backstory: 'Ashveil Keep is the first tale most travelers hear when they reach Ashveil Village: a black-walled ruin on the hill, a cruel Lord Aldric Voss, and an old legend that he bound a priest beneath the keep to secure forbidden power. For generations the story was only a warning told to children, but in recent weeks the stones have begun to groan at night, animals wander toward the hill and do not return, and children wake from dreams of a silver voice calling their names. Rumors also speak of a goblin war band hiding near the ruins, though the villagers disagree on whether the goblins serve the haunting or fear it. When Tam, Lira, and Oswin vanish at dawn, the village turns to the player for help; if the player refuses, different townspeople plead with them until the keep itself begins to pull at their dreams.',
    npcs: [
      {
        name: 'Vance',
        role: 'Forge Owner',
        desc: 'A grizzled retired watchman with a limp who is suspicious of the keep.',
        stats: {
          HP: 14,
          attributes: { Power: 3, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 2 },
          skills: { Blocking: 2, HeavyWeapons: 2, Perception: 2, Smithing: 2, Leadership: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', block: 'Power d8 + Coordination d2+1 + 2d2' },
          armor: 'Leather apron, light armor soak 1d3 when relevant',
          attacks: [{ name: 'Forge Hammer', skill: 'Heavy Weapons', damage: '1d8 blunt', note: 'Uses a smithing hammer as a warhammer if cornered.' }],
          equipment: ['Forge Hammer', 'Iron Shield', 'Smithing Tools'],
          weaknesses: ['Old leg injury imposes -1 on chase, Acrobatics, or extended Athletics checks.']
        }
      },
      {
        name: 'Martha',
        role: 'Provisioner',
        desc: 'Frantic widow whose nephew Oswin is one of the missing children.',
        stats: {
          HP: 12,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 3, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 4 },
          skills: { Insight: 3, Negotiation: 2, Healing: 1, Herbalism: 1, Perception: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d8 + Empathy d4+1' },
          armor: 'None',
          attacks: [{ name: 'Kitchen Knife', skill: 'Light Weapons', damage: '1d4 edged', note: 'Only fights if Oswin is threatened.' }],
          equipment: ['Bandages (2)', 'Rations (3)', 'Kitchen Knife'],
          weaknesses: ['Can be pressured by threats to Oswin; may panic if shown demonic evidence without reassurance.']
        }
      },
      {
        name: 'Skritt',
        role: 'Goblin Boss',
        desc: 'Terrified and desperate goblin boss trapped by the curse.',
        stats: {
          HP: 13,
          attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 2, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 1 },
          skills: { Stealth: 3, Thievery: 2, LightWeapons: 2, Trapping: 2, Intimidation: 1 },
          defenses: { dodge: 'Coordination d10 + Vigor d2+1 + Stealth 3d2 when hiding', block: 'Power d6 + Coordination d4+1' },
          armor: 'Patchwork leather, light armor soak 1d3',
          attacks: [{ name: 'Notched Dagger', skill: 'Light Weapons', damage: '1d4 edged or piercing', note: 'Prefers ambushes and retreats after a wound.' }],
          equipment: ['Notched Dagger', 'Snare Cord', 'Bent Key Ring'],
          weaknesses: ['Cowardly under direct Intimidation; mercy or food can turn him into an informant.']
        }
      },
      {
        name: 'Aldric Voss',
        role: 'Lord Ghost',
        desc: 'A ghostly knight bound by unfinished duty to contain Malachar.',
        stats: {
          HP: 22,
          attributes: { Power: 4, Coordination: 3, Vigor: 3, Willpower: 5, Intellect: 3, Charisma: 3, Attunement: 3, Empathy: 2 },
          skills: { HeavyWeapons: 3, Blocking: 3, Leadership: 2, Lore: 2, DivineCommunion: 1 },
          defenses: { dodge: 'Coordination d8 + Vigor d4', block: 'Power d10 + Coordination d4 + 3d2', will: 'Willpower d12 + Empathy d2+1' },
          armor: 'Spectral plate; mundane weapons pass through unless the Voss crest items, Holy Water, or the Binding Prayer Scroll are involved.',
          attacks: [{ name: 'Spectral Bastard Sword', skill: 'Heavy Weapons', damage: '1d8 edged', note: 'Deals Fatigue instead of HP unless Aldric is enraged.' }],
          special: 'Holy Water calms Aldric for a few turns rather than harming him, unless the player continues attacking.',
          weaknesses: ['The Voss Signet Ring, truth about the bound priest, and acts of mercy can restore his reason.']
        }
      },
      {
        name: 'Malachar',
        role: 'Bound Demon',
        desc: 'A shadow-demon feeding on fear, broken oaths, and the old priest\'s corrupted binding.',
        stats: {
          HP: 38,
          attributes: { Power: 4, Coordination: 5, Vigor: 4, Willpower: 6, Intellect: 4, Charisma: 5, Attunement: 6, Empathy: 1 },
          skills: { Deception: 4, Intimidation: 4, ArcaneShaping: 3, Stealth: 3, Brawling: 2 },
          defenses: { dodge: 'Coordination d12 + Vigor d4+1', will: 'Willpower d20 + Empathy d2', arcane: 'Attunement d20 + Intellect d4+1' },
          armor: 'Incorporeal shadow; ignores mundane physical damage until weakened by the seal, Holy Water, or the prayer scroll.',
          attacks: [
            { name: 'Shadow Claw', skill: 'Brawling', damage: '1d6 edged', note: 'Can inflict Bleeding Tier 1 only on margin 5+.' },
            { name: 'Dread Whisper', skill: 'Intimidation', damage: '2 Fatigue', note: 'Opposed by Willpower; failure applies frightened for 1 round.' }
          ],
          special: 'Counts as monstrous score 6 for Willpower and Attunement resistance. Bargains always carry a morality cost.',
          weaknesses: ['Holy Water', 'Creator\'s Binding Seal Tile', 'Binding Prayer Scroll', 'Aldric\'s restored oath.']
        }
      }
    ],
    items: [
      'Creator\'s Binding Seal Tile',
      'Demon-Cult Amulet',
      'Aldric\'s Signet Ring',
      '+1 Dagger (Voss Crest)',
      '+1 Shield (Voss Crest)',
      'Holy Water',
      'Silver Mirror',
      'Binding Prayer Scroll'
    ],
    itemsDetail: [
      { name: 'Creator\'s Binding Seal Tile', desc: 'A white stone tile veined with gold and old prayer-script, broken from the original prison seal.', properties: 'During the Malachar ritual, grants +1 to Lore, Divine Manifestation, or Arcane Drawing checks made to weaken or re-bind the demon. Outside that ritual it is evidence, not a general bonus item.' },
      { name: 'Demon-Cult Amulet', desc: 'A black iron amulet shaped like a hooked eye, warm whenever Malachar whispers.', properties: 'Grants +1 to Lore checks about Malachar or the cult, but each use may call for a Willpower resistance check. Keeping or using it in a bargain should carry morality loss and future corruption risk.' },
      { name: 'Aldric\'s Signet Ring', desc: 'A heavy silver signet bearing the Voss crest, found with old blood in the Lord\'s Study.', properties: 'Opens Voss crest mechanisms and grants a social advantage when appealing to Aldric. Can also prove rightful access to village elders.' },
      { name: '+1 Dagger (Voss Crest)', desc: 'A narrow ceremonial dagger with the Voss crest worked into the pommel.', properties: 'Counts as a +1 Light Weapon. Deals 1d4 edged or piercing damage and can strike some keep-bound spirits.' },
      { name: '+1 Shield (Voss Crest)', desc: 'A medium heater shield painted with a faded black falcon.', properties: 'Counts as a medium shield +1. Grants +1 to Blocking checks and soaks 1d6 + 1 on a successful block.' },
      { name: 'Holy Water', desc: 'A stoppered glass vial from the chapel font, still clear despite the dust.', properties: 'Harms demons, undead, incorporeal evil, and possessed targets. Against Aldric, who is not evil, it calms him briefly instead of dealing damage unless the player attacks again.' },
      { name: 'Silver Mirror', desc: 'A palm-sized mirror with a tarnished frame and a crack like a lightning fork.', properties: 'Reveals invisible shadows, possession marks, false reflections, and hidden writing tied to Malachar.' },
      { name: 'Binding Prayer Scroll', desc: 'A brittle chapel scroll written in a priest\'s cramped hand.', properties: 'One-use ritual aid. Reduces the final re-binding difficulty by one tier or grants +1 to a Divine Manifestation check against Malachar.' }
    ],
    settings: ['Ashveil Village Square', 'Yew Graveyard', 'Great Hall', 'Lord\'s Study', 'Chapel', 'Prison Sub-Level'],
    settingDescriptions: {
      'Ashveil Village Square': 'A shuttered village square of muddy lanes, locked doors, and watchful curtains. Martha begs for Oswin\'s return while Vance mutters about old Voss sins from the forge. Negotiation, Insight, or Intimidation can gather rumors about the keep, the goblins, and the two-day time pressure before the haunting worsens.',
      'Yew Graveyard': 'Ancient yews lean over cracked Voss tombs, their roots prying open old stone. A half-hidden grave passage offers an alternate entry, but restless dead and whispered prayers test Perception, Tracking, Lore, or Divine Communion.',
      'Great Hall': 'The keep\'s entry hall is collapsed into moonlit rubble, with torn banners, goblin barricades, arrow slits, and living shadows along the rafters. Broken tables provide cover, while the floor groans above the prison void.',
      'Lord\'s Study': 'A dust-choked room of blackwood shelves, rusted armor stands, and a locked writing desk. Aldric\'s ciphered records, the signet clue, and cult evidence reward Languages, Lore, Perception, or Lockpicking.',
      'Chapel': 'A small chapel split by roots and cold light, its altar still faintly holy. Holy Water, the Binding Prayer Scroll, and a silver mirror wait here, but touching the altar draws Malachar\'s whispers and a test of Willpower or Divine Manifestation.',
      'Prison Sub-Level': 'The final binding chamber lies beneath wet stone steps, where the missing children sleep inside chalk circles around the cracked seal. Aldric\'s ghost holds the line while Malachar presses against the dark; every failed ritual action risks Fatigue loss, fear, or the seal breaking wider.'
    },
    rewards: {
      heroic: [
        'All three children rescued and Malachar re-bound: moderate village gold reward, +10 morality, one Voss crest item, and a 10% discount on village goods with prices rounded up.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      vanquish: [
        'Malachar fully destroyed or banished: stronger holy reward such as a blessed charm that restores 1 Divine SP once per adventure, larger reputation reward, moderate village gold, and a 10% village discount with prices rounded up.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      dark: [
        'Bargain with Malachar or keep the cult amulet: demon-cult amulet power, forbidden arcane knowledge, low village gold, -10 morality, future complication, and a 15% village price increase with prices rounded up.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      partial: [
        'Partial rescue or flight: low gold, lingering haunting, fearful villagers, and survivor trauma hooks.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'saltblood_mines',
    name: 'The Saltblood Mines',
    desc: 'You have been captured and stripped of your gear. Wake up in a holding cage in the Saltblood Mines, where prisoners extract Redvein ore to refine into the drug Flare. You must locate Old Bram, uncover the possession vessel conspiracy, and find a way out.',
    element: 'earth',
    suggestedGm: 'titan',
    artwork: titanBanner,
    startingDay: 1,
    startingHour: 7.0, // 7:00 AM
    startingPrompt: 'You wake in captivity in a cold holding cage at the surface level of the Saltblood Mines. Your head throbs, and the bitter taste of Kessroot still lingers in your mouth. Through the iron bars, you see the stone-walled guard room where two guards are playing cards, oblivious to your awakening. You have no weapons or equipment. You must find a way to escape this place alive.',
    objectives: [
      'Escape the intake cage and survive without starting equipment.',
      'Recover confiscated gear from the Supply Depot.',
      'Locate Old Bram and learn what Redvein ore does to bodies and spirits.',
      'Obtain Threx\'s Ledger and Threx\'s Sealed Letter as evidence.',
      'Decide the fate of the prisoners, the mine, Threx, and the Flare supply.'
    ],
    backstory: 'The Saltblood Mines are known in tavern rumors as a place where debtors vanish, red dust stains the river, and rough men pay too much for silence. Travelers whisper that Redvein ore can be refined into Flare, a stimulant that lends desperate strength before burning out the body, but Old Bram has learned the uglier truth: the ore resonates with possessing spirits and can prepare prisoners as vessels. Threx runs the mine as a criminal enterprise on the surface and a demonic supply chain beneath it, hiding bribes, buyers, and possession rites behind ordinary smuggling ledgers. The player can hear fragments of this before capture through bar talk, passersby, and overheard caravan guards, but the full conspiracy only becomes clear inside the mine.',
    npcs: [
      {
        name: 'Sera',
        role: 'Former Guard Captain',
        desc: 'A captured guard captain nursing an injury, looking for a real escape plan.',
        stats: {
          HP: 11,
          attributes: { Power: 4, Coordination: 3, Vigor: 3, Willpower: 4, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 2 },
          skills: { Blocking: 3, HeavyWeapons: 3, Leadership: 3, Athletics: 2, Perception: 1 },
          defenses: { dodge: 'Coordination d8 + Vigor d4', block: 'Power d10 + Coordination d4 + 3d2' },
          armor: 'None until armed; can use medium guard armor from the Supply Depot.',
          attacks: [{ name: 'Recovered Guard Sword', skill: 'Heavy Weapons', damage: '1d8 edged', note: 'Only available after gear recovery.' }],
          equipment: ['Torn Guard Tabard', 'Hidden Lock Shim'],
          weaknesses: ['Cracked ribs; starts below maximum HP and suffers -1 to prolonged Athletics until treated.']
        }
      },
      {
        name: 'Old Bram',
        role: 'Scholar prisoner',
        desc: 'A scholar studying the redvein ore and its long-term effects.',
        stats: {
          HP: 8,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 4, Intellect: 5, Charisma: 2, Attunement: 3, Empathy: 3 },
          skills: { Lore: 4, Alchemy: 4, Languages: 3, Appraise: 2, Perception: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d10 + Empathy d4' },
          armor: 'None',
          attacks: [{ name: 'Improvised Pick', skill: 'Brawling', damage: '1d4 piercing', note: 'Last resort only.' }],
          equipment: ['Bram\'s Notebook', 'Redvein Sample Cloth'],
          weaknesses: ['Frail, coughing, and vulnerable to Flare fumes.']
        }
      },
      {
        name: 'Kael',
        role: 'Young Thief',
        desc: 'A street thief who knows the mine layout and patrol gaps.',
        stats: {
          HP: 12,
          attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 2, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 2 },
          skills: { Lockpicking: 3, Thievery: 3, Acrobatics: 2, Stealth: 3, LightWeapons: 1 },
          defenses: { dodge: 'Coordination d10 + Vigor d2+1 + 2d2', will: 'Willpower d6 + Empathy d2+1' },
          armor: 'None',
          attacks: [{ name: 'Shiv', skill: 'Light Weapons', damage: '1d4 edged', note: 'Can be replaced with a dagger from the depot.' }],
          equipment: ['Bone Shiv', 'Contraband Lockpicks'],
          weaknesses: ['Self-preserving; may flee if escape seems impossible.']
        }
      },
      {
        name: 'Mirra',
        role: 'Healer prisoner',
        desc: 'A village healer who helps the sick and injured in the barracks.',
        stats: {
          HP: 10,
          attributes: { Power: 1, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 4, Charisma: 2, Attunement: 1, Empathy: 4 },
          skills: { Healing: 4, Herbalism: 3, Insight: 3, DivineCommunion: 2, DivineManifestation: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d8 + Empathy d4+1' },
          armor: 'None',
          attacks: [{ name: 'Rusty Scalpel', skill: 'Light Weapons', damage: '1d4 edged', note: 'Used defensively.' }],
          equipment: ['Bandages (3)', 'Bitterroot Poultice'],
          weaknesses: ['Will risk herself for sick prisoners.']
        }
      },
      {
        name: 'Threx',
        role: 'Mine Boss',
        desc: 'A hard-eyed overseer using Redvein shipments and prisoners to serve a hidden possession network.',
        stats: {
          HP: 18,
          attributes: { Power: 3, Coordination: 3, Vigor: 4, Willpower: 3, Intellect: 3, Charisma: 4, Attunement: 2, Empathy: 1 },
          skills: { Intimidation: 3, Deception: 3, HeavyWeapons: 2, Blocking: 2, Leadership: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4+1', block: 'Power d8 + Coordination d4 + 2d2' },
          armor: 'Chain coat, medium armor soak 1d4',
          attacks: [{ name: 'Overseer Mace', skill: 'Heavy Weapons', damage: '1d6 blunt', note: 'Often fights behind guards.' }],
          equipment: ['Overseer Mace', 'Iron Shield', 'Office Key', 'Chain Coat'],
          weaknesses: ['Ledger evidence can break his authority; Redvein spirits may abandon him if the ore is purified.']
        }
      },
      {
        name: 'Saltblood Guard',
        role: 'Mine Guard',
        desc: 'A low-level armed guard paid to watch prisoners and ignore screams from below.',
        stats: {
          HP: 14,
          attributes: { Power: 3, Coordination: 2, Vigor: 2, Willpower: 2, Intellect: 1, Charisma: 2, Attunement: 1, Empathy: 1 },
          skills: { HeavyWeapons: 1, Blocking: 1, Intimidation: 1, Perception: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', block: 'Power d8 + Coordination d2+1 + 1d2' },
          armor: 'Leather jerkin, light armor soak 1d3',
          attacks: [{ name: 'Club or Spear', skill: 'Heavy Weapons', damage: '1d6 blunt or piercing', note: 'Use clubs for cage guards and spears for patrols.' }],
          equipment: ['Club', 'Spear', 'Leather Jerkin', 'Ring of Keys'],
          weaknesses: ['Poor morale and susceptible to Deception or bribery.']
        }
      },
      {
        name: 'Redvein-Possessed Prisoner',
        role: 'Possessed Victim',
        desc: 'A prisoner whose eyes glow red after too much ore exposure.',
        stats: {
          HP: 16,
          attributes: { Power: 4, Coordination: 2, Vigor: 4, Willpower: 2, Intellect: 1, Charisma: 1, Attunement: 3, Empathy: 1 },
          skills: { Brawling: 2, Athletics: 2, Intimidation: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d4+1', will: 'Willpower d6 + Empathy d2' },
          armor: 'None',
          attacks: [{ name: 'Ore-Maddened Grapple', skill: 'Brawling', damage: '1d6 blunt', note: 'May apply restrained on a high-margin hit.' }],
          special: 'Can be calmed or exorcised with Healing, Divine Manifestation, or use of Raw Redvein Ore as a sympathetic focus.',
          weaknesses: ['Anti-possession rites, clean water, and separation from Redvein dust.']
        }
      }
    ],
    items: [
      'Threx\'s Ledger',
      'Threx\'s Sealed Letter',
      'Flare Pouch',
      'Raw Redvein Ore',
      'Bram\'s Notebook'
    ],
    itemsDetail: [
      { name: 'Threx\'s Ledger', desc: 'A coded account book listing buyers, bribes, prisoner deaths, and late-night ore shipments.', properties: 'Primary evidence. Languages, Appraise, or Lore can decode names and payment routes for legal or political rewards.' },
      { name: 'Threx\'s Sealed Letter', desc: 'A wax-sealed letter bearing a red eye sigil and instructions for preparing viable vessels.', properties: 'Proof of the possession conspiracy. Lore or Languages can identify the demonic phrasing; breaking the seal early may alert Threx if discovered.' },
      { name: 'Flare Pouch', desc: 'A paper pouch of red powder refined from Redvein ore.', properties: 'Consumable stimulant. Restores 2 Fatigue or grants +1 to one Power, Vigor, or Coordination-based check, then costs 3 Fatigue afterward and may require a Willpower check to avoid craving or corruption.' },
      { name: 'Raw Redvein Ore', desc: 'A jagged red-black mineral that hums softly near possessed victims.', properties: 'Alchemy material and possession focus. Can disrupt possessing spirits during a ritual, but carrying it too long may provoke nightmares or Willpower checks.' },
      { name: 'Bram\'s Notebook', desc: 'A soot-stained notebook documenting Redvein exposure, Flare refinement, and safe disposal methods.', properties: 'Grants +1 to Alchemy or Lore checks involving Redvein, Flare, or possession vessels. Can guide destruction of the Processing Hall without killing prisoners.' }
    ],
    settings: ['Intake Cage', 'Prisoner Barracks', 'Processing Hall', 'Deep Redvein Vein', 'Threx\'s Office', 'Supply Depot'],
    settingDescriptions: {
      'Intake Cage': 'A cold cage beside a careless guard table, with bent bars, an old drain, loose stone, and a ring of keys just out of reach. Lockpicking, Escapology, Thievery, Deception, or Brawling can open the escape, but noise brings guards.',
      'Prisoner Barracks': 'A rank chamber of straw pallets, coughs, whispered factions, and exhaustion. Fatigue pressure is constant here; Mirra treats the sick, Sera tests escape plans, and Kael trades routes for promises.',
      'Processing Hall': 'Crushers, boilers, and red-stained sluices refine ore into Flare. Fumes sting the eyes, machinery can maim, and Crafting, Alchemy, Stealth, or Survival can expose sabotage routes.',
      'Deep Redvein Vein': 'A wet tunnel where red ore pulses like a buried heartbeat. Possession clues, cave-in sounds, and strange voices test Perception, Survival, Willpower, and Divine Manifestation.',
      'Threx\'s Office': 'A locked timber office above the refinery floor, packed with ledgers, sealed letters, payment chests, and an alarm bell. Lockpicking, Appraise, Languages, or Stealth can secure evidence before Threx arrives.',
      'Supply Depot': 'A guarded storehouse with confiscated player gear, low-level guard weapons, leather armor, rations, rope, lantern oil, bandages, and mining tools. Arming prisoners here can turn escape into liberation.'
    },
    rewards: {
      heroic: [
        'Liberate prisoners, expose Threx, and preserve evidence: prisoner allies, restored gear, morality gain, legal reward, and an extra skill point that must be spent on Healing or Leadership if either was meaningfully used.',
        'Gain 1 skill point for any skill used during the adventure.'
      ],
      evidenceOnly: [
        'Escape with ledger and letter but leave prisoners behind: legal or political reward, restored gear, lower morality gain, and ongoing prisoner danger.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      destroyOperation: [
        'Destroy the Flare operation safely: alchemical reward, an anti-possession charm, Redvein sample under Bram\'s warning, and regional reputation with healers or magistrates.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      dark: [
        'Use, sell, or conceal Flare: greater money or a dangerous power contact, morality loss, addiction or corruption hook, and hostile future consequences.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'obsidian_vault',
    name: 'The Obsidian Vault',
    desc: 'Delve into the volcanic depths of the Ignis Ridge, where an ancient obsidian vault houses a sleeping fire elemental threat. Ideal for bold warriors and fire-aligned heroes.',
    element: 'fire',
    suggestedGm: 'titan',
    artwork: titanBanner,
    startingDay: 1,
    startingHour: 13.0, // 1:00 PM
    startingPrompt: 'The volcanic air is thick with sulfur and ash as you stand before the towering obsidian gate of the Ignis Ridge. Magma flows like rivers of molten gold down the cliffside, illuminating ancient runes carved deep into the basalt rock. Your journey to retrieve the fire core begins now.',
    objectives: [
      'Enter the obsidian vault through the runed gatehouse.',
      'Survive heat, vents, unstable stone, and volcanic guardians.',
      'Reach the Altar of Ember and confront the sleeping fire elemental threat.',
      'Decide whether to retrieve, stabilize, destroy, leave, or forge with the Fire Core.'
    ],
    backstory: 'The Obsidian Vault was built by the first stonewrights of Ignis Ridge after they trapped a newborn fire elemental beneath the mountain and drew its heat into a Fire Core. The core made the ridge forges legendary, but it also kept the elemental asleep only as long as the altar remained balanced. Recent quakes cracked the basalt seals, causing vents to flare, wardens to wake, and old runes to glow like fresh coals. Lothar wants the vault stabilized before the ridge erupts, while Aria believes the core may be the only way to prevent a greater planar ignition.',
    npcs: [
      {
        name: 'Lothar the Smelter',
        role: 'Stonewright Blacksmith',
        desc: 'A gruff dwarf who knows the vault\'s layout and can forge heat-resistant clothing.',
        stats: {
          HP: 18,
          attributes: { Power: 4, Coordination: 2, Vigor: 4, Willpower: 3, Intellect: 3, Charisma: 2, Attunement: 1, Empathy: 2 },
          skills: { Smithing: 4, Blocking: 3, HeavyWeapons: 2, Crafting: 2, Appraise: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d4+1', block: 'Power d10 + Coordination d2+1 + 3d2' },
          armor: 'Reinforced leather apron, light armor soak 1d3',
          attacks: [{ name: 'Smith\'s Maul', skill: 'Heavy Weapons', damage: '1d10 blunt', note: 'Slow, brutal, and effective against stone armor.' }],
          equipment: ['Smith\'s Maul', 'Heat-Treated Apron', 'Forge Tools'],
          weaknesses: ['Will not abandon the ridge for profit; can be baited by threats to his forge crew.']
        }
      },
      {
        name: 'Aria the Flame-Speaker',
        role: 'Mage Scholar',
        desc: 'An expert in planar magic who can translate the runic console protecting the Core.',
        stats: {
          HP: 12,
          attributes: { Power: 1, Coordination: 2, Vigor: 2, Willpower: 4, Intellect: 5, Charisma: 3, Attunement: 4, Empathy: 2 },
          skills: { Lore: 4, Languages: 3, ArcaneDrawing: 3, ArcaneShaping: 2, Alchemy: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', arcane: 'Attunement d10 + Intellect d6' },
          armor: 'None',
          attacks: [{ name: 'Arcane Flame Lash', skill: 'Arcane Shaping', damage: 'S d6 blunt/fire', note: 'Requires Arcane SP and follows spellcasting rules.' }],
          equipment: ['Runic Chalk', 'Planar Lens', 'Water Flask'],
          weaknesses: ['Low physical defense and overconfidence around unstable runes.']
        }
      },
      {
        name: 'Volcanic Warden',
        role: 'Basalt Guardian',
        desc: 'A black stone sentinel whose joints glow with banked magma.',
        stats: {
          HP: 24,
          attributes: { Power: 5, Coordination: 2, Vigor: 5, Willpower: 3, Intellect: 1, Charisma: 1, Attunement: 3, Empathy: 1 },
          skills: { HeavyWeapons: 3, Blocking: 2, Athletics: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d6', block: 'Power d12 + Coordination d2+1 + 2d2' },
          armor: 'Basalt hide, heavy armor soak 1d6; vulnerable to blunt damage matrix effects.',
          attacks: [{ name: 'Basalt Fist', skill: 'Heavy Weapons', damage: '1d8 blunt', note: 'Can knock prone on a high-margin hit.' }],
          weaknesses: ['Cooling water, Smithing sabotage, and blunt weapons.']
        }
      },
      {
        name: 'Ember Maw',
        role: 'Sleeping Fire Elemental',
        desc: 'A half-awake elemental presence breathing through the altar vents.',
        stats: {
          HP: 42,
          attributes: { Power: 6, Coordination: 4, Vigor: 6, Willpower: 5, Intellect: 2, Charisma: 2, Attunement: 6, Empathy: 1 },
          skills: { Brawling: 4, Intimidation: 3, ArcaneShaping: 3, Athletics: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d10', arcane: 'Attunement d20 + Intellect d2+1' },
          armor: 'Elemental flame body; mundane edged weapons are poor unless cooled or warded first.',
          attacks: [
            { name: 'Magma Lash', skill: 'Brawling', damage: '1d8 blunt/fire', note: 'May ignite flammable gear.' },
            { name: 'Heat Bloom', skill: 'Arcane Shaping', damage: '2 Fatigue', note: 'Room hazard resisted by Vigor or Survival.' }
          ],
          weaknesses: ['Stabilized altar runes, cooling vents, water, and respectful containment rituals.']
        }
      }
    ],
    items: ['Fire Core', 'Flame-ward Shield', 'Basalt Warhammer'],
    itemsDetail: [
      { name: 'Fire Core', desc: 'A fist-sized crystal of molten orange light suspended inside black glass.', properties: 'Can restore 3 Arcane SP once if safely grounded, fuel a major crafting project, or wake Ember Maw if mishandled. Carrying it without protection may cause 1 Fatigue loss per scene from heat.' },
      { name: 'Flame-ward Shield', desc: 'A broad blackened steel shield etched with cooling runes.', properties: 'Counts as a medium shield +1 against fire, heat, and volcanic hazards. Grants +1 to Blocking checks and soaks 1d6 + 1 on a successful block; also grants +1 to Survival checks against volcanic heat.' },
      { name: 'Basalt Warhammer', desc: 'A dark stone warhammer balanced with a red iron core.', properties: 'Warhammer dealing 1d8 blunt damage. If forged with the Fire Core ending, it becomes Basalt Warhammer +1 and grants +1 to Heavy Weapons checks.' }
    ],
    settings: ['Basalt Ridge Gatehouse', 'Sulfuric Vents Chamber', 'Molten Lava Tube', 'Altar of Ember'],
    settingDescriptions: {
      'Basalt Ridge Gatehouse': 'A towering obsidian gate set into a cliff face, its runes visible through heat shimmer. Smithing, Lore, Languages, or Arcane Shaping can open the locks, but failed tampering wakes Volcanic Wardens.',
      'Sulfuric Vents Chamber': 'A low chamber of yellow crystals, timed steam bursts, and choking gas. Vigor, Survival, Crafting, or Smithing can predict or dampen the vents; lingering too long drains Fatigue.',
      'Molten Lava Tube': 'A narrow black-glass tunnel above a slow river of magma, with crumbling ledges and pockets of explosive gas. Athletics and Acrobatics keep footing, while Perception spots safer basalt ribs.',
      'Altar of Ember': 'A circular forge-temple around the Fire Core, with four cracked containment pillars and a breathing glow under the floor. The player can stabilize the altar, destroy the core, steal it, or use it in a forging rite as Ember Maw stirs.'
    },
    rewards: {
      stabilize: [
        'Stabilize the Fire Core: Flame-ward Shield, reputation with local smiths, a small Arcane SP recovery ember, and improved forge inventory in Ignis Ridge.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      destroy: [
        'Destroy the Fire Core and save the ridge from eruption: strong morality and reputation gain, no core artifact, and free heat-treated gear from Lothar.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      steal: [
        'Steal the Fire Core: gain a risky artifact that can restore 3 Arcane SP once per adventure when grounded, but suffer future elemental pursuit and morality risk.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      forge: [
        'Forge with the Fire Core: create Basalt Warhammer +1 or upgrade one armor item with heat resistance, requiring meaningful Smithing or Crafting success.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'sunken_spire',
    name: 'Whispers of the Sunken Spire',
    desc: 'Explore the flooded ruins of the Elven library towers in the Sunken Spire, collecting lost historical archives and planar scroll secrets. Ideal for scholars and water-aligned spellweavers.',
    element: 'water',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 8.0, // 8:00 AM
    startingPrompt: 'The rhythmic sound of waves lapping against mossy stone echoes through the damp corridors of the Sunken Spire. High-tide water reaches your shins, reflecting the ethereal blue light of glowing cave flora. Somewhere in these flooded elven library ruins lies the lost chronicle.',
    objectives: [
      'Enter the flooded ruin and manage the rising water.',
      'Drain, bypass, or survive the flooded library atrium.',
      'Decode the ancient elven scroll index.',
      'Avoid or disable the high-pressure tidal siphons.',
      'Recover, preserve, sell, or destroy the Lost Archive of planar static.'
    ],
    backstory: 'The Sunken Spire was once a chain of elven library towers built around a tidal observatory, where scholars mapped planar static by listening to the sea. A catastrophe cracked the lower foundations and drowned the archive in a single night, leaving Vaelin Deep-Eye bound to protect records no living scholar could reach. Now strange blue light pulses under the tide, Naelia and other scavengers have begun prying into the stacks, and the Lost Archive may contain the first written proof that planar static can be predicted rather than merely endured.',
    npcs: [
      {
        name: 'Vaelin Deep-Eye',
        role: 'Elven Archivist Ghost',
        desc: 'Haunts the library; will share ancient history if diplomacy/lore is checked.',
        stats: {
          HP: 20,
          attributes: { Power: 1, Coordination: 3, Vigor: 2, Willpower: 5, Intellect: 5, Charisma: 3, Attunement: 4, Empathy: 4 },
          skills: { Lore: 5, Languages: 4, Insight: 3, ArcaneDrawing: 2, Negotiation: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d2+1', will: 'Willpower d12 + Empathy d4+1' },
          armor: 'Incorporeal; immune to mundane damage unless planar static or oath-resolution conditions apply.',
          attacks: [{ name: 'Memory Flood', skill: 'Lore', damage: '2 Fatigue', note: 'Opposed by Willpower; failure causes disorientation.' }],
          weaknesses: ['Can be released by preserving the archive or proving the library will not be looted.']
        }
      },
      {
        name: 'Naelia the Diver',
        role: 'Scavenger Merchant',
        desc: 'Sells underwater breathing gear and draft maps of the flooded ruins.',
        stats: {
          HP: 14,
          attributes: { Power: 2, Coordination: 4, Vigor: 3, Willpower: 2, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 3 },
          skills: { Survival: 3, Athletics: 3, Appraise: 2, LightWeapons: 2, Negotiation: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d4 + 3d2', will: 'Willpower d6 + Empathy d4' },
          armor: 'Seal-hide diving vest, light armor soak 1d3',
          attacks: [{ name: 'Diver\'s Spear', skill: 'Light Weapons', damage: '1d6 piercing', note: 'Useful underwater and in narrow halls.' }],
          equipment: ['Diver\'s Spear', 'Draft Map', 'Water-Breathing Elixir'],
          weaknesses: ['Greedy but not cruel; proof of Vaelin\'s sentience can soften her.']
        }
      },
      {
        name: 'Drowned Guardian',
        role: 'Archive Warden',
        desc: 'A waterlogged elven guardian animated by duty and saltwater magic.',
        stats: {
          HP: 18,
          attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 4, Intellect: 2, Charisma: 1, Attunement: 3, Empathy: 1 },
          skills: { LightWeapons: 2, Blocking: 2, Athletics: 2, Perception: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4', block: 'Power d8 + Coordination d4 + 2d2' },
          armor: 'Corroded chain, medium armor soak 1d4',
          attacks: [{ name: 'Barnacled Spear', skill: 'Light Weapons', damage: '1d6 piercing', note: 'Can pin targets in shallow water on high margin.' }],
          weaknesses: ['Holy rites, Vaelin\'s command, and removing archive seals.']
        }
      }
    ],
    items: ['Lost Archive Scroll', 'Amulet of Tide-Taming', 'Water-Breathing Elixir'],
    itemsDetail: [
      { name: 'Lost Archive Scroll', desc: 'A waterproof scroll tube containing elven records on planar static cycles.', properties: 'Major lore reward. Grants campaign secrets and can justify a Lore or Languages skill point when those skills were used.' },
      { name: 'Amulet of Tide-Taming', desc: 'A blue-green shell amulet strung on silver wire.', properties: 'Grants +1 to Survival or Acrobatics checks in flooded environments. Once per adventure, can calm a local surge or open a tidal valve without a check.' },
      { name: 'Water-Breathing Elixir', desc: 'A cool glass vial smelling of mint, salt, and kelp.', properties: 'Consumable. Grants water breathing for one hour; does not restore Fatigue or SP.' }
    ],
    settings: ['Flooded Library Entrance', 'Hall of Forgotten Runes', 'Tidal Siphon Junction', 'Planar Archives Sanctuary'],
    settingDescriptions: {
      'Flooded Library Entrance': 'A broken tower foyer where water reaches the shins at low tide and the waist at high tide. Slippery steps, floating shelves, and hidden drop-offs test Survival, Acrobatics, and Perception.',
      'Hall of Forgotten Runes': 'A long hallway of blue-lit elven script, echoing memory voices, and murals of moons over tides. Lore, Languages, and Arcane Drawing reveal the scroll index; careless reading can trigger a psychic undertow.',
      'Tidal Siphon Junction': 'A machinery chamber of bronze valves, pressure bells, and violent water surges. Crafting, Smithing, Athletics, or Acrobatics can disable the siphons, but failures may cause Fatigue loss or forced movement.',
      'Planar Archives Sanctuary': 'A sealed archive dome where fragile scrolls float in air bubbles around a central static lens. Vaelin, Naelia, and the player\'s choices decide whether the archive is preserved, traded, or lost.'
    },
    rewards: {
      preserve: [
        'Preserve and return the archive: scholarly patronage, gold, access to elven records, and improved standing with historians.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      freeVaelin: [
        'Free Vaelin while preserving the library: Amulet of Tide-Taming or a ghostly blessing granting +1 to one future Lore or Languages check.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      sell: [
        'Sell the archive privately: higher immediate gold, reputation risk with scholars, and possible future black-market complication.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      destroyed: [
        'Let the archive be destroyed or abandon it: immediate escape, reduced reward, lost campaign lore, and Vaelin\'s unresolved haunting.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'astral_sky',
    name: 'Threads of the Astral Sky',
    desc: 'Embark on a floating voyage across the Windrunner Bridges, navigating high-altitude winds and gravity anomalies to trace the lines of destiny. Ideal for agile guides and air/aether weavers.',
    element: 'air',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 18.0, // 6:00 PM
    startingPrompt: 'You stand on a wooden suspension bridge suspended miles above the clouds, swaying gently in the roaring mountain wind. Ethereal sapphire ley lines twist through the sky like ribbons, crackling with planar static. Destiny calls you forward across the empty skies.',
    objectives: [
      'Cross the Windrunner Sky-Bridges without falling or losing the route.',
      'Realign gravity anchor dials across the floating isles.',
      'Defeat, disperse, or bargain past the vortex elementals blocking the path.',
      'Secure, stabilize, claim, or release the Focal Static Core at the summit altar.'
    ],
    backstory: 'The Windrunner Bridges were built by sky pilgrims who believed the world\'s choices could be read in aetheric threads above the clouds. Their gravity anchors once kept trade, prophecy, and pilgrimage routes stable, but the network has begun to drift as planar static snarls around the Focal Static Core. Zephyr knows the winds are wrong, Elder Oron believes destiny itself is being pulled off course, and the player must decide whether the core is a tool to stabilize the bridges, a prize to claim, or a living knot of fate that should be released.',
    npcs: [
      {
        name: 'Zephyr Gale-Rider',
        role: 'Cloud Skipper Captain',
        desc: 'Provides transport between floating bridges and knows cloud wind patterns.',
        stats: {
          HP: 15,
          attributes: { Power: 2, Coordination: 5, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 2, Empathy: 2 },
          skills: { Acrobatics: 4, Survival: 3, Marksmanship: 3, Leadership: 2, Perception: 2 },
          defenses: { dodge: 'Coordination d12 + Vigor d4 + 4d2', will: 'Willpower d8 + Empathy d2+1' },
          armor: 'Leather flight harness, light armor soak 1d3',
          attacks: [{ name: 'Sky Bow', skill: 'Marksmanship', damage: '1d6 piercing', note: 'Requires arrows; uses wind for trick shots.' }],
          equipment: ['Sky Bow', 'Arrows (12)', 'Flight Harness', 'Signal Flare'],
          weaknesses: ['Will not risk passengers for treasure; reckless maneuvers can shake his trust.']
        }
      },
      {
        name: 'Elder Oron',
        role: 'Aetherial Scholar',
        desc: 'Advises on planar gravity locks and alignment.',
        stats: {
          HP: 11,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 4, Intellect: 5, Charisma: 3, Attunement: 5, Empathy: 3 },
          skills: { Lore: 4, ArcaneDrawing: 4, ArcaneShaping: 3, Luck: 2, Languages: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', arcane: 'Attunement d12 + Intellect d6' },
          armor: 'None',
          attacks: [{ name: 'Aether Ward', skill: 'Arcane Shaping', damage: 'None', note: 'Uses Arcane SP to create wards or shove with wind-flavored force.' }],
          equipment: ['Astrolabe Beads', 'Aether Chalk', 'Old Bridge Map'],
          weaknesses: ['Physically frail and distracted by prophetic patterns.']
        }
      },
      {
        name: 'Vortex Elemental',
        role: 'Air Elemental',
        desc: 'A living spiral of cloud, static, and thrown bridge splinters.',
        stats: {
          HP: 26,
          attributes: { Power: 3, Coordination: 6, Vigor: 3, Willpower: 4, Intellect: 2, Charisma: 1, Attunement: 5, Empathy: 1 },
          skills: { Acrobatics: 4, Brawling: 3, ArcaneShaping: 3, Intimidation: 2 },
          defenses: { dodge: 'Coordination d20 + Vigor d4', arcane: 'Attunement d12 + Intellect d2+1' },
          armor: 'Air body; piercing weapons are unreliable unless grounded by gravity anchors.',
          attacks: [
            { name: 'Wind Shear', skill: 'Brawling', damage: '1d6 edged', note: 'Can push a target toward an edge on high margin.' },
            { name: 'Static Burst', skill: 'Arcane Shaping', damage: '2 Fatigue', note: 'Opposed by Vigor or Willpower depending on narration.' }
          ],
          weaknesses: ['Gravity anchor alignment, grounding rods, calm negotiation through Attunement or Luck.']
        }
      },
      {
        name: 'Gravity-Warped Guardian',
        role: 'Bridge Sentinel',
        desc: 'A broken pilgrim statue animated by inverted gravity and old vows.',
        stats: {
          HP: 22,
          attributes: { Power: 4, Coordination: 3, Vigor: 4, Willpower: 3, Intellect: 1, Charisma: 1, Attunement: 4, Empathy: 1 },
          skills: { HeavyWeapons: 2, Blocking: 2, Athletics: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4+1', block: 'Power d10 + Coordination d4 + 2d2' },
          armor: 'Stone shell, medium armor soak 1d4',
          attacks: [{ name: 'Stone Staff', skill: 'Heavy Weapons', damage: '1d6 blunt', note: 'May reverse footing on a high-margin hit.' }],
          weaknesses: ['Repaired anchor dials and fulfilled pilgrim vows.']
        }
      }
    ],
    items: ['Focal Static Core', 'Sky-Stalker Bow', 'Astral Gravity Compass'],
    itemsDetail: [
      { name: 'Focal Static Core', desc: 'A floating sapphire knot of light where several destiny threads cross.', properties: 'Can restore 3 Arcane SP once per adventure if stabilized, power a ward for one scene, or become a risky artifact that causes gravity anomalies when overused.' },
      { name: 'Sky-Stalker Bow', desc: 'A recurved bow of pale skywood with a string that hums in strong wind.', properties: 'Bow dealing 1d6 piercing damage. If claimed from the altar after stabilizing the core, counts as Sky-Stalker Bow +1 and grants +1 to Marksmanship checks. Still requires arrows.' },
      { name: 'Astral Gravity Compass', desc: 'A brass compass whose needle points toward the safest down.', properties: 'Grants +1 to Tracking, Survival, or Attunement checks involving gravity anomalies, floating routes, or unstable bridges.' }
    ],
    settings: ['Windrunner Sky-Bridges', 'Floating Leyline Isles', 'Gravity Siphon Spires', 'Astral Focal Altar'],
    settingDescriptions: {
      'Windrunner Sky-Bridges': 'Suspension bridges whip in high-altitude wind above a white cloud abyss. Acrobatics, Athletics, Survival, and Perception prevent falls, snapped lines, and lost footing.',
      'Floating Leyline Isles': 'Small stone islands drift through sapphire ley lines, static arcs, sky-metal fragments, and rare high-altitude herbs. Attunement, Perception, Herbalism, or Appraise can reveal useful resources.',
      'Gravity Siphon Spires': 'Three needle towers rotate around brass anchor dials, each reversing weight when misaligned. Arcane Drawing, Arcane Shaping, Crafting, or Luck can realign the spires without flinging travelers into the sky.',
      'Astral Focal Altar': 'A bare summit platform suspended over open air, where the Focal Static Core hangs between strands of light. Vortex elementals circle as the player chooses to stabilize, claim, or release the core.'
    },
    rewards: {
      stabilize: [
        'Stabilize the core: Astral Gravity Compass, bridge access, improved reputation with sky captains, and future safer travel across the Windrunner route.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      claim: [
        'Claim the core: powerful Arcane SP recovery artifact, future instability, and risk of destiny-thread complications.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      release: [
        'Release the core into the sky: spiritual reward, prophecy clue, possible one-use +1 Luck blessing, and gratitude from Elder Oron.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      fail: [
        'Fail to stabilize the anchors: reduced reward, damaged bridges, future travel penalties, and stranded sky pilgrims.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'clockwork_conservatory',
    name: 'The Clockwork Conservatory',
    desc: 'Investigate the steam-shrouded conservatory of the eccentric Baron von Rictor. Re-align the planetary astrolabe, bypass the rogue guardian Unit-7, and recover the Stabilized Chrono-Core before the boilers detonate.',
    element: 'earth',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 16.0, // 4:00 PM
    startingPrompt: 'The heavy brass door behind you locks with a resonant clank, sealing you inside the towering glass dome of Baron von Rictor\'s conservatory. Above, grey rain patters against cracked glass panes, casting distorted shadows on the ironwood trees and copper roses below. The air is thick with the scent of grease, hot steam, and ozone. In the center of the Brass Rotunda, a massive planetary astrolabe spins erratically, its copper arms casting shifting golden reflections. A crackling, mechanical voice broadcasts from a brass trumpet high on the wall: \'Intruder detected. Mainspring fracture imminent. Core stabilization required.\' To the north lies the Steam-Weaving Gallery, choked with high-pressure steam. To the east, the glass doors to the Clockwork Arboretum are sealed by a lock requiring three celestial gear keys. A small brass spider-automaton clicks nervously at your feet, its mechanical leg bent. How do you wish to proceed?',
    objectives: [
      'Re-align the planetary astrolabe in the Brass Rotunda to lower the steam pressure.',
      'Find the three celestial gear keys (Sun, Moon, and Star) hidden within the conservatory.',
      'Disable, repair, or bypass the rogue guardian automaton, Unit-7, in the Alchemical Lab.',
      'Retrieve the Stabilized Chrono-Core and install it in the central engine, use it, or steal it.',
      'Escape the conservatory before the boiler core suffers a catastrophic meltdown.'
    ],
    backstory: 'The glass-domed manor conservatory of Baron von Rictor, once a sanctuary of revolutionary alchemical botany and clockwork engineering, has fallen silent. The Baron sought to forge a mechanical heart to bypass his own failing mortality, but the installation split his consciousness through the building\'s brass intercom network and corrupted Unit-7\'s protective routines. A mechanical alarm now echoes through steam-filled chambers while the boilers near catastrophic meltdown. The player must re-align the stellar astrolabe, recover the celestial gear keys, decide the Baron\'s fate, and either stabilize or exploit the Chrono-Core.',
    npcs: [
      {
        name: 'Baron von Rictor',
        role: 'Fading Clocksmith',
        desc: 'His biological body lies comatose in the Chronos Vault. His consciousness is split, echoing through the brass intercom trumpets.',
        stats: {
          HP: 1,
          attributes: { Power: 1, Coordination: 1, Vigor: 1, Willpower: 5, Intellect: 5, Charisma: 3, Attunement: 4, Empathy: 2 },
          skills: { Crafting: 5, Smithing: 4, Alchemy: 3, Lore: 3, ArcaneDrawing: 2 },
          defenses: { will: 'Willpower d12 + Empathy d2+1', intellect: 'Intellect d12 + Attunement d4+1' },
          armor: 'Life-support vessel; body cannot move.',
          attacks: [],
          special: 'Can adjust steam valves, reveal gear-key routes, or unlock doors if reasoned with through the intercoms.',
          weaknesses: ['Separated from his body, guilt over Eleanor, and fear of death.']
        }
      },
      {
        name: 'Unit-7 (Nanny)',
        role: 'Rogue Guardian',
        desc: 'A nine-foot-tall, copper-plated automaton with four scissor-like arms. Its maternal protection subroutines have corrupted into a manic drive to disinfect and sanitize all organic matter.',
        stats: {
          HP: 35,
          attributes: { Power: 5, Coordination: 4, Vigor: 5, Willpower: 2, Intellect: 2, Charisma: 1, Attunement: 2, Empathy: 1 },
          skills: { LightWeapons: 3, Blocking: 2, Athletics: 2, Perception: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d6', block: 'Power d12 + Coordination d4+1 + 2d2' },
          armor: 'Copper plating, medium armor soak 1d4; acid can reduce or bypass plating for the scene.',
          attacks: [
            { name: 'Scissor Snip', skill: 'Light Weapons', damage: '1d6 edged', note: 'Bleeding only on margin 5+ per edged weapon rules.' },
            { name: 'Steam Vent Spray', skill: 'Hazard', damage: '3 fire/blunt', note: 'Close-range environmental spray; player may dodge with Acrobatics or reduce exposure with Vigor/Survival.' }
          ],
          equipment: ['Moon Gear Key'],
          weaknesses: ['Lightning, alchemical acid, oiling the gear pivots, or the shutdown phrase Aethelgard-9.']
        }
      },
      {
        name: 'Pip',
        role: 'Clockwork Helper',
        desc: 'A small, brass spider-automaton. One of its copper legs is missing. If repaired, it can fit into tiny floor-grates to unlock locked chests or distract guards.',
        stats: {
          HP: 4,
          attributes: { Power: 1, Coordination: 4, Vigor: 1, Willpower: 2, Intellect: 2, Charisma: 1, Attunement: 1, Empathy: 1 },
          skills: { Stealth: 3, Lockpicking: 3, Acrobatics: 2, Crafting: 1 },
          defenses: { dodge: 'Coordination d10 + Vigor d2 + 2d2' },
          armor: 'Tiny brass shell, light armor soak 1d3 only against small hazards.',
          attacks: [],
          special: 'Cannot attack directly. If repaired with the Tiny Copper Leg, grants helper access to vents, grates, lock mechanisms, and distractions.',
          weaknesses: ['Magnetized traps, crushing attacks, and missing leg until repaired.']
        }
      },
      {
        name: 'Eleanor\'s Hologram',
        role: 'Spectral Archivist',
        desc: 'A blue light projection activated by the primary astrolabe. She holds the override sequence to the Chronos Vault but requires proof that her husband\'s suffering will end.',
        stats: {
          HP: null,
          attributes: { Power: 0, Coordination: 0, Vigor: 0, Willpower: 4, Intellect: 5, Charisma: 4, Attunement: 4, Empathy: 4 },
          skills: { Insight: 4, Lore: 3, Negotiation: 3, Languages: 2 },
          defenses: { will: 'Willpower d10 + Empathy d4+1' },
          armor: 'Projection; immune to physical damage.',
          attacks: [],
          special: 'Can be disabled by smashing, covering, or redirecting the projecting lens. Can reveal the Chronos Vault override.',
          weaknesses: ['Proof of the Baron\'s suffering, Eleanor\'s keepsakes, and sincere mercy.']
        }
      }
    ],
    items: ['Sun Gear Key', 'Moon Gear Key', 'Star Gear Key', 'Aether-Wrench', 'Stabilized Chrono-Core', 'Von Rictor\'s Ledger', 'Tiny Copper Leg', 'Alchemical Acid Flask'],
    itemsDetail: [
      { name: 'Sun Gear Key', desc: 'A heavy golden-brass gear key engraved with solar rays. It is hot to the touch. Located in the Boiler Core Basement, held by a molten slag-heap.' },
      { name: 'Moon Gear Key', desc: 'A silver-plated crescent gear key. It emits a soft, cold light. Worn by Unit-7 as a brooch.' },
      { name: 'Star Gear Key', desc: 'A delicate, star-shaped brass gear key. It vibrates gently at a high frequency. Hidden inside the Queen Bee\'s hive in the Arboretum.' },
      { name: 'Aether-Wrench', desc: 'A specialized clocksmith\'s tool glowing with green light-emitting runes.', properties: 'Counts as a +1 Light Weapon, dealing 1d6 blunt as a mace-like tool. Grants +1 to Crafting or Smithing checks involving clockwork, steam valves, automata, or mechanical disassembly.' },
      { name: 'Stabilized Chrono-Core', desc: 'A humming sphere of tempered glass containing glowing blue sand.', properties: 'Can be installed in the central engine to stabilize the conservatory. If consumed as an emergency time reversal, restores 5 HP with a [heal] effect once, then becomes inert; it does not restore SP or Fatigue.' },
      { name: 'Von Rictor\'s Ledger', desc: 'A leather-bound notebook written in cipher.', properties: 'If translated with Languages or Intellect/Lore, reveals Unit-7\'s shut-down phrase, Aethelgard-9, and the planetary alignment code: Sun 45, Moon 90, Star 180.' },
      { name: 'Tiny Copper Leg', desc: 'A spare mechanical part found on a workbench in the Alchemical Lab.', properties: 'Can be installed on Pip with Crafting to recruit him as a helper.' },
      { name: 'Alchemical Acid Flask', desc: 'A flask of highly corrosive green fluid.', properties: 'One-use thrown weapon using Thrown Weapons. On hit, deals 1d4 acid damage and can reduce Unit-7\'s armor plating, dissolve rusted locks, or destroy a vulnerable mechanism.' }
    ],
    settings: ['The Brass Rotunda', 'The Steam-Weaving Gallery', 'The Clockwork Arboretum', 'The Alchemical Lab', 'The Chronos Vault', 'The Boiler Core Basement'],
    settingDescriptions: {
      'The Brass Rotunda': 'The main entrance of the conservatory. A massive, three-tiered copper astrolabe sits in the center, spinning erratically and locking the steam valves. Brass megaphone horns on the stone walls hiss with steam and echo the Baron\'s fading warnings. Locked iron gates block passage to the east.',
      'The Steam-Weaving Gallery': 'A long, claustrophobic stone corridor where steam pipes have ruptured. Blasts of scalding white steam vent in rhythmic intervals. Traversing without shutting the valves requires a Coordination, Acrobatics, Vigor, or heat-protection answer. A frozen clockwork watchman stands in the center, holding a key.',
      'The Clockwork Arboretum': 'Under a cracked glass dome, copper-leaved trees and mechanical brass roses bloom. Copper-winged mechanical bees buzz around brass hives, collecting mercury nectar. They are hostile to anyone harvesting the plants. The Star Gear Key is hidden inside the queen bee\'s hive.',
      'The Alchemical Lab': 'A cluttered workshop smelling of ozone, mercury, and sulfur. Beakers of green acid bubble on iron racks. Unit-7 patrols the room cleaning tables and attacking intruders. The Moon Gear Key is mounted on Unit-7\'s chest as a decorative brooch.',
      'The Chronos Vault': 'A heavy, airtight vault door leads here from the Rotunda. Inside, Baron von Rictor\'s comatose body is suspended in a glass chamber filled with life-sustaining fluid, wired into a massive brass engine. The engine core is fracturing, venting blue planar static. The Stabilized Chrono-Core hums in the center altar.',
      'The Boiler Core Basement': 'A red-hot basement chamber filled with roaring fire tubes and massive iron boilers. Pressure gauges are in the red zone. Ruptured valves leak boiling water. A manual emergency steam release wheel is jammed with a rusted iron bar.'
    },
    rewards: {
      saveBaron: [
        'Save the Baron and stabilize the conservatory: Aether-Wrench, modest gold, Pip as a clockwork ally if repaired, and improved access to clockwork crafting.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      mercifulEnd: [
        'End the Baron\'s suffering and prevent meltdown: Chrono-Core fragment, morality gain, Eleanor\'s gratitude, and a one-use +1 bonus to a future Crafting or Smithing check.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      stealCore: [
        'Steal the Chrono-Core: powerful emergency 5 HP time-heal, future instability, morality risk, and hostile clockwork echoes.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      fail: [
        'Fail or flee: conservatory explosion, reduced salvage, regional consequence, and no special clockwork ally.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'frostfire_crypt',
    name: 'The Frostfire Crypt',
    desc: 'Delve into the glacial tomb of Kaelen-Ghar, where an ancient warlord\'s frozen heart burns with blue frostfire. Re-ignite the twin thermal braziers, decipher the runic cryo-glyphs, and contain the awakening wraith before the glacial vault collapses.',
    element: 'water',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 9.0, // 9:00 AM
    startingPrompt: 'The heavy stone door of the tomb seals behind you with a grinding thud, shutting out the howling blizzard of the Frostglen Pass. Before you lies the Frostfire Crypt of Kaelen-Ghar. The walls are sheeted in thick blue glacial ice, reflecting the flickering light of two massive, unlit bronze braziers in the main vestibule. The air is so cold your breath freezes instantly into crystal mist, and a low, resonant humming vibrates through the stone floor. Written in ancient cryo-runes above the archway is a warning: \'Only the twin embers can melt the seal of the Warlord.\' To your left, a narrow stair slick with frost descends into the Sunken Reliquary, where ice-spiders nest. To your right, a passage lined with frozen statues leads to the Glyphed Catacombs. A dying explorer rests against the brazier, his fingers blackened by frostbite, clutching a broken flint. How do you wish to proceed?',
    objectives: [
      'Re-ignite the twin thermal braziers in the Vestibule to melt the main vault seal.',
      'Decipher the cryo-glyphs in the Catacombs to learn the containment ritual.',
      'Avoid or disable the crushing ice-trap pendulums in the Glacial Reach.',
      'Retrieve, destroy, contain, or claim the Frostfire Heart from Kaelen-Ghar\'s sarcophagus.',
      'Contain or defeat the awakening Frostfire Wraith before the tomb collapses.'
    ],
    backstory: 'The Frostfire Crypt was built three centuries ago to inter Kaelen-Ghar, a warlord who bound a fire elemental into a heart of glacial ice. This fusion created frostfire, a cold blue flame that burns without heat but freezes everything it touches. The containment runes have begun to crack due to the shifting glacier above. If the frostfire heart fully escapes its vessel, it will freeze the entire Frostglen valley into a permanent ice wasteland. The player must reseal the heart, destroy it, or face the warlord\'s wraith as the tomb breaks apart.',
    npcs: [
      {
        name: 'Theron the Scribe',
        role: 'Dying Explorer',
        desc: 'A scholar who led the expedition to the crypt. He is suffering from hypothermia and frostbite, and can provide a map if warmed or healed.',
        stats: {
          HP: 2,
          attributes: { Power: 1, Coordination: 1, Vigor: 1, Willpower: 3, Intellect: 4, Charisma: 2, Attunement: 2, Empathy: 3 },
          skills: { Lore: 3, Languages: 3, Survival: 1, Healing: 1, Perception: 1 },
          defenses: { dodge: 'Coordination d4 + Vigor d2', will: 'Willpower d8 + Empathy d4' },
          armor: 'None',
          attacks: [],
          special: 'Noncombatant. If warmed with Twin Embers or healed, gives Theron\'s Map and warning about the containment ritual.',
          weaknesses: ['Hypothermia, frostbite, and low HP.']
        }
      },
      {
        name: 'Kaelen-Ghar (Wraith)',
        role: 'Frostfire Warlord',
        desc: 'The spectral form of the warlord, wielding a frostfire glaive. He seeks to freeze his intruders and reclaim his corporeal form.',
        stats: {
          HP: 40,
          attributes: { Power: 5, Coordination: 4, Vigor: 4, Willpower: 6, Intellect: 3, Charisma: 4, Attunement: 6, Empathy: 1 },
          skills: { HeavyWeapons: 4, Intimidation: 4, Blocking: 3, ArcaneShaping: 2, Leadership: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d4+1', block: 'Power d12 + Coordination d4+1 + 3d2', will: 'Willpower d20 + Empathy d2' },
          armor: 'Incorporeal frostfire armor; mundane attacks are reduced unless braziers are lit or crystals are shattered.',
          attacks: [
            { name: 'Frostfire Glaive', skill: 'Heavy Weapons', damage: '1d10 edged or piercing', note: 'Applies Frozen on high-margin hit or failed Vigor resistance.' },
            { name: 'Freezing Howl', skill: 'Intimidation', damage: '2 Fatigue', note: 'Room-wide fear and cold effect opposed by Willpower or Vigor; failure may apply chilled or slowed for 1 round.' }
          ],
          special: 'Uses monstrous score 6 for Willpower and Attunement resistance. Undead and evil for Divine Smite purposes.',
          weaknesses: ['Open flame, lit braziers, shattering blue crystals, and correct containment rites.']
        }
      },
      {
        name: 'Frostbite Spiders',
        role: 'Glacial Predator Swarm',
        desc: 'Large, pale blue spiders that spit freezing venom.',
        stats: {
          HP: 18,
          attributes: { Power: 2, Coordination: 4, Vigor: 2, Willpower: 1, Intellect: 1, Charisma: 1, Attunement: 2, Empathy: 1 },
          skills: { Acrobatics: 3, Stealth: 3, Brawling: 2, Trapping: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d2+1 + 3d2', will: 'Willpower d4 + Empathy d2' },
          armor: 'Chitin, light armor soak 1d3',
          attacks: [{ name: 'Freezing Bite', skill: 'Brawling', damage: '1d4 piercing', note: 'One-use venom can apply Frozen if target fails Vigor resistance; bleeding only on extreme margin.' }],
          special: 'Represents a small swarm; reduce attacks when half HP is lost.',
          weaknesses: ['Torchlight, open flames, and heated braziers.']
        }
      },
      {
        name: 'The Guardian Golem',
        role: 'Clockwork Ice Warden',
        desc: 'A golem constructed of compacted ice and runic iron, protecting the reliquary keys.',
        stats: {
          HP: 25,
          attributes: { Power: 5, Coordination: 2, Vigor: 5, Willpower: 3, Intellect: 1, Charisma: 1, Attunement: 3, Empathy: 1 },
          skills: { HeavyWeapons: 3, Blocking: 2, Athletics: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d6', block: 'Power d12 + Coordination d2+1 + 2d2' },
          armor: 'Runic ice and iron shell, heavy armor soak 1d6; immune to poison and fear.',
          attacks: [{ name: 'Glacial Slam', skill: 'Heavy Weapons', damage: '1d8 blunt', note: 'May knock prone or pin a target against ice on high margin.' }],
          weaknesses: ['Alchemical acid, high heat, fire, and blunt damage against cracked joints.']
        }
      }
    ],
    items: ['Twin Embers Pouch', 'Frostfire Heart', 'Runic Ice-Chisel', 'Theron\'s Map', 'Freezing Venom Vial', 'Runic Tablet Translation'],
    itemsDetail: [
      { name: 'Twin Embers Pouch', desc: 'A pouch containing two glowing, heat-generating sulfurous charcoal blocks.', properties: 'Two uses. Each use can light a thermal brazier, warm Theron, or cancel one scene of severe cold/Fatigue pressure. Does not restore SP.' },
      { name: 'Frostfire Heart', desc: 'The legendary ice-encased heart of Kaelen-Ghar. It glows with a freezing blue light.', properties: 'If contained, becomes a sealed relic. If claimed, can add frostfire flavor to one Arcane attack per adventure or restore 3 Arcane SP once, but each use risks corruption or freezing backlash.' },
      { name: 'Runic Ice-Chisel', desc: 'A chisel made of reinforced steel, engraved with runes of shattering.', properties: 'Counts as a +1 Light Weapon dealing 1d4 piercing. Grants +1 to physical, Crafting, or Smithing checks to shatter ice walls, frost locks, or brittle runic mechanisms.' },
      { name: 'Theron\'s Map', desc: 'A damp parchment map of the crypt showing the hidden path to Kaelen-Ghar\'s sarcophagus and the trap switch locations.', properties: 'Grants +1 to Perception, Survival, or Trapping checks in the crypt.' },
      { name: 'Freezing Venom Vial', desc: 'A vial of venom harvested from the ice-spiders.', properties: 'One use. Applied to an edged or piercing weapon; on the next hit, the target must resist with Vigor or gain Frozen for 1 round.' },
      { name: 'Runic Tablet Translation', desc: 'A translation sheet containing the ancient cryo-runic alphabet.', properties: 'Grants +1 to Languages or Lore checks in the crypt and can bypass one glyph trap when used carefully.' }
    ],
    settings: ['The Runic Vestibule', 'The Sunken Reliquary', 'The Glyphed Catacombs', 'The Glacial Reach', 'The Sarcophagus Chamber', 'The Core Vault'],
    settingDescriptions: {
      'The Runic Vestibule': 'The entrance chamber featuring the twin thermal braziers, the massive sealed vault door, and the dying explorer Theron. Lighting both braziers suppresses cold penalties and weakens the wraith\'s seal.',
      'The Sunken Reliquary': 'A damp, frozen basement beneath the vestibule. Eerie blue light shines through the ice walls. Thick, frost-dusted spiderwebs hang from wooden ceiling beams. A stone chest sits in the center, guarded by Frostbite Spiders.',
      'The Glyphed Catacombs': 'A series of stone alcoves containing standing sarcophagi. The walls are carved with glowing blue glyphs that thrum with planar magic. Inspecting them without translation triggers a cold blast trap; Languages, Lore, or Trapping can make the route safe.',
      'The Glacial Reach': 'A narrow corridor where massive ice pendulums swing back and forth from the ceiling. The floor is covered in crushed bones and shattered ice plates. A lever to stop the pendulums is visible on the far side.',
      'The Sarcophagus Chamber': 'A vast dome of blue ice. In the center, Kaelen-Ghar\'s iron-banded sarcophagus rests on a raised altar. Four large frostfire crystals glow intensely, channeling cold energy into the warlord\'s sleeping wraith.',
      'The Core Vault': 'The heart of the tomb\'s magical containment. A circular pit in the floor contains a spinning iron gyro that holds the Frostfire Heart. If the gyro stops spinning, the cold energy explodes through the crypt.'
    },
    rewards: {
      contain: [
        'Contain the Heart: valley saved, Theron\'s patron reward, Runic Ice-Chisel or frost ward, and strong reputation with Frostglen scholars.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      destroy: [
        'Destroy the Heart: no frostfire artifact, but high morality and reputation reward, undead threat ended, and Frostglen valley spared.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      claim: [
        'Claim the Heart: powerful frostfire relic that can restore 3 Arcane SP once per adventure or empower one Arcane attack, with corruption and freezing backlash risk.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      fail: [
        'Fail or flee: crypt collapses, reduced loot, spreading frostfire consequence, and danger to Frostglen valley.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  }
];
