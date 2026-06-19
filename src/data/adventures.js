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
      'Find the three missing children (Tam, Lira, Oswin) and escape the keep',
      'Get inside the keep (find a way past the locked gate)',
      'Understand the haunting of Ashveil Keep',
      'Deal with Malachar (re-imprison, partially destroy, or fully vanquish)'
    ],
    npcs: [
      { name: 'Vance', role: 'Forge Owner', desc: 'A grizzled retired watchman with a limp who is suspicious of the keep.' },
      { name: 'Martha', role: 'Provisioner', desc: 'Frantic widow whose nephew Oswin is one of the missing children.' },
      { name: 'Skritt', role: 'Goblin Boss', desc: 'Terrified and desperate goblin boss trapped by the curse.' },
      { name: 'Aldric Voss', role: 'Lord Ghost', desc: 'A ghostly knight bound by unfinished duty to contain Malachar.' }
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
    settings: ['Ashveil Village Square', 'Yew Graveyard', 'Great Hall', 'Lord\'s Study', 'Chapel', 'Prison Sub-Level']
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
      'Escape the Saltblood Mines alive',
      'Recover your confiscated equipment',
      'Find Old Bram',
      'Get the evidence (Threx\'s ledger and letters)'
    ],
    npcs: [
      { name: 'Sera', role: 'Former Guard Captain', desc: 'A captured guard captain nursing an injury, looking for a real escape plan.' },
      { name: 'Old Bram', role: 'Scholar prisoner', desc: 'A scholar studying the redvein ore and its long-term effects.' },
      { name: 'Kael', role: 'Young Thief', desc: 'A street thief who knows the mine layout and patrol gaps.' },
      { name: 'Mirra', role: 'Healer prisoner', desc: 'A village healer who helps the sick and injured in the barracks.' }
    ],
    items: [
      'Threx\'s Ledger',
      'Threx\'s Sealed Letter',
      'Flare Pouch',
      'Raw Redvein Ore',
      'Bram\'s Notebook'
    ],
    settings: ['Intake Cage', 'Prisoner Barracks', 'Processing Hall', 'Deep Redvein Vein', 'Threx\'s Office', 'Supply Depot']
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
      'Bypass the Volcanic Obsidian Gate',
      'Dampen the thermal vents using Vigor/Smithing checks',
      'Defeat the volcanic wardens guarding the threshold',
      'Retrieve the Fire Core from the elemental altar'
    ],
    npcs: [
      { name: 'Lothar the Smelter', role: 'Stonewright Blacksmith', desc: 'A gruff dwarf who knows the vault\'s layout and can forge heat-resistant clothing.' },
      { name: 'Aria the Flame-Speaker', role: 'Mage Scholar', desc: 'An expert in planar magic who can translate the runic console protecting the Core.' }
    ],
    items: ['Fire Core', 'Flame-ward Shield', 'Basalt Warhammer'],
    settings: ['Basalt Ridge Gatehouse', 'Sulfuric Vents Chamber', 'Molten Lava Tube', 'Altar of Ember']
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
      'Drain the flooded library atrium using physical/mechanical checks',
      'Decipher the ancient Elven scroll index using Lore/Intellect',
      'Avoid or disable the high-pressure tidal siphons',
      'Recover the Lost Archive of planar static'
    ],
    npcs: [
      { name: 'Vaelin Deep-Eye', role: 'Elven Archivist Ghost', desc: 'Haunts the library; will share ancient history if diplomacy/lore is checked.' },
      { name: 'Naelia the Diver', role: 'Scavenger Merchant', desc: 'Sells underwater breathing gear and draft maps of the flooded ruins.' }
    ],
    items: ['Lost Archive Scroll', 'Amulet of Tide-Taming', 'Water-Breathing Elixir'],
    settings: ['Flooded Library Entrance', 'Hall of Forgotten Runes', 'Tidal Siphon Junction', 'Planar Archives Sanctuary']
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
      'Navigate the high-altitude Windrunner Bridges safely using Acrobatics',
      'Realign the gravity anchor dials using Attunement checks',
      'Banish the vortex elementals blocking the bridge path',
      'Secure the Focal static Core at the high summit'
    ],
    npcs: [
      { name: 'Zephyr Gale-Rider', role: 'Cloud Skipper Captain', desc: 'Provides transport between floating bridges and knows cloud wind patterns.' },
      { name: 'Elder Oron', role: 'Aetherial Scholar', desc: 'Advises on planar gravity locks and alignment.' }
    ],
    items: ['Focal static core', 'Sky-Stalker Bow', 'Astral Gravity Compass'],
    settings: ['Windrunner Sky-Bridges', 'Floating Leyline Isles', 'Gravity Siphon Spires', 'Astral Focal Altar']
  }
];
