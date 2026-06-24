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
      'Disable or repair the rogue guardian automaton, Unit-7, in the Alchemical Lab.',
      'Retrieve the Stabilized Chrono-Core and install it in the central engine.',
      'Escape the conservatory before the boiler core suffers a catastrophic meltdown.'
    ],
    backstory: 'The glass-domed manor conservatory of Baron von Rictor, once a sanctuary of revolutionary alchemical botany and clockwork engineering, has fallen silent. The Baron sought to forge a mechanical heart to bypass his own failing mortality, but the installation went wrong. A mechanical alarm echoes through the steam-filled chambers, while the steam boilers are dangerously close to a catastrophic meltdown. You must enter, bypass the rogue guardian Unit-7, re-align the stellar astrolabe, and retrieve the Stabilized Chrono-Core to silence the sirens.',
    npcs: [
      { 
        name: 'Baron von Rictor', 
        role: 'Fading Clocksmith', 
        desc: 'His biological body lies comatose in the Chronos Vault. His consciousness is split, echoing through the brass intercom trumpets.',
        stats: { HP: 1, Willpower: 5, Intellect: 6, Special: 'Can adjust steam valves or unlock doors if reasoned with.' }
      },
      { 
        name: 'Unit-7 (Nanny)', 
        role: 'Rogue Guardian', 
        desc: 'A nine-foot-tall, copper-plated automaton with four scissor-like arms. Its maternal protection subroutines have corrupted into a manic drive to "disinfect and sanitize" all organic matter.',
        stats: { HP: 35, Defense: 16, Attacks: 'Scissor Snip (+3 Coordination, 2 Fatigue damage + Bleeding Tier 1 on hit), Steam Vent Spray (+2 Coordination, 3 fire damage, close range). Weakness: Lightning damage or oiling its gear pivots.' }
      },
      { 
        name: 'Pip', 
        role: 'Clockwork Helper', 
        desc: 'A small, brass spider-automaton. One of its copper legs is missing. If repaired, it can fit into tiny floor-grates to unlock locked chests or distract guards.',
        stats: { HP: 4, Stealth: 4, Lockpicking: 3, Special: 'Cannot attack directly.' }
      },
      { 
        name: 'Eleanor\'s Hologram', 
        role: 'Spectral Archivist', 
        desc: 'A blue light projection activated by the primary astrolabe. She holds the override sequence to the Chronos Vault but requires proof that her husband\'s suffering will end.',
        stats: { HP: 999, Intellect: 5, Special: 'Immune to physical damage. Can be disabled if the projecting lens is smashed or covered.' }
      }
    ],
    items: ['Sun Gear Key', 'Moon Gear Key', 'Star Gear Key', 'Aether-Wrench', 'Stabilized Chrono-Core', 'Von Rictor\'s Ledger', 'Tiny Copper Leg', 'Alchemical Acid Flask'],
    itemsDetail: [
      { name: 'Sun Gear Key', desc: 'A heavy golden-brass gear key engraved with solar rays. It is hot to the touch. Located in the Boiler Core Basement, held by a molten slag-heap.' },
      { name: 'Moon Gear Key', desc: 'A silver-plated crescent gear key. It emits a soft, cold light. Worn by Unit-7 as a brooch.' },
      { name: 'Star Gear Key', desc: 'A delicate, star-shaped brass gear key. It vibrates gently at a high frequency. Hidden inside the Queen Bee\'s hive in the Arboretum.' },
      { name: 'Aether-Wrench', desc: 'A specialized clocksmith\'s tool glowing with green light-emitting runes.', properties: 'Counts as a +1 Light Weapon. Can be used to safely tighten steam valves, disassemble automata, or lower mechanical check difficulties by one tier.' },
      { name: 'Stabilized Chrono-Core', desc: 'A humming sphere of tempered glass containing glowing blue sand.', properties: 'Can be installed in the central engine to stabilize the power, or used to reverse time to heal a player\'s HP by 5.' },
      { name: 'Von Rictor\'s Ledger', desc: 'A leather-bound notebook written in cipher.', properties: 'If translated (requires Languages or Intellect check), it reveals Unit-7\'s shut-down phrase ("Aethelgard-9") and the planetary alignment code (Sun: 45, Moon: 90, Star: 180).' },
      { name: 'Tiny Copper Leg', desc: 'A spare mechanical part found on a workbench in the Alchemical Lab.', properties: 'Can be given to Pip to recruit him as a helper.' },
      { name: 'Alchemical Acid Flask', desc: 'A flask of highly corrosive green fluid.', properties: 'Can be thrown as a weapon (+2 coordination, melts armor of Unit-7, or dissolves rusted door locks).' }
    ],
    settings: ['The Brass Rotunda', 'The Steam-Weaving Gallery', 'The Clockwork Arboretum', 'The Alchemical Lab', 'The Chronos Vault', 'The Boiler Core Basement'],
    settingDescriptions: {
      'The Brass Rotunda': 'The main entrance of the conservatory. A massive, three-tiered copper astrolabe sits in the center, spinning erratically and locking the steam valves. Brass megaphone horns on the stone walls hiss with steam and echo the Baron\'s fading warnings. Locked iron gates block passage to the east.',
      'The Steam-Weaving Gallery': 'A long, claustrophobic stone corridor where steam pipes have ruptured. Blasts of scalding white steam vent in rhythmic intervals. Traversing without shutting the valves requires a coordination check or heat protection. A frozen clockwork watchman stands in the center, holding a key.',
      'The Clockwork Arboretum': 'Under a cracked glass dome, copper-leaved trees and mechanical brass roses bloom. Copper-winged mechanical bees buzz around brass hives, collecting mercury nectar. They are hostile to anyone harvesting the plants. The Star Gear Key is hidden inside the queen bee\'s hive.',
      'The Alchemical Lab': 'A cluttered workshop smelling of ozone, mercury, and sulfur. Beakers of green acid bubbled on iron racks. Guarded by the rampaging Unit-7, who patrols the room cleaning tables and attacking intruders. The Moon Gear Key is mounted on Unit-7\'s chest as a decorative brooch.',
      'The Chronos Vault': 'A heavy, airtight vault door leads here from the Rotunda. Inside, Baron von Rictor\'s comatose body is suspended in a glass chamber filled with life-sustaining fluid, wired into a massive brass engine. The engine core is fracturing, venting blue planar static. The Stabilized Chrono-Core hums in the center altar.',
      'The Boiler Core Basement': 'A red-hot basement chamber filled with roaring fire tubes and massive iron boilers. Pressure gauges are in the red zone. Ruptured valves leak boiling water. A manual emergency steam release wheel is jammed with a rusted iron bar.'
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
      'Retrieve the Frostfire Heart from Kaelen-Ghar\'s sarcophagus.',
      'Contain the awakening Frostfire Wraith before the tomb collapses.'
    ],
    backstory: 'The Frostfire Crypt was built three centuries ago to inter Kaelen-Ghar, a warlord who bound a fire elemental into a heart of glacial ice. This fusion created \'frostfire\'—a cold, blue flame that burns without heat but freezes everything it touches. The containment runes have begun to crack due to the shifting glacier above. If the frostfire heart fully escapes its vessel, it will freeze the entire Frostglen valley into a permanent ice wasteland. You must reseal the heart or destroy the warlord\'s wraith.',
    npcs: [
      { 
        name: 'Theron the Scribe', 
        role: 'Dying Explorer', 
        desc: 'A scholar who led the expedition to the crypt. He is suffering from hypothermia and frostbite, and can provide a map if warmed or healed.',
        stats: { HP: 2, Willpower: 3, Intellect: 4, Special: 'Exhausted and near death. Holds Theron\'s Map.' }
      },
      { 
        name: 'Kaelen-Ghar (Wraith)', 
        role: 'Frostfire Warlord', 
        desc: 'The spectral form of the warlord, wielding a frostfire glaive. He seeks to freeze his intruders and reclaim his corporeal form.',
        stats: { HP: 40, Defense: 14, Attacks: 'Frostfire Glaive (+3 Coordination, 3 Fatigue damage + Frozen status on hit), Freezing Howl (+2 Willpower, 2 damage to all in room). Weakness: Fire damage or shattering the blue crystals in the room.' }
      },
      { 
        name: 'Frostbite Spiders', 
        role: 'Glacial Predators', 
        desc: 'Large, pale blue spiders that spit freezing venom.',
        stats: { HP: 12, Defense: 12, Attacks: 'Freezing Bite (+2 Coordination, 1 HP damage + Bleeding Tier 1). Weakness: Torchlight or open flames.' }
      },
      { 
        name: 'The Guardian Golem', 
        role: 'Clockwork Ice Warden', 
        desc: 'A golem constructed of compacted ice and runic iron, protecting the reliquary keys.',
        stats: { HP: 25, Defense: 15, Attacks: 'Glacial Slam (+3 Power, 4 Fatigue damage). Weakness: Vulnerable to alchemical acid or high heat.' }
      }
    ],
    items: ['Twin Embers Pouch', 'Frostfire Heart', 'Runic Ice-Chisel', 'Theron\'s Map', 'Freezing Venom Vial', 'Runic Tablet Translation'],
    itemsDetail: [
      { name: 'Twin Embers Pouch', desc: 'A pouch containing two glowing, heat-generating sulfurous charcoal blocks. Can be used to light the braziers or warm up Theron.' },
      { name: 'Frostfire Heart', desc: 'The legendary ice-encased heart of Kaelen-Ghar. It glows with a freezing blue light.' },
      { name: 'Runic Ice-Chisel', desc: 'A chisel made of reinforced steel, engraved with runes of shattering.', properties: 'Counts as a +1 Light Weapon. Grants a +2 bonus to physical checks to shatter ice walls or lock mechanisms.' },
      { name: 'Theron\'s Map', desc: 'A damp parchment map of the crypt showing the hidden path to Kaelen-Ghar\'s sarcophagus and the trap switch locations.' },
      { name: 'Freezing Venom Vial', desc: 'A vial of venom harvested from the ice-spiders.', properties: 'Can be applied to weapons to add the Frozen status to targets on hit.' },
      { name: 'Runic Tablet Translation', desc: 'A translation sheet containing the ancient cryo-runic alphabet.', properties: 'Allows easy translation of the catacomb walls without triggering traps.' }
    ],
    settings: ['The Runic Vestibule', 'The Sunken Reliquary', 'The Glyphed Catacombs', 'The Glacial Reach', 'The Sarcophagus Chamber', 'The Core Vault'],
    settingDescriptions: {
      'The Runic Vestibule': 'The entrance chamber featuring the twin thermal braziers, the massive sealed vault door, and the comatose explorer Theron.',
      'The Sunken Reliquary': 'A damp, frozen basement beneath the vestibule. Eerie blue light shines through the ice walls. Thick, frost-dusted spiderwebs hang from the wooden ceiling beams. A stone chest sits in the center, guarded by pale spiders.',
      'The Glyphed Catacombs': 'A series of stone alcoves containing standing sarcophagi. The walls are carved with glowing blue glyphs that thrum with planar magic. Inspecting them without translating first triggers a cold blast trap.',
      'The Glacial Reach': 'A narrow corridor where massive ice pendulums swing back and forth from the ceiling. The floor is covered in crushed bones and shattered ice plates. A lever to stop the pendulums is visible on the far side.',
      'The Sarcophagus Chamber': 'A vast dome of blue ice. In the center, Kaelen-Ghar\'s iron-banded sarcophagus rests on a raised altar. Four large frostfire crystals glow intensely, channeling cold energy into the warlord\'s sleeping wraith.',
      'The Core Vault': 'The heart of the tomb\'s magical containment. A circular pit in the floor contains a spinning iron gyro that holds the Frostfire Heart. If the gyro stops spinning, the cold energy will explode.'
    }
  }
];

