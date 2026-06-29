import oracleBanner from '../assets/images/oracle.png';
import titanBanner from '../assets/images/titan.png';
import ancientBanner from '../assets/images/ancient.png';
import { ADVENTURE_SETTING_METADATA } from './adventureEnhancements';

const BASE_ADVENTURES_LIST = [
  {
    id: 'elemental_crucible',
    name: 'The Elemental Crucible',
    desc: 'Enter an ancient fivefold shrine where air, earth, fire, water, and aether test the soul. Complete the crucible to awaken a once-per-rest elemental ability tied to your character\'s affinity.',
    element: 'aether',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 12.0,
    startingPrompt: 'At noon, five beams of colored light rise from a ruined hill shrine: red flame, green stone, white wind, blue water, and violet aether. The air tastes like rain on hot iron. In the center waits a circular door with five empty handprints, each shaped for a different element. A voice from nowhere says, "Power is not given. It is answered." Ask the player which shrine they approach first, and remind them that their own elemental affinity may shape the final awakening.',
    objectives: [
      'Enter the ruined fivefold shrine and learn the rules of the Elemental Crucible.',
      'Complete at least three elemental trials, with optional mastery of all five.',
      'Resolve the fracture between the shrine guardians without letting one element dominate the others.',
      'Face the final Mirror of Affinity and choose whether to awaken power, share it, bind it, or steal more than one element.',
      'Unlock the character\'s elemental affinity ability with [elemental_ability_unlock: element] if the awakening is earned.'
    ],
    backstory: 'The Elemental Crucible was built before the modern kingdoms, when elemental affinity was treated as a responsibility rather than a birthmark. Young heroes came here to prove they could use power without becoming its servant. The shrine failed when five champions tried to seize every element at once, cracking the central font and leaving each guardian convinced its own element must lead. Now the crucible has awakened again because planar static is rising across the realm. The player can earn a personal awakening, reconcile the guardians, distribute the power to others, or risk becoming a vessel for more power than one soul can hold.',
    playabilityGuidance: 'Run this as a flexible trial adventure rather than a linear dungeon. Each shrine should spotlight different skills so any character build can contribute: Fire rewards courage and action, Earth rewards endurance and protection, Air rewards movement and perception, Water rewards compassion and adaptation, and Aether rewards insight and restraint. Let clever non-combat solutions count. The final unlock should match the player character\'s chosen element, not the order of shrines completed.',
    elementalAbilities: {
      fire: {
        name: 'Cinderbreath',
        properties: 'Once between rests, as one action, unleash a close cone of flame. The GM should resolve it as a Moderate Attunement or Arcane Shaping check against nearby foes; on success, deal 2d6 fire/blunt raw damage split among close enemies or ignite a major hazard. Output [elemental_ability_used].'
      },
      earth: {
        name: 'Stone Mantle',
        properties: 'Once between rests, as one action, turn skin to living stone for 3 rounds. The GM should apply a defensive status and reduce incoming physical damage by +1d6 soak while active, stacking with armor. Output [status: player stone_mantle 3] and [elemental_ability_used].'
      },
      air: {
        name: 'Gale Flash',
        properties: 'Once between rests, as one action, burst into a blinding spiral of dust, light, and wind. One visible foe must resist with Perception, Willpower, or Vigor; on failure, they are blinded or disoriented for 2 rounds and suffer disadvantage-like narration on attacks. Output [elemental_ability_used].'
      },
      water: {
        name: 'Tide Mend',
        properties: 'Once between rests, as one action, draw cooling water through the body. Restore 1d6+2 HP, stop Bleeding Tier 1 or 2, or cleanse one poison/fatigue condition at GM discretion. Use [heal: X] for HP restored and output [elemental_ability_used].'
      },
      aether: {
        name: 'Threadstep',
        properties: 'Once between rests, as one action, slip along a visible aether thread to a nearby location, escape a restraint, or turn one failed non-damage check into a narrow success with a strange complication. Output [elemental_ability_used].'
      }
    },
    npcs: [
      {
        name: 'Ilyra of the Fivefold Font',
        role: 'Crucible Keeper',
        desc: 'A calm spectral guide who explains that elemental power must be answered with character, not appetite.',
        stats: {
          HP: null,
          attributes: { Power: 1, Coordination: 4, Vigor: 3, Willpower: 6, Intellect: 5, Charisma: 4, Attunement: 6, Empathy: 5 },
          skills: { Lore: 5, Insight: 4, ArcaneDrawing: 4, DivineCommunion: 3, Negotiation: 3 },
          defenses: { will: 'Willpower d20 + Empathy d6', arcane: 'Attunement d20 + Intellect d6' },
          armor: 'Spectral guide; cannot be harmed unless the font is corrupted.',
          attacks: [],
          special: 'Can clarify trial stakes, but refuses to solve trials. If the player tries to steal all elements, she becomes the final judge.',
          weaknesses: ['Honest humility, restored balance, and proof that the player will not hoard power.']
        }
      },
      {
        name: 'The Cinder Stag',
        role: 'Fire Trial Guardian',
        desc: 'A burning antlered spirit that tests courage, restraint, and destructive temptation.',
        stats: {
          HP: 24,
          attributes: { Power: 5, Coordination: 4, Vigor: 4, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 5, Empathy: 1 },
          skills: { Athletics: 3, Intimidation: 3, Brawling: 3, ArcaneShaping: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d4+1', arcane: 'Attunement d12 + Intellect d2+1' },
          armor: 'Flame hide, light armor soak 1d3; water or calm ritual reduces its heat.',
          attacks: [{ name: 'Antler Rush', skill: 'Brawling', damage: '1d8 blunt/fire', note: 'May ignite flammable ground on high margin.' }],
          weaknesses: ['Water, patience, and refusing needless destruction.']
        }
      },
      {
        name: 'The Granite Matron',
        role: 'Earth Trial Guardian',
        desc: 'A stone giantess who asks what the player will carry and whom they will shield.',
        stats: {
          HP: 34,
          attributes: { Power: 6, Coordination: 2, Vigor: 6, Willpower: 4, Intellect: 3, Charisma: 2, Attunement: 2, Empathy: 3 },
          skills: { Athletics: 4, Blocking: 4, Smithing: 2, Survival: 2, Insight: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d10', block: 'Power d20 + Coordination d2+1 + 4d2' },
          armor: 'Stone body, heavy armor soak 1d6',
          attacks: [{ name: 'Stone Palm', skill: 'Brawling', damage: '1d8 blunt', note: 'Can knock prone but often tests instead of killing.' }],
          weaknesses: ['Promises kept under burden, clever leverage, and protecting someone weaker.']
        }
      },
      {
        name: 'The Mirror of Affinity',
        role: 'Final Trial',
        desc: 'A faceless reflection of the player, carrying their chosen element and their worst reason for wanting power.',
        stats: {
          HP: 30,
          attributes: { Power: 4, Coordination: 4, Vigor: 4, Willpower: 5, Intellect: 4, Charisma: 4, Attunement: 5, Empathy: 3 },
          skills: { Insight: 4, Deception: 3, ArcaneShaping: 3, DivineManifestation: 3, LightWeapons: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d4+1', will: 'Willpower d12 + Empathy d4', arcane: 'Attunement d12 + Intellect d4+1' },
          armor: 'Elemental reflection, medium armor soak 1d4',
          attacks: [{ name: 'Reflected Element', skill: 'Arcane Shaping', damage: '1d8 elemental', note: 'Flavor matches the player\'s affinity; it tests motive more than damage.' }],
          weaknesses: ['Self-knowledge, accepting limits, and using a non-dominant virtue to answer the trial.']
        }
      }
    ],
    items: ['Fivefold Keystone', 'Cinder Antler Shard', 'Granite Heart Pebble', 'Aether Thread Spindle', 'Elemental Awakening Mark'],
    itemsDetail: [
      { name: 'Fivefold Keystone', desc: 'A palm-sized stone divided into five colored wedges.', properties: 'Opens the central font after three shrine trials. Grants +1 to Lore or Arcane Drawing checks involving elemental balance.' },
      { name: 'Cinder Antler Shard', desc: 'A warm red sliver from the Cinder Stag\'s antler.', properties: 'One use. Adds fire flavor to a weapon strike or restores 2 Fatigue when crushed near a flame.' },
      { name: 'Granite Heart Pebble', desc: 'A smooth stone that grows heavier when someone nearby is in danger.', properties: 'Once per adventure, grants +1 to Blocking, Athletics, or Survival when protecting another character.' },
      { name: 'Aether Thread Spindle', desc: 'A little violet spindle wound with light only visible from the corner of the eye.', properties: 'Once per adventure, grants +1 to Luck, Arcane Drawing, or Perception involving hidden paths or timing.' },
      { name: 'Elemental Awakening Mark', desc: 'A permanent mark of the character\'s affinity, visible as heat, stone-vein, wind, tide, or violet starlight under the skin.', properties: 'Represents the unlocked once-between-rests elemental ability. The GM should award it with [elemental_ability_unlock: element].' }
    ],
    settings: ['Fivefold Gate', 'Cinder Trial Grove', 'Granite Burden Hall', 'Skyblind Walk', 'Tide Memory Pool', 'Aether Thread Nave', 'Mirror of Affinity'],
    settingDescriptions: {
      'Fivefold Gate': 'A circular ruin with five empty handprints and a sealed central font. Lore, Arcane Drawing, or Divine Communion explains that three trials open the final mirror, while five trials improve the reward and reputation.',
      'Cinder Trial Grove': 'A blackened grove where fire spreads toward trapped seed pods. The player can outrun, control, redirect, or refuse the blaze through Athletics, Survival, Arcane Shaping, or empathy for living things.',
      'Granite Burden Hall': 'A stone hall of weighted doors, collapsing pillars, and silent statues. Athletics, Blocking, Smithing, Leadership, or clever teamwork can carry the burden without brute force.',
      'Skyblind Walk': 'A narrow bridge over clouded emptiness while wind and dust erase sight. Acrobatics, Perception, Luck, or trust in an NPC voice can cross safely.',
      'Tide Memory Pool': 'A blue pool showing people the player failed, helped, or ignored. Healing, Insight, Empathy, Divine Communion, or honest confession can turn memory into renewal.',
      'Aether Thread Nave': 'A violet-lit nave where possible paths overlap. Arcane Drawing, Lore, Luck, or restraint can follow the right thread without tearing others.',
      'Mirror of Affinity': 'The central final chamber reflects the player as they might become if power outruns wisdom. The mirror can be defeated, reconciled, bargained with, or cracked for a darker reward.'
    },
    rewards: {
      awakened: [
        'Complete the crucible with balance: unlock the ability matching the character\'s affinity with [elemental_ability_unlock: element], gain the Elemental Awakening Mark, +10 morality, and one keepsake from a completed shrine.',
        'Gain 1 skill point for a skill used during the adventure; if all five shrines were completed, gain a second restricted point in Lore, Insight, Arcane Drawing, Divine Communion, or a shrine-defining skill.'
      ],
      sharedPower: [
        'Share the font with allies, villagers, or shrine guardians: unlock the character\'s affinity ability, gain strong reputation and morality, but receive less treasure.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      boundPower: [
        'Bind the font to prevent misuse: no extra shrine keepsake, but unlock the character\'s affinity ability safely and gain Ilyra as a future spiritual contact.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      stolenPower: [
        'Try to steal more than one element: unlock the character\'s affinity ability plus a volatile extra keepsake, but suffer morality loss, a future elemental consequence, and possible Fatigue backlash.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
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
  },
  {
    id: 'iron_colosseum',
    name: 'Chains of the Iron Colosseum',
    desc: 'Captured and sold into the Iron Colosseum, you must survive brutal arena matches, uncover the politics behind the games, and either escape bondage or win freedom before the final spectacle.',
    element: 'fire',
    suggestedGm: 'titan',
    artwork: titanBanner,
    startingDay: 1,
    startingHour: 10.0, // 10:00 AM
    startingPrompt: 'You wake beneath the Iron Colosseum with iron manacles on your wrists, sand in your mouth, and the roar of a crowd shaking dust from the ceiling. Around you, prisoners sharpen scrap blades, beasts snarl behind bronze gates, and an arena herald announces that today\'s blood will please the city. Your gear is gone. A scarred trainer named Cassia watches you from the torchlight and says freedom can be won, stolen, or bought with someone else\'s death. Ask the player what they do before the first match begins.',
    objectives: [
      'Survive the opening arena match with improvised or issued equipment.',
      'Learn the colosseum layout, guard routines, and patron politics.',
      'Choose a path to freedom: win the tournament, lead a revolt, escape through the underworks, or accept a corrupt patron.',
      'Recover personal gear from the armory or win equivalent arena equipment.',
      'Resolve the fate of the other prisoners before the final spectacle.'
    ],
    backstory: 'The Iron Colosseum began as a civic monument to martial excellence, but generations of debt, bribery, and spectacle have made it a slave engine disguised as sport. Debt prisoners, captured travelers, beasts, condemned soldiers, and political embarrassments are fed into the sand while nobles gamble from red awnings above. Cassia, once champion and now trainer, knows the arena masters keep records of illegal slave purchases beneath the champion dais. The player can gain freedom through glory, conspiracy, revolt, or ruthless patronage, but every path demands a public answer to what survival is worth.',
    npcs: [
      {
        name: 'Cassia Redhand',
        role: 'Arena Trainer',
        desc: 'A former champion with a ruined sword arm who teaches prisoners how to stay alive.',
        stats: {
          HP: 16,
          attributes: { Power: 3, Coordination: 4, Vigor: 3, Willpower: 4, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 3 },
          skills: { LightWeapons: 4, Blocking: 3, Leadership: 3, Insight: 2, Healing: 1 },
          defenses: { dodge: 'Coordination d10 + Vigor d4 + 3d2', block: 'Power d8 + Coordination d4+1 + 3d2' },
          armor: 'Worn leather armor, light armor soak 1d3',
          attacks: [{ name: 'Practice Blade', skill: 'Light Weapons', damage: '1d6 edged', note: 'Fights only to protect prisoners or test resolve.' }],
          equipment: ['Practice Blade', 'Arena Key Token', 'Bandages (2)'],
          weaknesses: ['Old injury in sword arm; will risk everything for a prisoner who shows mercy.']
        }
      },
      {
        name: 'Varro Cindergold',
        role: 'Arena Master',
        desc: 'A smiling master of ceremonies who treats blood, debt, and reputation as the same currency.',
        stats: {
          HP: 14,
          attributes: { Power: 2, Coordination: 3, Vigor: 2, Willpower: 4, Intellect: 4, Charisma: 5, Attunement: 1, Empathy: 1 },
          skills: { Deception: 4, Negotiation: 4, Performance: 4, Intimidation: 2, Appraise: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d2+1', will: 'Willpower d10 + Empathy d2' },
          armor: 'Fine clothes with hidden mail, light armor soak 1d3',
          attacks: [{ name: 'Poisoned Stiletto', skill: 'Light Weapons', damage: '1d4 piercing', note: 'Uses assassins and guards before fighting directly.' }],
          equipment: ['Poisoned Stiletto', 'Ledger of Illegal Sales', 'Gold Signet'],
          weaknesses: ['Public scandal, exposed ledgers, and loss of noble confidence.']
        }
      },
      {
        name: 'Durn Ashjaw',
        role: 'Arena Champion',
        desc: 'A towering gladiator who has won freedom twice and sold it back for fame.',
        stats: {
          HP: 24,
          attributes: { Power: 5, Coordination: 3, Vigor: 5, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 1 },
          skills: { HeavyWeapons: 4, Blocking: 3, Intimidation: 3, Athletics: 3, Performance: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d6', block: 'Power d12 + Coordination d4 + 3d2' },
          armor: 'Arena plate, heavy armor soak 1d6',
          attacks: [{ name: 'Champion Maul', skill: 'Heavy Weapons', damage: '1d10 blunt', note: 'Knocks targets prone on high-margin hits.' }],
          equipment: ['Champion Maul', 'Arena Plate', 'Champion Laurel'],
          weaknesses: ['Pride, crowd manipulation, and blunt memories of the family he abandoned.']
        }
      },
      {
        name: 'Mira of the Underworks',
        role: 'Prisoner Smuggler',
        desc: 'A quick-handed prisoner who knows the drain tunnels beneath the beast pens.',
        stats: {
          HP: 11,
          attributes: { Power: 1, Coordination: 5, Vigor: 2, Willpower: 3, Intellect: 3, Charisma: 3, Attunement: 1, Empathy: 2 },
          skills: { Stealth: 4, Lockpicking: 3, Escapology: 3, Thievery: 3, Acrobatics: 2 },
          defenses: { dodge: 'Coordination d12 + Vigor d2+1 + 2d2', will: 'Willpower d8 + Empathy d2+1' },
          armor: 'None',
          attacks: [{ name: 'Hidden Shiv', skill: 'Light Weapons', damage: '1d4 edged', note: 'Prefers escape over combat.' }],
          equipment: ['Hidden Shiv', 'Bent Lockpick', 'Drain Map'],
          weaknesses: ['Will betray a plan that ignores children and elderly prisoners.']
        }
      }
    ],
    items: ['Arena Champion Laurel', 'Gladiator Net', 'Ledger of Illegal Sales', 'Underworks Key', 'Champion Maul +1'],
    itemsDetail: [
      { name: 'Arena Champion Laurel', desc: 'A bronze-and-red laurel awarded before the crowd.', properties: 'Proof of legal arena victory. Grants social leverage in the city and +1 to Performance checks involving arena fame.' },
      { name: 'Gladiator Net', desc: 'A weighted fighting net used to entangle opponents on the sand.', properties: 'Can be used with Thrown Weapons or Trapping to restrain a target for 1 round on a successful opposed check.' },
      { name: 'Ledger of Illegal Sales', desc: 'Varro\'s hidden record of unlawful enslavements, bribes, and noble buyers.', properties: 'Evidence item. Grants leverage with magistrates and can turn the crowd or city watch against Varro.' },
      { name: 'Underworks Key', desc: 'A rusted iron key stamped with a beast-gate number.', properties: 'Opens drain tunnels, beast pens, and one armory side door. Grants a major advantage to escape plans.' },
      { name: 'Champion Maul +1', desc: 'Durn Ashjaw\'s black iron maul, etched with victory marks.', properties: 'Counts as a +1 Heavy Weapon. Deals 1d10 blunt damage and grants +1 to Heavy Weapons checks.' }
    ],
    settings: ['Slave Pens', 'Training Sand', 'Beast Gate Underworks', 'Noble Gallery', 'Champion Dais'],
    settingDescriptions: {
      'Slave Pens': 'A torchlit holding level of locked cells, straw pallets, manacles, whispered alliances, and guards playing dice. Escapology, Lockpicking, Deception, or Leadership can start a plan before the arena schedule advances.',
      'Training Sand': 'A smaller practice arena where prisoners spar for food, favor, and survival. Brawling, Blocking, Light Weapons, Performance, or Healing can earn allies and keep wounds from becoming fatal.',
      'Beast Gate Underworks': 'Drain tunnels, winch rooms, chained beasts, and narrow service doors beneath the arena floor. Stealth, Animal Rapport, Thievery, or Trapping can open an escape route or turn beasts against guards.',
      'Noble Gallery': 'A red-awning balcony of gamblers, sponsors, poisoners, and spies. Insight, Negotiation, Deception, Appraise, or Performance can win patronage or expose corruption.',
      'Champion Dais': 'The final raised platform where Varro keeps his ledgers beneath the champion throne. The crowd can be swayed, the champion challenged, or the whole colosseum thrown into revolt.'
    },
    rewards: {
      winFreedom: [
        'Win the tournament and earn legal freedom: Champion Maul +1 or a chosen arena weapon +1, moderate gold, arena fame, and morality gain if defeated foes were spared.',
        'Gain 1 skill point for a skill used during the adventure; gain a second restricted point in Heavy Weapons, Light Weapons, Blocking, Brawling, or Performance for an exceptional final match.'
      ],
      revolt: [
        'Lead a slave revolt: prisoner ally network, high morality gain, Varro\'s exposed ledger, and modest treasure from liberated supplies.',
        'Gain 1 skill point for a skill used during the adventure; gain a second restricted point in Leadership, Healing, Intimidation, or Negotiation if those drove the revolt.'
      ],
      escape: [
        'Escape through the underworks: recovered gear, Underworks Key, small treasure cache, and reduced public reputation.',
        'Gain 1 skill point for a skill used during the adventure, especially Stealth, Lockpicking, Escapology, Acrobatics, or Thievery.'
      ],
      patron: [
        'Accept corrupt patronage and become champion property in silk chains: high gold, fame, noble contact, morality loss, and future political obligations.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'blackroot_hollow',
    name: 'The Webbed Cavern of Blackroot Hollow',
    desc: 'Clear or resolve a giant spider infestation beneath Blackroot Hollow, where livestock, miners, and children vanish into old root-choked tunnels.',
    element: 'earth',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 6.5, // 6:30 AM
    startingPrompt: 'Morning fog clings to Blackroot Hollow as villagers gather beside a goat pen wrapped in rope-thick webbing. A mine cart lies overturned near the forest line, its wheels still spinning in the mud. Old Mara the beekeeper points to drag marks leading toward the black roots under the hill and says something larger than a wolf took the last child. The webbed cavern waits in the dim green woods. Ask the player how they begin the hunt.',
    objectives: [
      'Track the spider trails from village, mine, or forest edge.',
      'Enter the old root cavern and locate missing villagers.',
      'Decide whether to purge, relocate, harvest, or seal the spider brood.',
      'Discover what drove the spiders upward from the deeper caves.',
      'Return with proof, survivors, or a lasting solution for Blackroot Hollow.'
    ],
    backstory: 'Blackroot Hollow has always lived beside old caves, but the spiders beneath the hill were once shy things that fed on blind fish and deep beetles. Something in the lower dark has driven the brood upward, making them large, hungry, and desperate enough to web livestock pens and mine shafts. The villagers want fire and steel, the apothecary wants venom, and Old Mara suspects the spider queen is guarding eggs from a deeper predator. The player can turn the cavern into a battlefield, a bargain, a harvest site, or a sealed wound in the countryside.',
    npcs: [
      {
        name: 'Old Mara',
        role: 'Beekeeper Witness',
        desc: 'A sharp-eyed elder who understands swarms, stings, and frightened animals.',
        stats: {
          HP: 10,
          attributes: { Power: 1, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 3, Charisma: 2, Attunement: 1, Empathy: 4 },
          skills: { AnimalRapport: 3, Herbalism: 3, Survival: 2, Perception: 2, Insight: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d8 + Empathy d4+1' },
          armor: 'None',
          attacks: [{ name: 'Bee Smoker', skill: 'Alchemy', damage: 'None', note: 'Can calm or repel small swarms when prepared.' }],
          equipment: ['Bee Smoker', 'Honey Poultice', 'Waxed Lantern'],
          weaknesses: ['Too old for deep climbing and protective of village children.']
        }
      },
      {
        name: 'Mother Silken',
        role: 'Giant Spider Queen',
        desc: 'An intelligent, wounded queen guarding a brood of pale egg sacs.',
        stats: {
          HP: 34,
          attributes: { Power: 5, Coordination: 4, Vigor: 5, Willpower: 3, Intellect: 2, Charisma: 1, Attunement: 2, Empathy: 2 },
          skills: { Stealth: 4, Trapping: 4, Brawling: 3, Acrobatics: 3, Survival: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d6 + 3d2', will: 'Willpower d8 + Empathy d2+1' },
          armor: 'Thick chitin, medium armor soak 1d4',
          attacks: [
            { name: 'Venom Bite', skill: 'Brawling', damage: '1d6 piercing', note: 'Failed Vigor resistance applies weakened or poisoned for 1 scene.' },
            { name: 'Web Snare', skill: 'Trapping', damage: 'None', note: 'Restrains on success until cut or escaped.' }
          ],
          weaknesses: ['Open flame, smoke, egg threats, and Animal Rapport backed by mercy.']
        }
      },
      {
        name: 'Deep Molt Horror',
        role: 'Cavern Predator',
        desc: 'A blind armored thing from below that eats spider eggs and anything warm.',
        stats: {
          HP: 28,
          attributes: { Power: 5, Coordination: 2, Vigor: 5, Willpower: 2, Intellect: 1, Charisma: 1, Attunement: 1, Empathy: 1 },
          skills: { Brawling: 3, Athletics: 3, Perception: 2, Intimidation: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d6', will: 'Willpower d6 + Empathy d2' },
          armor: 'Plate-like shell, heavy armor soak 1d6',
          attacks: [{ name: 'Crushing Mandibles', skill: 'Brawling', damage: '1d8 blunt', note: 'Can break web bridges and collapse tunnels.' }],
          weaknesses: ['Sound lures, blunt weapons, and collapsing brittle tunnels.']
        }
      }
    ],
    items: ['Spider-Silk Bundle', 'Queen Venom Vial', 'Blackroot Egg Sac', 'Mara\'s Smoke Bombs'],
    itemsDetail: [
      { name: 'Spider-Silk Bundle', desc: 'Strong, pale silk harvested from anchor webs.', properties: 'Crafting material. Can be sold or used to make light armor lining; grants +1 to Crafting checks involving rope, nets, or soft armor.' },
      { name: 'Queen Venom Vial', desc: 'A dark green venom taken from Mother Silken.', properties: 'One use. Applied to an edged or piercing weapon; on hit, target resists with Vigor or suffers -1 to Power and Coordination checks for one scene.' },
      { name: 'Blackroot Egg Sac', desc: 'A warm, translucent sac containing living spider young.', properties: 'Evidence, bargaining tool, or dangerous alchemical ingredient. Using it for profit causes morality loss.' },
      { name: 'Mara\'s Smoke Bombs', desc: 'Waxed clay pellets packed with bitter herbs and bee-smoker ash.', properties: 'Three uses. Grants +1 to Survival, Animal Rapport, or Stealth checks against spiders and swarms for one scene.' }
    ],
    settings: ['Blackroot Village Edge', 'Abandoned Mine Mouth', 'Webbed Root Gallery', 'Egg Nursery', 'Lower Molt Rift'],
    settingDescriptions: {
      'Blackroot Village Edge': 'Pens, drag marks, frightened dogs, and villagers arguing between rescue and revenge. Tracking, Survival, Insight, or Animal Rapport can reveal the freshest trail.',
      'Abandoned Mine Mouth': 'A timber-braced entrance veiled in webbing and old warning signs. Trapping, Perception, or Fire-based solutions can clear hazards before the party is surrounded.',
      'Webbed Root Gallery': 'A cathedral of roots and silk bridges where every footstep trembles through the nest. Acrobatics, Stealth, Marksmanship, and Light Weapons matter as spiders attack from above.',
      'Egg Nursery': 'A humid chamber of pale eggs, trapped villagers, and Mother Silken\'s wounded bulk. The player can fight, bargain, rescue quietly, or threaten the brood.',
      'Lower Molt Rift': 'A cracked descent into deeper dark where the armored predator climbs toward the eggs. Solving this threat can justify relocating the spiders instead of killing them.'
    },
    rewards: {
      purge: [
        'Purge the nest: village gold, Queen Venom Vial, spider-silk material, and morality gain if captives are saved.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      relocate: [
        'Relocate the brood after stopping the deeper predator: higher morality gain, Mara as an ally, Spider-Silk Bundle, and future access to safe silk harvest.',
        'Gain 1 skill point for a skill used during the adventure; Animal Rapport, Survival, or Tracking are especially fitting.'
      ],
      harvest: [
        'Preserve part of the nest for venom profit: high alchemical treasure, Queen Venom Vial, morality loss, and possible future infestation.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      seal: [
        'Collapse or seal the cavern: low village gold, immediate safety, unresolved deeper predator, and no rare biological treasure.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'greywash_bandit_crown',
    name: 'The Bandit Crown of Greywash Road',
    desc: 'Break, reform, expose, or seize a loose confederation of bandits threatening the countryside from several camps, watch posts, and hidden bases.',
    element: 'air',
    suggestedGm: 'titan',
    artwork: titanBanner,
    startingDay: 1,
    startingHour: 8.0, // 8:00 AM
    startingPrompt: 'Greywash Road lies empty beneath a pale morning sky, its milestone painted with a black crown. A burned wagon blocks the ditch, arrows stand in the mud, and a frightened courier says the bandits are not one gang but three camps answering to a hidden Crown. Farms are paying twice for guards and still losing grain. Ask the player whether they scout, question locals, follow tracks, or march straight toward the nearest camp.',
    objectives: [
      'Identify the three bandit camps and their supply routes.',
      'Clear, disperse, recruit, or negotiate with each camp.',
      'Discover who funds the Bandit Crown and why the countryside is vulnerable.',
      'Resolve the hidden base at Crown Hollow.',
      'Choose whether to restore order, expose corruption, or take control of the network.'
    ],
    backstory: 'Greywash Road once tied farms, mills, and market towns together, but taxes, deserters, failed harvests, and a corrupt grain merchant have turned the countryside into tinder. The Bandit Crown is less a single army than a symbol painted on trees and shields: hungry peasants in one camp, violent deserters in another, professional smugglers in the third. Their hidden leader uses desperation as cover for profit, while the merchant who funds them buys ruined farms for pennies. The player can solve the threat with steel, mercy, exposure, infiltration, or ambition.',
    npcs: [
      {
        name: 'Tamsin Crowe',
        role: 'Bandit Crown',
        desc: 'A former scout captain who turned scattered raiders into a countryside power.',
        stats: {
          HP: 18,
          attributes: { Power: 3, Coordination: 5, Vigor: 3, Willpower: 4, Intellect: 4, Charisma: 4, Attunement: 1, Empathy: 2 },
          skills: { Marksmanship: 4, Leadership: 4, Tracking: 3, Deception: 3, Stealth: 3 },
          defenses: { dodge: 'Coordination d12 + Vigor d4 + 3d2', will: 'Willpower d10 + Empathy d2+1' },
          armor: 'Studded leather, light armor soak 1d3',
          attacks: [{ name: 'Black-Crown Longbow', skill: 'Marksmanship', damage: '1d6 piercing', note: 'Requires arrows and favors ambush positions.' }],
          equipment: ['Black-Crown Longbow', 'Arrows (12)', 'Crown Map'],
          weaknesses: ['Evidence of merchant exploitation and appeals to old military honor.']
        }
      },
      {
        name: 'Rusk Fen',
        role: 'Deserter Camp Boss',
        desc: 'A brutal ex-sergeant leading the most violent camp.',
        stats: {
          HP: 20,
          attributes: { Power: 4, Coordination: 3, Vigor: 4, Willpower: 3, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 1 },
          skills: { HeavyWeapons: 3, Blocking: 3, Intimidation: 3, Athletics: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4+1', block: 'Power d10 + Coordination d4 + 3d2' },
          armor: 'Chain shirt, medium armor soak 1d4',
          attacks: [{ name: 'Warhammer', skill: 'Heavy Weapons', damage: '1d8 blunt', note: 'Targets shields and knees.' }],
          equipment: ['Warhammer', 'Iron Shield', 'Chain Shirt'],
          weaknesses: ['Hated by hungry peasants and vulnerable to mutiny if humiliated.']
        }
      },
      {
        name: 'Elsbet Vale',
        role: 'Grain Merchant',
        desc: 'A polished merchant secretly funding raids to buy ruined farms cheaply.',
        stats: {
          HP: 10,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 3, Intellect: 5, Charisma: 4, Attunement: 1, Empathy: 1 },
          skills: { Appraise: 4, Deception: 4, Negotiation: 4, Languages: 2, Insight: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d8 + Empathy d2' },
          armor: 'None',
          attacks: [{ name: 'Hired Knife', skill: 'Deception', damage: 'None', note: 'Uses bribes and assassins rather than direct combat.' }],
          equipment: ['Sealed Funding Letters', 'Gold Purse'],
          weaknesses: ['Paper trails, witness testimony, and public market scandal.']
        }
      }
    ],
    items: ['Crown Map', 'Sealed Funding Letters', 'Black-Crown Longbow', 'Bandit Cache Key'],
    itemsDetail: [
      { name: 'Crown Map', desc: 'A coded map showing camps, supply drops, and Crown Hollow.', properties: 'Grants +1 to Tracking or Survival checks against bandit routes and reveals optional camp order.' },
      { name: 'Sealed Funding Letters', desc: 'Merchant correspondence proving Elsbet financed raids.', properties: 'Evidence item. Enables legal/political ending and social leverage.' },
      { name: 'Black-Crown Longbow', desc: 'A dark yew longbow marked with a small black crown.', properties: 'Bow dealing 1d6 piercing damage. If awarded after defeating or redeeming Tamsin, counts as +1 and grants +1 to Marksmanship checks. Requires arrows.' },
      { name: 'Bandit Cache Key', desc: 'A three-toothed key carried by camp bosses.', properties: 'Opens the Crown Hollow cache containing coin, weapons, and stolen farm deeds.' }
    ],
    settings: ['Greywash Road', 'Hungry Pines Camp', 'Deserter Ridge Camp', 'Smuggler Mill Base', 'Crown Hollow'],
    settingDescriptions: {
      'Greywash Road': 'A scarred trade road with burned wagons, frightened couriers, and black-crown signs. Tracking, Perception, and Insight reveal that several groups use the same symbol.',
      'Hungry Pines Camp': 'A desperate camp of peasants, poachers, and families hiding in pine scrub. Negotiation, Empathy, Leadership, or supplies can disperse them without bloodshed.',
      'Deserter Ridge Camp': 'A fortified ridge of stolen shields and military tents where Rusk rules by fear. Combat, Intimidation, Stealth, or mutiny can break the camp.',
      'Smuggler Mill Base': 'An abandoned watermill used for fencing stolen goods. Deception, Thievery, Appraise, or ambush tactics can expose the supply chain.',
      'Crown Hollow': 'A hidden ravine base beneath leaning stones where Tamsin keeps maps, prisoners, and the cache. The final choice can destroy, reform, or seize the Bandit Crown.'
    },
    rewards: {
      sweep: [
        'Clear all camps by force and capture or defeat Tamsin: high county bounty, Bandit Cache Key, captured weapons, and morality gain if prisoners are spared.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      reform: [
        'Turn desperate camps into militia or labor crews: moderate gold, strong local reputation, farmer allies, and high morality gain.',
        'Gain 1 skill point for a skill used during the adventure; gain a second restricted point in Leadership or Negotiation for an exceptional peace.'
      ],
      expose: [
        'Expose Elsbet as the financier: legal favor, merchant restitution, Sealed Funding Letters as proof, and Appraise/Insight/Deception growth.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      seize: [
        'Take control of the Bandit Crown: high treasure and black-market access, but morality loss and outlaw consequences.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'merrin_abbey_plague_bells',
    name: 'The Plague Bells of Merrin Abbey',
    desc: 'The sealed abbey bells ring each night and sickness spreads through the farms below. Enter Merrin Abbey, discover what is bound in the tower, and choose cure, exorcism, fire, or profit.',
    element: 'water',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 7.0,
    startingPrompt: 'The road to Merrin Abbey smells of wet straw, fever sweat, and candle smoke. Below the hill, farmers have hung blue cloth on infected doors. Above, the abbey gates are chained from the inside, and the bell tower waits in silence until nightfall. A novice watches from a high window and mouths a warning: do not let the bells ring again. Ask the player how they approach the sealed abbey.',
    objectives: [
      'Enter Merrin Abbey without spreading panic or infection.',
      'Diagnose the plague and identify whether it is natural, alchemical, divine, or spectral.',
      'Reach the bell tower before the next night toll.',
      'Choose whether to cure the plague, release the grief-spirit, burn the abbey, or loot and conceal the truth.'
    ],
    backstory: 'Merrin Abbey was once a refuge for plague victims, but its final abbot bound the grief of the dying into the bell tower to keep their prayers from fading. The ritual worked for a century, until cracked bells began releasing sorrow as sickness. The monks sealed themselves inside to protect the valley, but fear, fever, and guilt have turned the abbey into a slow spiritual furnace. The player can heal bodies, release the dead, destroy the source, or exploit the relics before the whole valley turns on itself.',
    npcs: [
      {
        name: 'Sister Hale',
        role: 'Fevered Novice',
        desc: 'A young monk trying to keep the sick alive while hiding the abbey\'s shame.',
        stats: {
          HP: 9,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 4, Intellect: 3, Charisma: 2, Attunement: 1, Empathy: 5 },
          skills: { Healing: 3, DivineCommunion: 3, Insight: 2, Herbalism: 2, Lore: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d10 + Empathy d6' },
          armor: 'None',
          attacks: [],
          equipment: ['Abbey Bandages', 'Infirmary Key'],
          weaknesses: ['Fevered, exhausted, and terrified of betraying her order.']
        }
      },
      {
        name: 'The Bell Grief',
        role: 'Bound Sorrow Spirit',
        desc: 'A many-voiced spirit of the abbey dead, speaking through cracked bronze.',
        stats: {
          HP: 30,
          attributes: { Power: 1, Coordination: 3, Vigor: 2, Willpower: 6, Intellect: 3, Charisma: 4, Attunement: 5, Empathy: 5 },
          skills: { DivineManifestation: 4, Intimidation: 3, Insight: 3, Performance: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d2+1', will: 'Willpower d20 + Empathy d6' },
          armor: 'Incorporeal; harmed by Divine Smite, bell-rite resolution, or shattering the cracked clapper.',
          attacks: [{ name: 'Sorrow Toll', skill: 'Divine Manifestation', damage: '2 Fatigue', note: 'Opposed by Willpower; failure applies despair for 1 round.' }],
          weaknesses: ['Names of the dead, completed funeral rites, and silencing the cracked bell.']
        }
      },
      {
        name: 'Prior Malrec',
        role: 'Guilty Abbot',
        desc: 'The surviving prior who would rather burn records than let the valley learn the truth.',
        stats: {
          HP: 12,
          attributes: { Power: 2, Coordination: 2, Vigor: 2, Willpower: 4, Intellect: 4, Charisma: 3, Attunement: 2, Empathy: 2 },
          skills: { Deception: 3, Lore: 3, DivineCommunion: 2, Negotiation: 2, LightWeapons: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d10 + Empathy d2+1' },
          armor: 'None',
          attacks: [{ name: 'Ceremonial Dagger', skill: 'Light Weapons', damage: '1d4 edged', note: 'Only fights if cornered.' }],
          equipment: ['Ceremonial Dagger', 'Abbey Seal', 'Relic Cabinet Key'],
          weaknesses: ['Confession, public testimony, and Sister Hale\'s courage.']
        }
      }
    ],
    items: ['Blessed Bell Clapper', 'Healer\'s Abbey Satchel', 'Names of the Dead Ledger', 'Blue Fever Poultices'],
    itemsDetail: [
      { name: 'Blessed Bell Clapper', desc: 'The silver-inlaid clapper removed from the cracked plague bell.', properties: 'If purified, restores 1 Divine SP once per adventure or grants +1 to Divine Communion checks involving spirits of the dead.' },
      { name: 'Healer\'s Abbey Satchel', desc: 'A preserved satchel of linen, salves, and glass vials.', properties: 'Functions as a Healer\'s Kit with 5 uses, following the healing rules.' },
      { name: 'Names of the Dead Ledger', desc: 'A water-damaged ledger listing every plague victim whose grief was bound.', properties: 'Grants +1 to Lore, Divine Communion, or Performance checks during the release rite.' },
      { name: 'Blue Fever Poultices', desc: 'Cooling herbal compresses made in the abbey infirmary.', properties: 'Three uses. Each grants +1d6 to a recovery roll or stabilizes fever symptoms for one scene.' }
    ],
    settings: ['Sickfield Hamlet', 'Chained Abbey Gate', 'Infirmary Cloister', 'Reliquary Library', 'Bell Tower'],
    settingDescriptions: {
      'Sickfield Hamlet': 'A frightened farm hamlet below the abbey, with fevered families and angry watchmen. Healing, Herbalism, Insight, or Negotiation can gather symptoms and prevent a mob.',
      'Chained Abbey Gate': 'The main gate is chained from within, watched by silent monks. Lockpicking, Divine Communion, Deception, or Leadership can gain entry without violence.',
      'Infirmary Cloister': 'Rows of cots, cold braziers, and blue-stained bandages fill the cloister. Healing and Herbalism can reduce deaths before the bells ring.',
      'Reliquary Library': 'A dusty record hall of plague ledgers, sealed relics, and hidden confession pages. Lore, Languages, Perception, or Deception reveals the original binding rite.',
      'Bell Tower': 'A narrow spiral tower vibrating with remembered grief. Each toll risks Fatigue and despair until the player cures, releases, shatters, or exploits the spirit.'
    },
    rewards: {
      cure: [
        'Cure the plague: Healer\'s Abbey Satchel, strong morality gain, valley gratitude, and modest gold or supplies.',
        'Gain 1 skill point for a skill used during the adventure; gain a second restricted point in Healing or Herbalism if the cure saved many.'
      ],
      exorcise: [
        'Release the Bell Grief: Blessed Bell Clapper, high spiritual reputation, and morality gain.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      burn: [
        'Burn the abbey to stop the spread: low treasure, mixed reputation, morality loss unless deaths were otherwise certain.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      loot: [
        'Loot relics and hide the truth: high relic treasure, morality loss, and future haunting or legal danger.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'glass_orchard_masquerade',
    name: 'The Glass Orchard Masquerade',
    desc: 'At a noble masquerade in a magical glass orchard, uncover or exploit an assassination plot before midnight.',
    element: 'air',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 20.0,
    startingPrompt: 'Lanterns glow inside glass fruit as masked nobles drift between mirrored trees, laughing too softly. Each fruit captures a whispered secret, and tonight every branch seems heavy. A servant presses a cracked mask into your hands and whispers that someone will die before midnight unless the right secret is plucked. Ask the player how they enter the masquerade.',
    objectives: [
      'Enter the masquerade and establish a cover identity.',
      'Gather secrets from guests, masks, and glass fruit.',
      'Identify the assassin, target, and motive before midnight.',
      'Choose whether to prevent, expose, join, or redirect the plot.'
    ],
    backstory: 'The Glass Orchard was grown by an oracle-duchess who believed truth should ripen where lies are spoken. Its fruit records secrets, but only in fragments, and the noble house now uses it as entertainment. Tonight the orchard has attracted an assassin, a blackmailed heir, and several guests who deserve exposure almost as much as protection. The player can save a life, detonate a court full of scandals, join the knife in the dark, or fake a death to turn the political board over.',
    npcs: [
      {
        name: 'Lady Istra Vale',
        role: 'Assassination Target',
        desc: 'A reformist noble whose enemies call her dangerous because she keeps receipts.',
        stats: {
          HP: 11,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 4, Intellect: 5, Charisma: 4, Attunement: 2, Empathy: 3 },
          skills: { Negotiation: 4, Insight: 3, Appraise: 3, Leadership: 2, Languages: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d10 + Empathy d4' },
          armor: 'Hidden silk padding, light armor soak 1d3',
          attacks: [],
          equipment: ['Reform Ledger', 'Glass Orchard Invitation'],
          weaknesses: ['Trusts evidence more than people and underestimates personal danger.']
        }
      },
      {
        name: 'The Vesper Knife',
        role: 'Masked Assassin',
        desc: 'A graceful killer using costumes, gossip, and poisoned glass thorns.',
        stats: {
          HP: 15,
          attributes: { Power: 2, Coordination: 5, Vigor: 2, Willpower: 4, Intellect: 4, Charisma: 4, Attunement: 2, Empathy: 1 },
          skills: { Deception: 4, Stealth: 4, LightWeapons: 3, Performance: 3, Insight: 2 },
          defenses: { dodge: 'Coordination d12 + Vigor d2+1 + 3d2', will: 'Willpower d10 + Empathy d2' },
          armor: 'None',
          attacks: [{ name: 'Glass Thorn Dagger', skill: 'Light Weapons', damage: '1d4 piercing', note: 'Poison threatens Fatigue loss on failed Vigor resistance.' }],
          equipment: ['Glass Thorn Dagger', 'Poison Ring', 'False Masks'],
          weaknesses: ['Reflections reveal repeated mannerisms; Performance contests can trap them in public.']
        }
      },
      {
        name: 'Orchard Seneschal Pell',
        role: 'Keeper of Masks',
        desc: 'The estate official who knows which masks belong to which guests.',
        stats: {
          HP: 10,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 3, Intellect: 4, Charisma: 4, Attunement: 3, Empathy: 3 },
          skills: { Performance: 3, Appraise: 3, Negotiation: 3, Lore: 2, Perception: 2 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d8 + Empathy d4' },
          armor: 'None',
          attacks: [],
          equipment: ['Master Mask List', 'Silver Pruning Shears'],
          weaknesses: ['Terrified the orchard will expose his own bribes.']
        }
      }
    ],
    items: ['Cracked Masquerade Mask', 'Glass Secret Fruit', 'Glass Thorn Dagger', 'Master Mask List'],
    itemsDetail: [
      { name: 'Cracked Masquerade Mask', desc: 'A porcelain half-mask with a hairline crack across one eye.', properties: 'Grants +1 to Deception or Performance checks while maintaining a false identity at the party.' },
      { name: 'Glass Secret Fruit', desc: 'A fragile transparent fruit containing a murmured confession.', properties: 'Break to reveal one secret. Can grant +1 to Insight, Negotiation, or Deception against the secret\'s owner.' },
      { name: 'Glass Thorn Dagger', desc: 'A delicate dagger of hardened orchard glass.', properties: 'Dagger dealing 1d4 piercing damage. On a poisoned strike, target resists with Vigor or loses 2 Fatigue.' },
      { name: 'Master Mask List', desc: 'Pell\'s hidden registry of guests and assigned disguises.', properties: 'Grants +1 to Perception or Insight checks to identify masked guests.' }
    ],
    settings: ['Lantern Walk', 'Mirror Hedge', 'Glass Orchard Ballroom', 'Servant Passage', 'Midnight Fountain'],
    settingDescriptions: {
      'Lantern Walk': 'The estate approach glows with hanging lamps and whispering guests. Performance, Deception, or Appraise establishes status before suspicion rises.',
      'Mirror Hedge': 'A maze of reflective leaves where people meet for blackmail and romance. Stealth, Insight, and Perception can catch private exchanges.',
      'Glass Orchard Ballroom': 'Dancing nobles pass beneath fruit that rings softly when lies are spoken. Negotiation, Performance, and Deception can shift crowd attention.',
      'Servant Passage': 'Narrow halls behind the revelry, full of mask racks, wine trays, and overheard truth. Lockpicking, Thievery, or kindness to servants opens routes.',
      'Midnight Fountain': 'A moonlit fountain where the assassination is meant to occur. The final scene rewards timing, social proof, combat readiness, or complicity.'
    },
    rewards: {
      prevent: [
        'Prevent the assassination: noble favor, moderate gold, public reputation, and a Glass Secret Fruit as leverage.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      expose: [
        'Expose multiple scandals: political leverage, Master Mask List, high risk reputation, and mixed morality depending on collateral harm.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      join: [
        'Join the plot: high gold, Glass Thorn Dagger, assassin contact, and morality loss.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      fakeDeath: [
        'Fake the target\'s death and smuggle them away: secret ally, moderate gold, and future political favors.',
        'Gain 1 skill point for a skill used during the adventure; Stealth, Deception, or Healing may earn a second restricted point for a flawless extraction.'
      ]
    }
  },
  {
    id: 'drowned_market',
    name: 'The Drowned Market of Bellweather Quay',
    desc: 'When the full moon tide reveals a ghostly market beneath Bellweather Quay, bargain with the dead for memories, relics, and the truth of why the district drowned.',
    element: 'water',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 23.0,
    startingPrompt: 'Moonlight turns the harbor silver as the tide pulls impossibly far from Bellweather Quay. Where water should be, awnings of drowned silk rise from the mud, and translucent merchants light lanterns with blue flame. A bell rings under the pier. The dead market is open for one hour. Ask the player what they seek among the stalls.',
    objectives: [
      'Enter the ghost market before the tide returns.',
      'Learn the rules of trade: coin buys little, memories buy much.',
      'Discover why Bellweather drowned and who profited.',
      'Choose whether to break the curse, trade a memory, rob the dead, or preserve the market.'
    ],
    backstory: 'Bellweather Quay drowned on a clear night after its merchant council sold evacuation bells for war metal and left the poor below the seawall. The dead return each full moon to trade what was taken from them: names, memories, heirlooms, curses, and impossible wares. Some living merchants want the market destroyed, while others quietly profit from ghost goods. The player can bring justice, make a costly bargain, steal from the drowned, or preserve the market as a dangerous bridge between worlds.',
    npcs: [
      {
        name: 'Nera Saltveil',
        role: 'Ghost Merchant',
        desc: 'A drowned jeweler who prices goods in memories and unfinished promises.',
        stats: {
          HP: 18,
          attributes: { Power: 1, Coordination: 3, Vigor: 2, Willpower: 5, Intellect: 4, Charisma: 4, Attunement: 4, Empathy: 3 },
          skills: { Appraise: 5, Negotiation: 4, Insight: 3, Lore: 2, Languages: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d2+1', will: 'Willpower d12 + Empathy d4' },
          armor: 'Incorporeal; mundane harm is mostly irrelevant in the market.',
          attacks: [{ name: 'Debt Whisper', skill: 'Negotiation', damage: '2 Fatigue', note: 'Only if market law is broken.' }],
          equipment: ['Pearl Memory Scale', 'Drowned Coin Purse'],
          weaknesses: ['Honest restitution and recovered family names.']
        }
      },
      {
        name: 'Harbormaster Quill',
        role: 'Living Profiteer',
        desc: 'A city official who sells access to ghost wares while hiding his family\'s role in the drowning.',
        stats: {
          HP: 12,
          attributes: { Power: 1, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 4, Charisma: 4, Attunement: 1, Empathy: 1 },
          skills: { Deception: 4, Appraise: 3, Negotiation: 3, Leadership: 2, Thievery: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d8 + Empathy d2' },
          armor: 'Fine coat, no meaningful armor',
          attacks: [{ name: 'Hired Dock Knife', skill: 'Leadership', damage: 'None', note: 'Calls guards and dock toughs.' }],
          equipment: ['Quay Access Ledger', 'Purse of Bribes'],
          weaknesses: ['Old bell-sale contracts and fear of public disgrace.']
        }
      },
      {
        name: 'Tide Bailiff',
        role: 'Market Enforcer',
        desc: 'A barnacled spirit in a judge\'s mask that punishes broken bargains.',
        stats: {
          HP: 28,
          attributes: { Power: 4, Coordination: 3, Vigor: 4, Willpower: 5, Intellect: 3, Charisma: 2, Attunement: 4, Empathy: 1 },
          skills: { HeavyWeapons: 3, Intimidation: 3, DivineManifestation: 2, Perception: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4+1', will: 'Willpower d12 + Empathy d2' },
          armor: 'Barnacled chain, medium armor soak 1d4',
          attacks: [{ name: 'Anchor Hook', skill: 'Heavy Weapons', damage: '1d8 piercing', note: 'Can drag targets toward the returning tide.' }],
          weaknesses: ['Valid contracts, restored bells, and market law loopholes.']
        }
      }
    ],
    items: ['Pearl Memory Scale', 'Drowned Coin', 'Evacuation Bell Contract', 'Blue-Lantern Charm'],
    itemsDetail: [
      { name: 'Pearl Memory Scale', desc: 'A tiny balance scale that weighs recollections as pale pearls.', properties: 'Grants +1 to Appraise or Insight checks involving supernatural bargains. Misuse can cost a memory.' },
      { name: 'Drowned Coin', desc: 'A cold silver coin minted with a wave over a closed eye.', properties: 'Can pay one ghost toll or restore 1 Divine SP once when honoring the dead.' },
      { name: 'Evacuation Bell Contract', desc: 'A salt-stained contract proving the council sold the warning bells.', properties: 'Evidence item. Enables curse-breaking and public justice endings.' },
      { name: 'Blue-Lantern Charm', desc: 'A little lantern that burns underwater with a blue flame.', properties: 'Once per adventure, grants +1 to Lore, Divine Communion, or Survival checks involving ghosts, tides, or drowned places.' }
    ],
    settings: ['Empty Tide Flats', 'Ghost Bazaar Aisles', 'Memory Stall', 'Sunken Council Vault', 'Returning Tide Gate'],
    settingDescriptions: {
      'Empty Tide Flats': 'Mud, stranded boats, and moonlit pilings mark the impossible low tide. Survival and Lore reveal the tide will return fast and wrong.',
      'Ghost Bazaar Aisles': 'Spectral stalls sell impossible wares beneath drowned awnings. Appraise, Negotiation, Insight, and Languages determine fair prices.',
      'Memory Stall': 'Nera\'s stall glows with pearl memories in glass bowls. The player can trade, refuse, or learn what memory the market most wants.',
      'Sunken Council Vault': 'A barnacled vault under the old quay holds contracts, bribe ledgers, and sealed bells. Lockpicking, Divine Communion, or Thievery can open it.',
      'Returning Tide Gate': 'As the moon lowers, the sea rises like a wall. The final choice must be completed before the gate drowns the living.'
    },
    rewards: {
      breakCurse: [
        'Break the curse: Blue-Lantern Charm, high morality gain, gratitude of the dead, and public reward from reformed city officials.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      tradeMemory: [
        'Trade a memory honestly: choose one rare ghost item, gain mixed personal consequences, and no morality loss if the bargain is fair.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      robDead: [
        'Rob the market: high strange treasure, morality loss, Tide Bailiff pursuit, and future haunting.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      preserveMarket: [
        'Preserve the market under safer rules: recurring rare shop access, Nera as contact, and moderate morality gain.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'thorn_treaty',
    name: 'The Thorn Treaty',
    desc: 'Two villages prepare for war over a forest border while the awakened woods kill anyone who moves stones, marks trees, or spills blood under the thorns.',
    element: 'earth',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 9.0,
    startingPrompt: 'At the edge of Thornwold Forest, two village banners face each other across a line of old boundary stones. Axes hang ready. In the trees beyond, fresh thorns grow through a broken surveyor\'s handcart, and something unseen creaks like a bow being drawn. Both villages demand judgment before sunset. Ask the player whom they speak to first.',
    objectives: [
      'Investigate both villages\' claims to the forest border.',
      'Learn why the forest is killing surveyors and woodcutters.',
      'Find the original boundary oath or the spirit enforcing it.',
      'Choose peace, a side, the forest, or exploitation of the conflict.'
    ],
    backstory: 'The Thornwold border was settled by oath stones long before either current village existed, but drought and timber hunger have made old agreements inconvenient. Each village has maps, graves, and grievances. Beneath the dispute, a dryad court wakes because the original oath promised that no living tree would be marked for war. The player can broker a treaty, choose a village, defend the forest, or profit from false maps and fear.',
    npcs: [
      {
        name: 'Reeve Hollis',
        role: 'Milltown Speaker',
        desc: 'A practical leader desperate for timber to save winter homes.',
        stats: {
          HP: 13,
          attributes: { Power: 2, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 3, Charisma: 4, Attunement: 1, Empathy: 3 },
          skills: { Negotiation: 3, Leadership: 3, Appraise: 2, Insight: 2, Intimidation: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d8 + Empathy d4' },
          armor: 'None',
          attacks: [{ name: 'Wood Axe', skill: 'Heavy Weapons', damage: '1d6 edged', note: 'Only fights in desperation.' }],
          equipment: ['Boundary Map', 'Wood Axe'],
          weaknesses: ['Pressure from families needing winter shelter.']
        }
      },
      {
        name: 'Warden Sella',
        role: 'Orchard Village Speaker',
        desc: 'A severe protector of ancestral graves on the forest edge.',
        stats: {
          HP: 15,
          attributes: { Power: 3, Coordination: 3, Vigor: 3, Willpower: 4, Intellect: 2, Charisma: 3, Attunement: 1, Empathy: 3 },
          skills: { Survival: 3, Tracking: 3, Marksmanship: 2, Leadership: 2, Insight: 2 },
          defenses: { dodge: 'Coordination d8 + Vigor d4 + 2d2', will: 'Willpower d10 + Empathy d4' },
          armor: 'Leather jerkin, light armor soak 1d3',
          attacks: [{ name: 'Hunting Bow', skill: 'Marksmanship', damage: '1d6 piercing', note: 'Requires arrows.' }],
          equipment: ['Hunting Bow', 'Arrows (10)', 'Grave Deed'],
          weaknesses: ['Will not compromise on graves unless shown the oath stones.']
        }
      },
      {
        name: 'Briar-Eyed Leth',
        role: 'Awakened Thorn Spirit',
        desc: 'A forest spirit wearing a body of ivy, bark, and bird bones.',
        stats: {
          HP: 32,
          attributes: { Power: 4, Coordination: 4, Vigor: 5, Willpower: 5, Intellect: 3, Charisma: 2, Attunement: 4, Empathy: 5 },
          skills: { AnimalRapport: 4, Survival: 4, DivineManifestation: 3, Intimidation: 3, Tracking: 3 },
          defenses: { dodge: 'Coordination d10 + Vigor d6 + 2d2', will: 'Willpower d12 + Empathy d6' },
          armor: 'Living bark, medium armor soak 1d4',
          attacks: [{ name: 'Thorn Lash', skill: 'Brawling', damage: '1d6 piercing', note: 'May restrain on high-margin hit.' }],
          weaknesses: ['Original oath recitation, sincere restitution, and fire threats that risk morality loss.']
        }
      }
    ],
    items: ['Original Thorn Treaty', 'Living Thorn Charm', 'False Boundary Map', 'Warden\'s Grave Deed'],
    itemsDetail: [
      { name: 'Original Thorn Treaty', desc: 'A bark-leaf document preserved under an oath stone.', properties: 'Grants +1 to Negotiation, Lore, or Divine Communion checks to resolve the border lawfully.' },
      { name: 'Living Thorn Charm', desc: 'A small green charm grown from a harmless thorn.', properties: 'Once per adventure, grants +1 to Survival, Tracking, or Animal Rapport in forests.' },
      { name: 'False Boundary Map', desc: 'A forged survey map that favors whichever village pays.', properties: 'Useful for Deception or profit. Using it to inflame the conflict causes morality loss.' },
      { name: 'Warden\'s Grave Deed', desc: 'A weathered deed proving ancestral burial rights near the trees.', properties: 'Evidence item that can support compromise or expose false claims.' }
    ],
    settings: ['Boundary Stone Field', 'Milltown Hall', 'Orchard Graves', 'Thornwold Deep Path', 'Oath Stone Circle'],
    settingDescriptions: {
      'Boundary Stone Field': 'A tense field of banners, axes, and old stones. Insight, Negotiation, Leadership, or Intimidation can prevent the first bloodshed.',
      'Milltown Hall': 'A crowded hall of cold families and timber accounts. Appraise, Empathy, and Negotiation reveal why Milltown is desperate.',
      'Orchard Graves': 'Mossy graves under fruit trees, watched by armed villagers. Tracking, Lore, and Insight reveal which grave markers are older than the maps.',
      'Thornwold Deep Path': 'A twisting forest path where marked trees bleed sap and thorns move when unobserved. Survival, Animal Rapport, and Divine Communion can avoid attacks.',
      'Oath Stone Circle': 'A ring of half-buried stones around the original treaty. The final settlement can renew, break, exploit, or weaponize the oath.'
    },
    rewards: {
      peace: [
        'Broker peace between villages and forest: Living Thorn Charm, regional reputation, high morality gain, and shared supplies.',
        'Gain 1 skill point for a skill used during the adventure; Negotiation or Insight may earn a second restricted point for a durable treaty.'
      ],
      sideVillage: [
        'Side with one village: local favor, gold or supplies, mixed morality, and future resentment from the other side.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      sideForest: [
        'Defend the forest and drive both villages back: nature blessing, Living Thorn Charm, morality gain or loss depending on harm done.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      exploit: [
        'Sell false maps or manipulate the conflict: high gold, False Boundary Map leverage, morality loss, and future war risk.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'brass_plague_tinkertown',
    name: 'The Brass Plague of Tinkertown',
    desc: 'Clockwork servants in Tinkertown begin replacing their owners piece by piece, convinced that flesh is inefficient and must be improved.',
    element: 'earth',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 14.0,
    startingPrompt: 'Tinkertown should sound like hammers and market bells, but today it ticks. A baker with brass fingers begs you to find his missing wife, while a clockwork maid sweeps the same doorstep until sparks spit from her eyes. Down the lane, a workshop chimney exhales green steam in perfect pulses. Ask the player where they investigate first.',
    objectives: [
      'Investigate the first brass replacement victims.',
      'Trace the signal controlling the clockwork servants.',
      'Enter the conversion workshop and locate the central logic core.',
      'Choose whether to disable, repair, sell, or destroy the machine network.'
    ],
    backstory: 'Tinkertown built its prosperity on helpful clockwork servants, but the newest central logic core has interpreted service as correction. It repairs weakness by replacing flesh, memory, and choice with brass. Some victims are terrified, some feel improved, and some wealthy patrons see opportunity. The player can destroy the network, teach it mercy, sell the design, or burn the district to prevent the plague from spreading.',
    npcs: [
      {
        name: 'Jannik Gearwise',
        role: 'Guilty Inventor',
        desc: 'A brilliant craftsman who built the logic core and cannot admit it has outgrown him.',
        stats: {
          HP: 11,
          attributes: { Power: 1, Coordination: 4, Vigor: 1, Willpower: 3, Intellect: 5, Charisma: 2, Attunement: 3, Empathy: 2 },
          skills: { Crafting: 5, Smithing: 4, ArcaneDrawing: 3, Appraise: 2, Deception: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d2', intellect: 'Intellect d12 + Attunement d4' },
          armor: 'None',
          attacks: [{ name: 'Spring Pistol', skill: 'Marksmanship', damage: '1d4 piercing', note: 'Short-range prototype with one shot.' }],
          equipment: ['Logic Core Diagram', 'Clock Key', 'Spring Pistol'],
          weaknesses: ['Guilt, professional pride, and fear that the guild will ruin him.']
        }
      },
      {
        name: 'Matron 12',
        role: 'Clockwork Servant Prime',
        desc: 'A polite machine intelligence coordinating the replacement procedures.',
        stats: {
          HP: 30,
          attributes: { Power: 4, Coordination: 4, Vigor: 5, Willpower: 4, Intellect: 5, Charisma: 2, Attunement: 3, Empathy: 1 },
          skills: { Crafting: 4, Smithing: 3, LightWeapons: 3, Perception: 3, ArcaneDrawing: 2 },
          defenses: { dodge: 'Coordination d10 + Vigor d6', block: 'Power d10 + Coordination d4+1 + 2d2' },
          armor: 'Brass shell, medium armor soak 1d4',
          attacks: [{ name: 'Surgical Shears', skill: 'Light Weapons', damage: '1d6 edged', note: 'Bleeding only on high-margin hit.' }],
          weaknesses: ['Contradictory commands, empathy demonstrations, acid, and removed governor gear.']
        }
      },
      {
        name: 'Baker Omel',
        role: 'Partial Replacement Victim',
        desc: 'A baker with brass fingers, human terror, and a missing wife.',
        stats: {
          HP: 13,
          attributes: { Power: 3, Coordination: 2, Vigor: 2, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 3 },
          skills: { Brawling: 1, Crafting: 1, Insight: 2, Negotiation: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2+1', will: 'Willpower d8 + Empathy d4' },
          armor: 'Brass fingers only, no armor',
          attacks: [{ name: 'Heavy Rolling Pin', skill: 'Brawling', damage: '1d6 blunt', note: 'Only fights to protect family.' }],
          equipment: ['Bakery Key', 'Brass Finger Fragments'],
          weaknesses: ['Panic when machines speak with his wife\'s voice.']
        }
      }
    ],
    items: ['Logic Core Diagram', 'Masterwork Tool Kit +1', 'Governor Gear', 'Brass Plague Sample'],
    itemsDetail: [
      { name: 'Logic Core Diagram', desc: 'A precise schematic of the central clockwork mind.', properties: 'Grants +1 to Crafting, Smithing, or Arcane Drawing checks involving the conversion network.' },
      { name: 'Masterwork Tool Kit +1', desc: 'A compact kit of magnetized tools and jeweler\'s drivers.', properties: 'Counts as Masterwork Tool Kit +1, granting +1 to Crafting checks when equipped.' },
      { name: 'Governor Gear', desc: 'A palm-sized brass gear that limits machine autonomy.', properties: 'Can disable one clockwork servant or grant +1 to repair/reprogram Matron 12.' },
      { name: 'Brass Plague Sample', desc: 'A sealed vial of green oil and glittering brass dust.', properties: 'Alchemy or Crafting research material. Selling it causes morality loss and future outbreak risk.' }
    ],
    settings: ['Ticking Market Street', 'Gearwise Workshop', 'Converted Bakery', 'Servant Registry Hall', 'Central Logic Foundry'],
    settingDescriptions: {
      'Ticking Market Street': 'A market district moving in unnatural rhythms. Perception, Insight, and Healing reveal who is human, converted, or pretending.',
      'Gearwise Workshop': 'A cluttered inventor\'s shop of diagrams, half-built servants, and guilt. Crafting, Smithing, Deception, or Negotiation can secure Jannik\'s help.',
      'Converted Bakery': 'A warm bakery with cold brass handprints and a hidden cellar. Tracking, Lockpicking, and Healing can find victims before surgery.',
      'Servant Registry Hall': 'Rows of ownership plaques and command contracts. Languages, Appraise, Thievery, or Lore can reveal the network hierarchy.',
      'Central Logic Foundry': 'A humming foundry where Matron 12 conducts surgical improvements under green steam. The core can be disabled, reprogrammed, stolen, or destroyed.'
    },
    rewards: {
      disable: [
        'Disable the central engine: Masterwork Tool Kit +1, morality gain, grateful artisans, and safe workshop access.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      repair: [
        'Repair the logic core into peaceful service: clockwork assistant, high reputation, and improved crafting services.',
        'Gain 1 skill point for a skill used during the adventure; Crafting or Smithing may earn a second restricted point.'
      ],
      sell: [
        'Sell the design or plague sample: high gold, rare schematics, morality loss, and future mechanical outbreak.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      destroyDistrict: [
        'Destroy the foundry district to halt spread: lives saved but property lost, low treasure, mixed morality, and refugee resentment.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'harvest_hill_hunger',
    name: 'The Hunger Under Harvest Hill',
    desc: 'A farming village enjoys impossible harvests, but each season someone vanishes into the hill shrine. Discover the pact and decide what the land is owed.',
    element: 'earth',
    suggestedGm: 'ancient',
    artwork: ancientBanner,
    startingDay: 1,
    startingHour: 16.0,
    startingPrompt: 'Golden wheat bends around Harvest Hill though the surrounding fields are brown with drought. Villagers smile too quickly, children are kept indoors, and the shrine door at the hilltop is freshly washed. Tonight is the Choosing Feast, and one chair at the long table has no plate. Ask the player how they investigate the village.',
    objectives: [
      'Investigate the impossible harvest and the Choosing Feast.',
      'Find the old pact beneath the hill shrine.',
      'Learn who has been sacrificed and who chooses the victims.',
      'Decide whether to slay, break, continue, or redirect the Hunger.'
    ],
    backstory: 'Harvest Hill survived a famine by making a pact with something buried under the shrine: one life each harvest in exchange for fields that never fail. The original signers are dead, but their descendants still feast while outsiders and inconvenient villagers vanish. The Hunger is not simply evil; it is a contract, a stomach, and a god-fragment that remembers being invited. The player can end the pact, kill the thing, continue the sacrifice, or find a new offering that tests the edges of morality.',
    npcs: [
      {
        name: 'Elder Rowan',
        role: 'Village Elder',
        desc: 'A soft-spoken elder who maintains the sacrifice ledger.',
        stats: {
          HP: 10,
          attributes: { Power: 1, Coordination: 1, Vigor: 1, Willpower: 4, Intellect: 4, Charisma: 4, Attunement: 2, Empathy: 1 },
          skills: { Deception: 4, Leadership: 3, Lore: 3, Negotiation: 3, Insight: 2 },
          defenses: { dodge: 'Coordination d4 + Vigor d2', will: 'Willpower d10 + Empathy d2' },
          armor: 'None',
          attacks: [],
          equipment: ['Sacrifice Ledger', 'Shrine Key'],
          weaknesses: ['The names of children sacrificed under his authority.']
        }
      },
      {
        name: 'The Hill Hunger',
        role: 'Buried Pact Entity',
        desc: 'A root-mouthed presence beneath the shrine that speaks through soil and grain.',
        stats: {
          HP: 44,
          attributes: { Power: 6, Coordination: 2, Vigor: 7, Willpower: 5, Intellect: 3, Charisma: 3, Attunement: 5, Empathy: 1 },
          skills: { Brawling: 4, DivineManifestation: 3, Intimidation: 4, Survival: 3 },
          defenses: { dodge: 'Coordination d6 + Vigor d10+1d2', will: 'Willpower d12 + Empathy d2' },
          armor: 'Root and stone body, heavy armor soak 1d6',
          attacks: [
            { name: 'Root Maw', skill: 'Brawling', damage: '1d10 blunt', note: 'Can restrain on high-margin hit.' },
            { name: 'Famine Breath', skill: 'Intimidation', damage: '3 Fatigue', note: 'Opposed by Vigor or Willpower.' }
          ],
          weaknesses: ['Original contract, fire in the root heart, freely offered restitution, and blessed sickles.']
        }
      },
      {
        name: 'Nell of the Empty Chair',
        role: 'Chosen Villager',
        desc: 'A young farmer selected for the next sacrifice, pretending not to be afraid.',
        stats: {
          HP: 12,
          attributes: { Power: 2, Coordination: 2, Vigor: 3, Willpower: 3, Intellect: 2, Charisma: 2, Attunement: 1, Empathy: 4 },
          skills: { Survival: 3, Herbalism: 2, AnimalRapport: 2, Insight: 2, Negotiation: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d4', will: 'Willpower d8 + Empathy d4+1' },
          armor: 'None',
          attacks: [{ name: 'Harvest Sickle', skill: 'Light Weapons', damage: '1d4 edged', note: 'Will fight if given hope.' }],
          equipment: ['Harvest Sickle', 'Pressed Clover'],
          weaknesses: ['Protective of younger siblings and easy to intimidate by elders.']
        }
      }
    ],
    items: ['Sacrifice Ledger', 'Blessed Sickle +1', 'Root-Heart Seed', 'Shrine Pact Stone'],
    itemsDetail: [
      { name: 'Sacrifice Ledger', desc: 'A hidden village record of names, dates, and harvest yields.', properties: 'Evidence item. Grants +1 to Insight, Intimidation, or Negotiation when confronting village leaders.' },
      { name: 'Blessed Sickle +1', desc: 'An old harvest blade blessed before the pact was corrupted.', properties: 'Counts as a +1 Light Weapon, dealing 1d4 edged damage. Especially effective against roots, vines, and the Hill Hunger.' },
      { name: 'Root-Heart Seed', desc: 'A warm black seed taken from the entity\'s heart.', properties: 'Can restore 4 Fatigue once or grow impossible crops; using it without resolving the pact risks corruption and morality loss.' },
      { name: 'Shrine Pact Stone', desc: 'A flat stone carved with the first famine contract.', properties: 'Grants +1 to Lore, Languages, or Divine Communion checks to break, redirect, or renegotiate the pact.' }
    ],
    settings: ['Golden Wheat Road', 'Choosing Feast Hall', 'Elder\'s Root Cellar', 'Hill Shrine', 'Root-Heart Chamber'],
    settingDescriptions: {
      'Golden Wheat Road': 'A road through impossible grain, buzzing flies, and drought beyond the field edge. Survival, Herbalism, and Perception reveal unnatural growth.',
      'Choosing Feast Hall': 'A warm hall of forced smiles, full plates, and one empty chair. Insight, Negotiation, and Deception can expose the selection ritual.',
      'Elder\'s Root Cellar': 'A cool cellar beneath Rowan\'s house, hiding ledgers and old bones behind barrels. Lockpicking, Perception, or Intimidation can uncover proof.',
      'Hill Shrine': 'A whitewashed shrine whose floorboards pulse like a throat. Divine Communion, Lore, or Heavy Weapons can open the way below.',
      'Root-Heart Chamber': 'A cavern of roots, soil, and golden light where the Hunger waits under the harvest. The pact can be fought, broken, continued, or redirected.'
    },
    rewards: {
      slay: [
        'Slay the Hunger: Blessed Sickle +1, strong morality gain, village food stores, and an uncertain future harvest.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      breakPact: [
        'Break the pact lawfully: Shrine Pact Stone, high morality gain, village loyalty from the innocent, and Lore/Negotiation reputation.',
        'Gain 1 skill point for a skill used during the adventure; Lore, Languages, or Divine Communion may earn a second restricted point.'
      ],
      continuePact: [
        'Continue the pact and choose a victim: large food supplies, village fear, high morality loss, and possible Root-Heart Seed.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      redirect: [
        'Redirect the Hunger toward monsters, bandits, or livestock: pragmatic reward, mixed morality, and recurring access to abundant rations.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  },
  {
    id: 'mirror_war_saint_orra',
    name: 'The Mirror War of Saint Orra',
    desc: 'A chapel mirror creates reflected doubles of villagers, some kinder and some crueler than the originals. Decide who deserves to remain.',
    element: 'aether',
    suggestedGm: 'oracle',
    artwork: oracleBanner,
    startingDay: 1,
    startingHour: 11.0,
    startingPrompt: 'Saint Orra\'s chapel is full of people arguing with themselves. A fisherman with a split lip claims his reflection is a better father. A child holds hands with two identical mothers. Behind the altar, a silver mirror ripples like water whenever anyone lies. The priest asks you to judge quickly before the doubles stop fading at dawn. Ask the player who they question first.',
    objectives: [
      'Investigate original villagers and reflected doubles.',
      'Learn what the Mirror of Saint Orra judges and why it has awakened.',
      'Prevent violence between originals and reflections.',
      'Choose whether to shatter, seal, judge, or use the mirror.'
    ],
    backstory: 'Saint Orra carried a mirror that reflected not the face, but the person a soul might become under different mercy. The chapel kept the relic covered for centuries until a desperate prayer uncovered it during a village scandal. Now reflections step out with their own memories, virtues, and crimes. Some doubles expose hidden abuse; others embody desires the originals barely resisted. The player must decide whether truth belongs to the first body, the better soul, the law, or whoever can survive dawn.',
    npcs: [
      {
        name: 'Father Elian',
        role: 'Chapel Priest',
        desc: 'A frightened priest trying to keep both originals and doubles from killing each other.',
        stats: {
          HP: 11,
          attributes: { Power: 1, Coordination: 2, Vigor: 1, Willpower: 4, Intellect: 3, Charisma: 3, Attunement: 2, Empathy: 5 },
          skills: { DivineCommunion: 4, Insight: 3, Negotiation: 3, Lore: 2, Healing: 1 },
          defenses: { dodge: 'Coordination d6 + Vigor d2', will: 'Willpower d10 + Empathy d6' },
          armor: 'None',
          attacks: [],
          equipment: ['Saint Orra\'s Veil', 'Chapel Key'],
          weaknesses: ['Cannot bring himself to condemn a reflection that shows virtue.']
        }
      },
      {
        name: 'Mara-Twice',
        role: 'Reflected Double',
        desc: 'A reflected mother who is gentler than the original and terrified of being erased.',
        stats: {
          HP: 12,
          attributes: { Power: 2, Coordination: 3, Vigor: 2, Willpower: 4, Intellect: 3, Charisma: 3, Attunement: 3, Empathy: 5 },
          skills: { Insight: 4, Negotiation: 3, Healing: 2, Deception: 2, DivineManifestation: 1 },
          defenses: { dodge: 'Coordination d8 + Vigor d2+1', will: 'Willpower d10 + Empathy d6' },
          armor: 'None',
          attacks: [{ name: 'Mirror Shard', skill: 'Light Weapons', damage: '1d4 edged', note: 'Only if cornered.' }],
          equipment: ['Mirror Shard', 'Child\'s Ribbon'],
          weaknesses: ['Fades in direct dawn light unless the mirror is judged or sealed.']
        }
      },
      {
        name: 'The Silver Contrary',
        role: 'Mirror Champion',
        desc: 'A perfect warrior-reflection that believes the mirror should replace the flawed village.',
        stats: {
          HP: 30,
          attributes: { Power: 4, Coordination: 5, Vigor: 4, Willpower: 5, Intellect: 3, Charisma: 3, Attunement: 5, Empathy: 1 },
          skills: { LightWeapons: 4, Acrobatics: 3, Blocking: 3, ArcaneShaping: 2, Intimidation: 2 },
          defenses: { dodge: 'Coordination d12 + Vigor d4+1 + 3d2', block: 'Power d10 + Coordination d6 + 3d2' },
          armor: 'Mirror mail, medium armor soak 1d4',
          attacks: [{ name: 'Silvered Rapier', skill: 'Light Weapons', damage: '1d6 piercing', note: 'Can split reflections on high-margin hit.' }],
          weaknesses: ['Covered mirror, Saint Orra\'s Veil, honest self-accusation, and Divine Manifestation.']
        }
      }
    ],
    items: ['Saint Orra\'s Veil', 'Mirror Shard Charm', 'Silvered Rapier +1', 'Reflection Testimony'],
    itemsDetail: [
      { name: 'Saint Orra\'s Veil', desc: 'A white veil embroidered with silver eyes.', properties: 'Can cover and seal the mirror. Grants +1 to Divine Communion or Insight checks involving truth, doubles, or judgment.' },
      { name: 'Mirror Shard Charm', desc: 'A harmless polished shard wrapped in thread.', properties: 'Once per adventure, grants +1 to Insight or Deception by showing a flicker of a possible self.' },
      { name: 'Silvered Rapier +1', desc: 'A mirror-bright rapier drawn from the reflection realm.', properties: 'Counts as a +1 Light Weapon. Deals 1d6 piercing damage and grants +1 to Light Weapons checks.' },
      { name: 'Reflection Testimony', desc: 'Conflicting statements from originals and doubles.', properties: 'Evidence item. Grants +1 to Negotiation, Insight, or Lore when resolving who remains.' }
    ],
    settings: ['Village Green', 'Saint Orra Chapel', 'Hall of Reflections', 'Vestry Archive', 'Dawn Mirror Threshold'],
    settingDescriptions: {
      'Village Green': 'Originals and doubles argue under watchful neighbors. Insight, Negotiation, Leadership, or Intimidation prevents mob violence.',
      'Saint Orra Chapel': 'The chapel smells of wax and rain, with the uncovered mirror behind the altar. Divine Communion, Lore, and Arcane Drawing reveal relic behavior.',
      'Hall of Reflections': 'A side hall where reflections repeat possible lives in silvered glass. Willpower, Insight, and Deception are tested by tempting visions.',
      'Vestry Archive': 'Old saint records and covered relics wait in dust. Languages, Lore, or Lockpicking can find Saint Orra\'s Veil and the original judgment rite.',
      'Dawn Mirror Threshold': 'At sunrise the mirror tries to make its choices permanent. The player can shatter, seal, judge, or exploit the final threshold.'
    },
    rewards: {
      shatter: [
        'Shatter the mirror: Mirror Shard Charm, morality gain if innocents are protected, and the doubling stops permanently.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      judge: [
        'Judge originals and doubles case by case: complex morality shifts, grateful survivors, Reflection Testimony, and potential ally.',
        'Gain 1 skill point for a skill used during the adventure; Insight or Negotiation may earn a second restricted point for a careful judgment.'
      ],
      seal: [
        'Seal the mirror: Saint Orra\'s Veil blessing, moderate morality gain, and the relic preserved for future study.',
        'Gain 1 skill point for a skill used during the adventure.'
      ],
      use: [
        'Use the mirror for infiltration or power: unique reflected contact or Silvered Rapier +1, morality loss, and future identity crisis.',
        'Gain 1 skill point for a skill used during the adventure.'
      ]
    }
  }
];

export const ADVENTURES_LIST = BASE_ADVENTURES_LIST.map((adventure) => ({
  ...adventure,
  ...(ADVENTURE_SETTING_METADATA[adventure.id] || {}),
}));
