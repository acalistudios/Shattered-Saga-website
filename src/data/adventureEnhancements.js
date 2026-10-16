// Generated adventure room choices and deterministic image paths.
// Edit source adventure settings first, then regenerate this file if rooms change.
import { ADVENTURE_CHOICE_DIFFICULTY_CURVES, ADVENTURE_PROGRESSION_METADATA } from './adventureProgression';

const applyChoiceDifficultyCurve = (metadata) => Object.fromEntries(
  Object.entries(metadata).map(([adventureId, adventureMetadata]) => {
    const tier = ADVENTURE_PROGRESSION_METADATA[adventureId]?.tier || 1;
    const curve = ADVENTURE_CHOICE_DIFFICULTY_CURVES[tier] || ADVENTURE_CHOICE_DIFFICULTY_CURVES[1];

    const settingChoices = Object.fromEntries(
      Object.entries(adventureMetadata.settingChoices || {}).map(([settingName, choices]) => [
        settingName,
        choices.map((choice, index) => ({
          ...choice,
          difficulty: curve[index] || curve[curve.length - 1],
        })),
      ]),
    );

    return [adventureId, { ...adventureMetadata, settingChoices }];
  }),
);


const BASE_ADVENTURE_SETTING_METADATA = {
  "elemental_crucible": {
    settingChoices: {
      "Fivefold Gate": [
        { text: "Turn the massive five-spoke granite wheel to align the elemental conduits", skill: "athletics", intent: "utility" },
        { text: "Decipher the ancient glyphs detailing the sacred balancing oaths of the Five Virtues", skill: "lore", intent: "investigate" },
        { text: "Kneel before the central altar to invoke the blessing of the primordial architects", skill: "divine_communion", intent: "magic" }
      ],
      "Cinder Trial Grove": [
        { text: "Shape and redirect the spreading wildfire currents away from trapped flame-seed pods", skill: "arcane_shaping", intent: "magic" },
        { text: "Endure searing heat and suffocation while forging a clear path through smoking ash", skill: "survival", intent: "travel" },
        { text: "Bow in calm submission before the fiery Cinder Stag to prove your spirit lacks cruelty", skill: "animal_rapport", intent: "social" }
      ],
      "Granite Burden Hall": [
        { text: "Brace your shield beneath a dropping stone monolith to shield an exposed shrine alcove", skill: "blocking", intent: "combat" },
        { text: "Wedge steel chisels into stress fractures to stabilize the shifting granite vault pillars", skill: "smithing", intent: "utility" },
        { text: "Lift and carry the heavy basalt burden stone across the hall without letting it touch earth", skill: "athletics", intent: "utility" }
      ],
      "Skyblind Walk": [
        { text: "Cross the narrow crumbling bridge through buffeting gale winds with flawless balance", skill: "acrobatics", intent: "travel" },
        { text: "Listen for whistling gale currents amidst blinding fog to gauge your footing", skill: "perception", intent: "investigate" },
        { text: "Trust your instincts and leap across collapsing aether void stepping stones", skill: "luck", intent: "travel" }
      ],
      "Tide Memory Pool": [
        { text: "Channel soothing vitality into the pool to heal phantom injuries reflected on the water", skill: "healing", intent: "magic" },
        { text: "Stare into your own worst regret without flinching to dissolve the phantom guilt tide", skill: "insight", intent: "investigate" },
        { text: "Weep with honest sorrow for those you could not save, calming the turbulent depths", skill: "divine_communion", intent: "magic" }
      ],
      "Aether Thread Nave": [
        { text: "Draw violet aether mana threads through your body without allowing the weave to fray", skill: "arcane_drawing", intent: "magic" },
        { text: "Read the overlapping chronomantic text inscribed along threads of starlight", skill: "languages", intent: "investigate" },
        { text: "Confound your own astral reflection by cloaking your thoughts in disciplined silence", skill: "deception", intent: "stealth" }
      ],
      "Mirror of Affinity": [
        { text: "Parry and disarm the duplicate reflection in a flawless display of blade precision", skill: "light_weapons", intent: "combat" },
        { text: "Channel radiant primordial equilibrium to shatter the dark mirror manifestation", skill: "divine_manifestation", intent: "magic" },
        { text: "Affirm your moral duty before the ancient font, mastering your elemental awakening", skill: "leadership", intent: "social" }
      ],
    },
    settingImages: {
      "Fivefold Gate": "/images/adventures/elemental_crucible/fivefold_gate.webp",
      "Cinder Trial Grove": "/images/adventures/elemental_crucible/cinder_trial_grove.webp",
      "Granite Burden Hall": "/images/adventures/elemental_crucible/granite_burden_hall.webp",
      "Skyblind Walk": "/images/adventures/elemental_crucible/skyblind_walk.webp",
      "Tide Memory Pool": "/images/adventures/elemental_crucible/tide_memory_pool.webp",
      "Aether Thread Nave": "/images/adventures/elemental_crucible/aether_thread_nave.webp",
      "Mirror of Affinity": "/images/adventures/elemental_crucible/mirror_of_affinity.webp",
    },
  },
  "ashveil_keep": {
    settingChoices: {
      "Ashveil Village Square": [
        { text: "Ask Martha where Oswin and the other children were last seen", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Ask Vance what he knows about the keep and its old defenses", skill: "negotiation", difficulty: "professional", intent: "social" },
        { text: "Look for the children's tracks on the hill road toward the graveyard", skill: "tracking", difficulty: "professional", intent: "investigate" },
      ],
      "Yew Graveyard": [
        { text: "Search among the mossy tombs for the hidden crypt tunnel into the keep", skill: "perception", difficulty: "novice", intent: "investigate" },
        { text: "Track the children's footprints in the damp earth past the ancient yews", skill: "tracking", difficulty: "novice", intent: "investigate" },
        { text: "Say a blessing over the disturbed graves to calm restless spirits", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Great Hall": [
        { text: "Use shattered banquet tables and shadows for cover to bypass the goblins", skill: "stealth", difficulty: "novice", intent: "stealth" },
        { text: "Offer rations and safe passage to soothe Skritt's panic and win him over as an ally", skill: "negotiation", difficulty: "novice", intent: "social" },
        { text: "Read the crumbling hall structure for weak stones or alternative passages", skill: "survival", difficulty: "professional", intent: "investigate" },
      ],
      "Lord's Study": [
        { text: "Pick open the locked desk drawer to search for Lord Aldric's Signet Ring", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Decipher the cult journals to discover Malachar's true origin and weaknesses", skill: "lore", difficulty: "novice", intent: "investigate" },
        { text: "Search the room carefully for secret wall compartments behind the tapestries", skill: "perception", difficulty: "novice", intent: "investigate" },
      ],
      "Chapel": [
        { text: "Search the altar for vials of Holy Water and the Binding Prayer Scroll", skill: "perception", difficulty: "novice", intent: "investigate" },
        { text: "Offer a respectful prayer to consecrate your spirit against shadow whispers", skill: "divine_communion", difficulty: "novice", intent: "magic" },
        { text: "Examine the holy carvings to learn how the original seal was anchored", skill: "lore", difficulty: "professional", intent: "investigate" },
      ],
      "Prison Sub-Level": [
        { text: "Invoke Lord Aldric's sacred oath with his Signet Ring to shield the children", skill: "leadership", difficulty: "novice", intent: "social" },
        { text: "Drive Vance's consecrated wedge into the fracturing seal keystone to anchor the binding", skill: "athletics", difficulty: "novice", intent: "utility" },
        { text: "Channel the Binding Prayer Scroll and Seal Tile to re-bind Malachar into the floor", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
    },
    settingImages: {
      "Ashveil Village Square": "/images/adventures/ashveil_keep/ashveil_village_square.webp",
      "Yew Graveyard": "/images/adventures/ashveil_keep/yew_graveyard.webp",
      "Great Hall": "/images/adventures/ashveil_keep/great_hall.webp",
      "Lord's Study": "/images/adventures/ashveil_keep/lord_s_study.webp",
      "Chapel": "/images/adventures/ashveil_keep/chapel.webp",
      "Prison Sub-Level": "/images/adventures/ashveil_keep/prison_sub_level.webp",
    },
  },
  "saltblood_mines": {
    settingChoices: {
      "Intake Cage": [
        { text: "Contort and dislocate wrists to slip free from the heavy iron intake manacles", skill: "escapology", intent: "stealth" },
        { text: "Heave with raw strength against the rusted cage bars to force an opening", skill: "athletics", intent: "utility" },
        { text: "Feign violent fever and agony to lure the intake warden close to the bars", skill: "deception", intent: "social" }
      ],
      "Prisoner Barracks": [
        { text: "Subdue an abusive trustee in a silent chokehold to seize their brass key ring", skill: "brawling", intent: "combat" },
        { text: "Chisel and sharpen scrap iron mining spikes into serviceable improvised daggers", skill: "smithing", intent: "utility" },
        { text: "Rally the exhausted miners with a whispered plan to coordinate a simultaneous revolt", skill: "leadership", intent: "social" }
      ],
      "Processing Hall": [
        { text: "Ambush the patrolling overseers with swinging pickaxes and iron crowbars", skill: "heavy_weapons", intent: "combat" },
        { text: "Dart between rattling ore crushers and steam plumes to slip past guards unnoticed", skill: "stealth", intent: "stealth" },
        { text: "Bribe a corrupt overseer with smuggled salt crystals for passage through the sorting gate", skill: "negotiation", intent: "social" }
      ],
      "Deep Redvein Vein": [
        { text: "Snatch a dropped guard crossbow and sever the hoist counterweight rope from distance", skill: "marksmanship", intent: "combat" },
        { text: "Distill flammable redvein dust and lantern oil into an explosive breaching paste", skill: "alchemy", intent: "utility" },
        { text: "Read the creaking rock strata and shore up trembling timber supports to avert a cave-in", skill: "survival", intent: "travel" }
      ],
      "Threx's Office": [
        { text: "Kick in the office door and confront Overseer Threx in a direct melee duel", skill: "heavy_weapons", intent: "combat" },
        { text: "Pick the heavy iron vault safe to reclaim confiscated adventurer equipment and maps", skill: "lockpicking", intent: "utility" },
        { text: "Brandish the rising roar of the miner rebellion to demand Threx surrender unconditionally", skill: "intimidation", intent: "social" }
      ],
      "Supply Depot": [
        { text: "Form a shield wall with mining carts and iron lids to absorb the guards' crossbow volley", skill: "blocking", intent: "combat" },
        { text: "Bandage crushed limbs and treat burns on wounded miners before making the break", skill: "healing", intent: "utility" },
        { text: "Batter down the reinforced heavy oak egress gate before the blast doors slam shut", skill: "athletics", intent: "utility" }
      ],
    },
    settingImages: {
      "Intake Cage": "/images/adventures/saltblood_mines/intake_cage.webp",
      "Prisoner Barracks": "/images/adventures/saltblood_mines/prisoner_barracks.webp",
      "Processing Hall": "/images/adventures/saltblood_mines/processing_hall.webp",
      "Deep Redvein Vein": "/images/adventures/saltblood_mines/deep_redvein_vein.webp",
      "Threx's Office": "/images/adventures/saltblood_mines/threx_s_office.webp",
      "Supply Depot": "/images/adventures/saltblood_mines/supply_depot.webp",
    },
  },
  "obsidian_vault": {
    settingChoices: {
      "Basalt Ridge Gatehouse": [
        { text: "Loose heavy bodkin arrows across the magma moat to snap the gatehouse winch chains", skill: "marksmanship", intent: "combat" },
        { text: "Withstand the suffocating volcanic sulfur vents by packing cloth with charcoal", skill: "survival", intent: "travel" },
        { text: "Identify the hairline cracks in the basalt ledge before stepping onto brittle rock", skill: "perception", intent: "investigate" }
      ],
      "Sulfuric Vents Chamber": [
        { text: "Raise a fire-treated shield to shelter against erupting geysers of superheated magma", skill: "blocking", intent: "combat" },
        { text: "Roll massive basalt boulders into erupting fissures to create a passable causeway", skill: "athletics", intent: "utility" },
        { text: "Combine volcanic sulfur and brimstone to synthesize a heat-resistant skin balm", skill: "alchemy", intent: "utility" }
      ],
      "Molten Lava Tube": [
        { text: "Leap across sinking pumice stepping stones over a river of glowing molten rock", skill: "acrobatics", intent: "travel" },
        { text: "Creep quietly along the darkened obsidian shelf past sleeping basalt golems", skill: "stealth", intent: "stealth" },
        { text: "Survive a sudden ceiling cave-in by diving instinctively into a cooling magma alcove", skill: "luck", intent: "travel" }
      ],
      "Altar of Ember": [
        { text: "Bury a chilled heavy weapon deep into Ember Maw's cooled magma chest fissure", skill: "heavy_weapons", intent: "combat" },
        { text: "Drain and ground the raging elemental fire font into an empty mana vessel", skill: "arcane_drawing", intent: "magic" },
        { text: "Scatter cryo-crystals to induce thermal shock and force the fire beast into dormancy", skill: "survival", intent: "utility" }
      ],
    },
    settingImages: {
      "Basalt Ridge Gatehouse": "/images/adventures/obsidian_vault/basalt_ridge_gatehouse.webp",
      "Sulfuric Vents Chamber": "/images/adventures/obsidian_vault/sulfuric_vents_chamber.webp",
      "Molten Lava Tube": "/images/adventures/obsidian_vault/molten_lava_tube.webp",
      "Altar of Ember": "/images/adventures/obsidian_vault/altar_of_ember.webp",
    },
  },
  "sunken_spire": {
    settingChoices: {
      "Flooded Library Entrance": [
        { text: "Dive through churning tidal undertows to swim down into the submerged entrance rotunda", skill: "athletics", intent: "travel" },
        { text: "Assemble airtight waxed-leather breathing tubes from salvaged laboratory scrap", skill: "crafting", intent: "utility" },
        { text: "Identify glowing ancient warning runes that indicate high-pressure water surges", skill: "perception", intent: "investigate" }
      ],
      "Hall of Forgotten Runes": [
        { text: "Decipher submerged elven planar treaties engraved along the tide-washed ceiling", skill: "languages", intent: "investigate" },
        { text: "Cross-reference celestial star charts with historical records of the great cataclysm", skill: "lore", intent: "investigate" },
        { text: "Siphon flooded water-mana into crystals to power the drainage conduits", skill: "arcane_drawing", intent: "magic" }
      ],
      "Tidal Siphon Junction": [
        { text: "Override the complex bronze pressure valves to reverse the flooding siphons", skill: "trapping", intent: "utility" },
        { text: "Hammer and weld a jammed brass gear shaft to restore the emergency drainage pumps", skill: "smithing", intent: "utility" },
        { text: "Scramble across slippery, vibrating high-pressure bronze conduits over the whirlpool", skill: "acrobatics", intent: "travel" }
      ],
      "Planar Archives Sanctuary": [
        { text: "Demonstrate deep scholarly respect to convince archivist ghost Vaelin to yield his secrets", skill: "insight", intent: "social" },
        { text: "Catalog and evaluate the rarest illuminated scrolls before water degrades the vellum", skill: "appraise", intent: "investigate" },
        { text: "Offer a solemn sanctification prayer to release Vaelin from his eternal vigil", skill: "divine_communion", intent: "magic" }
      ],
    },
    settingImages: {
      "Flooded Library Entrance": "/images/adventures/sunken_spire/flooded_library_entrance.webp",
      "Hall of Forgotten Runes": "/images/adventures/sunken_spire/hall_of_forgotten_runes.webp",
      "Tidal Siphon Junction": "/images/adventures/sunken_spire/tidal_siphon_junction.webp",
      "Planar Archives Sanctuary": "/images/adventures/sunken_spire/planar_archives_sanctuary.webp",
    },
  },
  "astral_sky": {
    settingChoices: {
      "Windrunner Sky-Bridges": [
        { text: "Sprint and leap across free-floating astral boulders across endless empty sky", skill: "acrobatics", intent: "travel" },
        { text: "Haul a massive drifting sky-anchor chain to lash floating islands together", skill: "athletics", intent: "utility" },
        { text: "Predict the shifting rhythm of reverse-gravity pulses before you are cast adrift", skill: "perception", intent: "investigate" }
      ],
      "Floating Leyline Isles": [
        { text: "Siphon raging raw violet aether mana from the exposed planetary leyline rift", skill: "arcane_drawing", intent: "magic" },
        { text: "Loose enchanted tether-arrows into floating debris to reel yourself across voids", skill: "marksmanship", intent: "combat" },
        { text: "Anchor yourself firmly against howling void winds that freeze breath into stardust", skill: "survival", intent: "travel" }
      ],
      "Gravity Siphon Spires": [
        { text: "Weave and knot the frayed gravity filaments to stabilize the crumbling spire", skill: "arcane_shaping", intent: "magic" },
        { text: "Survive a terrifying drop into the abyss by grabbing an astral updraft at the last second", skill: "luck", intent: "travel" },
        { text: "Disarm the cosmic alignment clamps that threaten to invert the world's gravity", skill: "trapping", intent: "utility" }
      ],
      "Astral Focal Altar": [
        { text: "Drive an aether-forged greatsword through the swirling eye of the vortex elemental", skill: "heavy_weapons", intent: "combat" },
        { text: "Anchor physical reality to the altar with an unshakeable prayer of consecration", skill: "divine_manifestation", intent: "magic" },
        { text: "Ride the vortex gale currents in a spiraling glide onto the central focal altar", skill: "acrobatics", intent: "travel" }
      ],
    },
    settingImages: {
      "Windrunner Sky-Bridges": "/images/adventures/astral_sky/windrunner_sky_bridges.webp",
      "Floating Leyline Isles": "/images/adventures/astral_sky/floating_leyline_isles.webp",
      "Gravity Siphon Spires": "/images/adventures/astral_sky/gravity_siphon_spires.webp",
      "Astral Focal Altar": "/images/adventures/astral_sky/astral_focal_altar.webp",
    },
  },
  "clockwork_conservatory": {
    settingChoices: {
      "The Brass Rotunda": [
        { text: "Jam the intermeshed floor gears using steel rods before the blade array triggers", skill: "trapping", intent: "utility" },
        { text: "Reassemble the fractured brass gear train on the central control pedestal", skill: "crafting", intent: "utility" },
        { text: "Listen to the clicking cadence of the walls to pinpoint the safe entry quadrant", skill: "perception", intent: "investigate" }
      ],
      "The Steam-Weaving Gallery": [
        { text: "Tumble across swinging steam-powered pistons and overhead catwalks", skill: "acrobatics", intent: "travel" },
        { text: "Wrench shut the scalding bronze emergency steam valves despite blistering heat", skill: "athletics", intent: "utility" },
        { text: "Sever the high-tension bronze drive cables powering the runaway loom blades", skill: "smithing", intent: "combat" }
      ],
      "The Clockwork Arboretum": [
        { text: "Mimic harmonic frequencies to calm the razor-beaked brass songbirds in the trees", skill: "animal_rapport", intent: "social" },
        { text: "Harvest fire-resistant alchemical moss thriving on the warm copper pipes", skill: "herbalism", intent: "utility" },
        { text: "Creep beneath the mechanical foliage to slip past the clockwork mantis sentry", skill: "stealth", intent: "stealth" }
      ],
      "The Alchemical Lab": [
        { text: "Compound an acidic solvent to dissolve the hardened clockwork resin sealing the vault", skill: "alchemy", intent: "utility" },
        { text: "Identify volatile vials of pure liquid chronotite among hundreds of common reagents", skill: "appraise", intent: "investigate" },
        { text: "Translate the chief artificer's ciphered blueprints for the main regulator", skill: "languages", intent: "investigate" }
      ],
      "The Chronos Vault": [
        { text: "Slip through the narrowing cage bars of the descending pendulum time trap", skill: "escapology", intent: "stealth" },
        { text: "Align the seven-stage celestial chronometer lock to open the vault sanctuary", skill: "lockpicking", intent: "utility" },
        { text: "Dispel the pulsating temporal static field that distorts physical motion", skill: "arcane_shaping", intent: "magic" }
      ],
      "The Boiler Core Basement": [
        { text: "Smash the steam-intake pistons powering Unit-7's relentless scissor strikes", skill: "heavy_weapons", intent: "combat" },
        { text: "Surgically reach into the core to disconnect the rogue maternal directive cog", skill: "crafting", intent: "utility" },
        { text: "Whistle the creator's gentle music-box tune to halt Unit-7's combat protocols", skill: "performance", intent: "social" }
      ],
    },
    settingImages: {
      "The Brass Rotunda": "/images/adventures/clockwork_conservatory/the_brass_rotunda.webp",
      "The Steam-Weaving Gallery": "/images/adventures/clockwork_conservatory/the_steam_weaving_gallery.webp",
      "The Clockwork Arboretum": "/images/adventures/clockwork_conservatory/the_clockwork_arboretum.webp",
      "The Alchemical Lab": "/images/adventures/clockwork_conservatory/the_alchemical_lab.webp",
      "The Chronos Vault": "/images/adventures/clockwork_conservatory/the_chronos_vault.webp",
      "The Boiler Core Basement": "/images/adventures/clockwork_conservatory/the_boiler_core_basement.webp",
    },
  },
  "frostfire_crypt": {
    settingChoices: {
      "The Runic Vestibule": [
        { text: "Endure the sub-zero frostfire chill by keeping blood moving and sheltering in stone alcoves", skill: "survival", intent: "travel" },
        { text: "Ignite the twin bronze thermal braziers using volatile alchemical ignition powder", skill: "alchemy", intent: "utility" },
        { text: "Decipher ancient cryo-runes warning how to melt the sealed vault of Warlord Kaelen", skill: "languages", intent: "investigate" }
      ],
      "The Sunken Reliquary": [
        { text: "Snipe frost-spiders clinging to high blue ice stalactites before they pounce", skill: "marksmanship", intent: "combat" },
        { text: "Clamber up the sheer glazed ice steps leading to the upper reliquary balcony", skill: "athletics", intent: "travel" },
        { text: "Spot the submerged blue crystal heart glowing beneath twenty feet of clear ice", skill: "perception", intent: "investigate" }
      ],
      "The Glyphed Catacombs": [
        { text: "Read the containment litany required to bind the Frostfire Wraith back into his tomb", skill: "lore", intent: "investigate" },
        { text: "Reforge the severed links of the consecrated brazier suspension chain", skill: "smithing", intent: "utility" },
        { text: "Commune with the dying scholar Theron to receive his map and dying warning", skill: "divine_communion", intent: "magic" }
      ],
      "The Glacial Reach": [
        { text: "Raise your shield to deflect massive falling ice stalactites shaken loose by tremors", skill: "blocking", intent: "combat" },
        { text: "Time your sprint between swinging frost-bladed pendulums slick with rimed ice", skill: "acrobatics", intent: "travel" },
        { text: "Wedge steel spikes into the pendulum gear mechanisms to lock them in place", skill: "trapping", intent: "utility" }
      ],
      "The Sarcophagus Chamber": [
        { text: "Smash apart the five-foot thick glacial ice seal encasing Kaelen's sarcophagus", skill: "heavy_weapons", intent: "combat" },
        { text: "Pick the frost-fused runic latch securing the warlord's heavy stone lid", skill: "lockpicking", intent: "utility" },
        { text: "Creep past the freezing mist sentries without alerting the dormant wraith guard", skill: "stealth", intent: "stealth" }
      ],
      "The Core Vault": [
        { text: "Engage Warlord Kaelen-Ghar in an epic clash of greatsword against frostfire glaive", skill: "heavy_weapons", intent: "combat" },
        { text: "Channel radiant holy fire to purge the wraith's blue flames and melt his armor", skill: "divine_manifestation", intent: "magic" },
        { text: "Rally your companions with an unyielding battle cry to resist Kaelen's Freezing Howl", skill: "leadership", intent: "social" }
      ],
    },
    settingImages: {
      "The Runic Vestibule": "/images/adventures/frostfire_crypt/the_runic_vestibule.webp",
      "The Sunken Reliquary": "/images/adventures/frostfire_crypt/the_sunken_reliquary.webp",
      "The Glyphed Catacombs": "/images/adventures/frostfire_crypt/the_glyphed_catacombs.webp",
      "The Glacial Reach": "/images/adventures/frostfire_crypt/the_glacial_reach.webp",
      "The Sarcophagus Chamber": "/images/adventures/frostfire_crypt/the_sarcophagus_chamber.webp",
      "The Core Vault": "/images/adventures/frostfire_crypt/the_core_vault.webp",
    },
  },
  "iron_colosseum": {
    settingChoices: {
      "Slave Pens": [
        { text: "Knock out the arrogant pit bruiser in a ruthless display of bare-knuckle violence", skill: "brawling", intent: "combat" },
        { text: "Pick apart welded iron manacles using a concealed sliver of spring steel", skill: "escapology", intent: "stealth" },
        { text: "Unite warring barbarian and mercenary gladiators to plan a unified arena revolt", skill: "leadership", intent: "social" }
      ],
      "Training Sand": [
        { text: "Deflect the brutal thrusts of the gladitorial master's spiked trident", skill: "blocking", intent: "combat" },
        { text: "Demonstrate overwhelming martial dominance with sweeping greatsword forms", skill: "heavy_weapons", intent: "combat" },
        { text: "Stare down the arena overseers until they step back from the pit gate", skill: "intimidation", intent: "social" }
      ],
      "Beast Gate Underworks": [
        { text: "Subdue the famished arena hydra by whispering soothing beast-calls", skill: "animal_rapport", intent: "social" },
        { text: "Hurl a weighted trident or grappling chain across the pit to jam the beast gate winch", skill: "thrown_weapons", intent: "combat" },
        { text: "Pick the kennel master's pouch to secure the master beast-gate release key", skill: "thievery", intent: "stealth" }
      ],
      "Noble Gallery": [
        { text: "Rouse the bloodthirsty arena crowd with theatrical boasts to turn them against the magistrate", skill: "performance", intent: "social" },
        { text: "Disguise as an imperial victor's herald to stroll past the elite Praetorian guards", skill: "deception", intent: "social" },
        { text: "Spot the corrupt betting lord paying off the gatekeepers to rig the final deathmatch", skill: "insight", intent: "investigate" }
      ],
      "Champion Dais": [
        { text: "Trade thunderous blow for blow with Champion Durn's colossal spiked maul", skill: "heavy_weapons", intent: "combat" },
        { text: "Weave under Durn's heavy swings to sever his armor straps with surgical rapier thrusts", skill: "light_weapons", intent: "combat" },
        { text: "Force the battered champion to submit in front of thirty thousand roaring citizens", skill: "intimidation", intent: "social" }
      ],
    },
    settingImages: {
      "Slave Pens": "/images/adventures/iron_colosseum/slave_pens.webp",
      "Training Sand": "/images/adventures/iron_colosseum/training_sand.webp",
      "Beast Gate Underworks": "/images/adventures/iron_colosseum/beast_gate_underworks.webp",
      "Noble Gallery": "/images/adventures/iron_colosseum/noble_gallery.webp",
      "Champion Dais": "/images/adventures/iron_colosseum/champion_dais.webp",
    },
  },
  "blackroot_hollow": {
    settingChoices: {
      "Blackroot Village Edge": [
        { text: "Hurl balanced hunting daggers or torches into the canopy shadows to pick off scout spiders", skill: "thrown_weapons", intent: "combat" },
        { text: "Harvest pungent wild pennyroyal and sulfur-weed to brew a repellent skin salve", skill: "herbalism", intent: "utility" },
        { text: "Soothe terrified carriage horses and guide them safely away from webbed tree trunks", skill: "animal_rapport", intent: "social" }
      ],
      "Abandoned Mine Mouth": [
        { text: "Hew through thick, tar-like egg-sheet webbing blocking the cavern entrance", skill: "heavy_weapons", intent: "combat" },
        { text: "Trace airflow and moisture scents to identify the structurally sound mine branch", skill: "survival", intent: "travel" },
        { text: "Inspect the timber arches for camouflaged vibration silk lines and pitfall drop-nets", skill: "perception", intent: "investigate" }
      ],
      "Webbed Root Gallery": [
        { text: "Leap and swing across hanging subterranean tree roots over the chasm floor", skill: "acrobatics", intent: "travel" },
        { text: "Wriggle free from tightening silk cocoons before venom can paralyze your limbs", skill: "escapology", intent: "stealth" },
        { text: "Follow dragged boot marks and webbing anchor strands deeper into the root tangle", skill: "tracking", intent: "investigate" }
      ],
      "Egg Nursery": [
        { text: "Unleash a sweeping burst of arcane flame to incinerate pulsating egg clusters", skill: "arcane_shaping", intent: "magic" },
        { text: "Rig unstable timber props to collapse the cavern ceiling onto the nesting chambers", skill: "trapping", intent: "utility" },
        { text: "Step between sticky silk anchor threads without triggering web-vibration alarms", skill: "stealth", intent: "stealth" }
      ],
      "Lower Molt Rift": [
        { text: "Sever Mother Silken's venomous front mandibles with a crushing two-handed strike", skill: "heavy_weapons", intent: "combat" },
        { text: "Splash caustic vitriol onto the spider queen's chitinous carapace to strip her armor", skill: "alchemy", intent: "utility" },
        { text: "Read the queen's rhythmic pedipalp twitching to anticipate her lunges and silk-sprays", skill: "insight", intent: "investigate" }
      ],
    },
    settingImages: {
      "Blackroot Village Edge": "/images/adventures/blackroot_hollow/blackroot_village_edge.webp",
      "Abandoned Mine Mouth": "/images/adventures/blackroot_hollow/abandoned_mine_mouth.webp",
      "Webbed Root Gallery": "/images/adventures/blackroot_hollow/webbed_root_gallery.webp",
      "Egg Nursery": "/images/adventures/blackroot_hollow/egg_nursery.webp",
      "Lower Molt Rift": "/images/adventures/blackroot_hollow/lower_molt_rift.webp",
    },
  },
  "greywash_bandit_crown": {
    settingChoices: {
      "Greywash Road": [
        { text: "Snipe the bandit road ambushers concealed in pine branches before they loose volleys", skill: "marksmanship", intent: "combat" },
        { text: "Spot tripwires linked to felled tree trunks primed to crush passing travelers", skill: "perception", intent: "investigate" },
        { text: "Brandish drawn steel and roar a military challenge to send skittish scouts running", skill: "intimidation", intent: "social" }
      ],
      "Hungry Pines Camp": [
        { text: "Infiltrate the perimeter under the roar of pine winds to spike the camp ballista", skill: "stealth", intent: "stealth" },
        { text: "Follow mud tracks and dropped stolen provisions back to the hidden supply caches", skill: "tracking", intent: "investigate" },
        { text: "Slit open supply sacks and siphon the bandits' lamp oil into the camp well", skill: "thievery", intent: "utility" }
      ],
      "Deserter Ridge Camp": [
        { text: "Remind the deserters of their former regimental oaths to shatter their loyalty to Rusk", skill: "leadership", intent: "social" },
        { text: "Offer royal amnesty and silver bounties if the squad surrenders their arms peacefully", skill: "negotiation", intent: "social" },
        { text: "Brawl and knock unconscious the camp's champion enforcer in a bare-knuckle challenge", skill: "brawling", intent: "combat" }
      ],
      "Smuggler Mill Base": [
        { text: "Scale the slime-slick mill wheel and heave open the second-story flour loft shutter", skill: "athletics", intent: "travel" },
        { text: "Rig the grain elevator pulleys to drop grinding stones on the barricaded entry", skill: "trapping", intent: "utility" },
        { text: "Pick the reinforced iron hasp lock on the confiscated caravan strongbox", skill: "lockpicking", intent: "utility" }
      ],
      "Crown Hollow": [
        { text: "Engage Rusk Fen in a two-handed weapon clash against his massive warhammer", skill: "heavy_weapons", intent: "combat" },
        { text: "Absorb Rusk's bone-crushing overhead hammer sweep on a braced tower shield", skill: "blocking", intent: "combat" },
        { text: "Demand Rusk yield the Bandit Crown in exchange for exile rather than the gallows", skill: "negotiation", intent: "social" }
      ],
    },
    settingImages: {
      "Greywash Road": "/images/adventures/greywash_bandit_crown/greywash_road.webp",
      "Hungry Pines Camp": "/images/adventures/greywash_bandit_crown/hungry_pines_camp.webp",
      "Deserter Ridge Camp": "/images/adventures/greywash_bandit_crown/deserter_ridge_camp.webp",
      "Smuggler Mill Base": "/images/adventures/greywash_bandit_crown/smuggler_mill_base.webp",
      "Crown Hollow": "/images/adventures/greywash_bandit_crown/crown_hollow.webp",
    },
  },
  "merrin_abbey_plague_bells": {
    settingChoices: {
      "Sickfield Hamlet": [
        { text: "Cleanse weeping plague pustules and apply clean bandages to suffering villagers", skill: "healing", intent: "utility" },
        { text: "Harvest bitter fever-bark and wild wintergreen to brew curative steam teas", skill: "herbalism", intent: "utility" },
        { text: "Sit with dying villagers and record their last confessions to comfort their spirits", skill: "insight", intent: "social" }
      ],
      "Chained Abbey Gate": [
        { text: "Sunder the rusted iron gate chains with a powerful sledge strike", skill: "heavy_weapons", intent: "combat" },
        { text: "Scale the crumbling stone abbey perimeter wall using cracked gargoyle handholds", skill: "athletics", intent: "travel" },
        { text: "Shout down the panicked monks behind the wicket gate to demand emergency entry", skill: "intimidation", intent: "social" }
      ],
      "Infirmary Cloister": [
        { text: "Brew sulfur and charcoal vapor pans to sterilize the contagion-choked wards", skill: "alchemy", intent: "utility" },
        { text: "Establish an airtight quarantine perimeter around the uncontaminated chapel wing", skill: "survival", intent: "travel" },
        { text: "Interrogate the evasive Prior Malrec to uncover his role in locking out the infected", skill: "insight", intent: "social" }
      ],
      "Reliquary Library": [
        { text: "Research the founding rite of the Abbey Bells to discover how to silence the sorrow toll", skill: "lore", intent: "investigate" },
        { text: "Pick the silver filigree lock on the sacred reliquary tabernacle", skill: "lockpicking", intent: "utility" },
        { text: "Translate the ancient parchment roll bearing the names of the unburied dead", skill: "languages", intent: "investigate" }
      ],
      "Bell Tower": [
        { text: "Strike and shatter the cursed cracked bronze bell clapper with a warhammer blow", skill: "heavy_weapons", intent: "combat" },
        { text: "Channel radiant holy brilliance to banish the wailing shadow-manifestation", skill: "divine_manifestation", intent: "magic" },
        { text: "Lead the surviving monks in a solemn hymn of release to lay the spirits to rest", skill: "performance", intent: "social" }
      ],
    },
    settingImages: {
      "Sickfield Hamlet": "/images/adventures/merrin_abbey_plague_bells/sickfield_hamlet.webp",
      "Chained Abbey Gate": "/images/adventures/merrin_abbey_plague_bells/chained_abbey_gate.webp",
      "Infirmary Cloister": "/images/adventures/merrin_abbey_plague_bells/infirmary_cloister.webp",
      "Reliquary Library": "/images/adventures/merrin_abbey_plague_bells/reliquary_library.webp",
      "Bell Tower": "/images/adventures/merrin_abbey_plague_bells/bell_tower.webp",
    },
  },
  "glass_orchard_masquerade": {
    settingChoices: {
      "Lantern Walk": [
        { text: "Slip through the clipped yew shadows to bypass lantern-bearing manor sentries", skill: "stealth", intent: "stealth" },
        { text: "Examine carriage crests and jewels to identify the true emissary of the Iron Bank", skill: "appraise", intent: "investigate" },
        { text: "Present a forged engraved noble invitation with aristocratic arrogance", skill: "deception", intent: "social" }
      ],
      "Mirror Hedge": [
        { text: "Tumble between razor-sharp glass mirror panes without grazing fragile edges", skill: "acrobatics", intent: "travel" },
        { text: "Distinguish deceptive mirror refractions from the true path through the hedge", skill: "perception", intent: "investigate" },
        { text: "Read subtle candle-flicker hand signals exchanged between rival undercover agents", skill: "insight", intent: "social" }
      ],
      "Glass Orchard Ballroom": [
        { text: "Lead a graceful waltz across the polished floor to eavesdrop on inner-circle nobles", skill: "performance", intent: "social" },
        { text: "Lift a brass signet ring and cipher slip from the host's velvet waistcoat pocket", skill: "thievery", intent: "stealth" },
        { text: "Engage the Duchess in flattering conversation to coax out her secret allegiance", skill: "negotiation", intent: "social" }
      ],
      "Servant Passage": [
        { text: "Quickly disarm and incapacitate a suspicious bodyguard in the narrow corridor", skill: "light_weapons", intent: "combat" },
        { text: "Pick the intricate glass-faced tumbler lock sealing the master private gallery", skill: "lockpicking", intent: "utility" },
        { text: "Squeeze through a narrow dumbwaiter chute to evade an approaching security sweep", skill: "escapology", intent: "stealth" }
      ],
      "Midnight Fountain": [
        { text: "Lunge across the fountain basin to tackle and restrain the fleeing conspirator", skill: "athletics", intent: "combat" },
        { text: "Siphon unstable mana from the shimmering fountain pool before it unleashes static", skill: "arcane_drawing", intent: "magic" },
        { text: "Corner the conspirator with documented blackmail to force an immediate confession", skill: "intimidation", intent: "social" }
      ],
    },
    settingImages: {
      "Lantern Walk": "/images/adventures/glass_orchard_masquerade/lantern_walk.webp",
      "Mirror Hedge": "/images/adventures/glass_orchard_masquerade/mirror_hedge.webp",
      "Glass Orchard Ballroom": "/images/adventures/glass_orchard_masquerade/glass_orchard_ballroom.webp",
      "Servant Passage": "/images/adventures/glass_orchard_masquerade/servant_passage.webp",
      "Midnight Fountain": "/images/adventures/glass_orchard_masquerade/midnight_fountain.webp",
    },
  },
  "drowned_market": {
    settingChoices: {
      "Empty Tide Flats": [
        { text: "Navigate through shifting quicksand mud flats before the moonlit tide rushes in", skill: "survival", intent: "travel" },
        { text: "Follow the ethereal luminescent footprints left by drowned phantom merchant stalls", skill: "tracking", intent: "investigate" },
        { text: "Spot treacherous hidden sinkholes and submerged barnacle-crusted timber piles", skill: "perception", intent: "investigate" }
      ],
      "Ghost Bazaar Aisles": [
        { text: "Discern authentic otherworldly treasures from deceptive cursed phantom illusions", skill: "appraise", intent: "investigate" },
        { text: "Bargain with a shade using a counterfeit memory slip instead of your own soul", skill: "deception", intent: "social" },
        { text: "Read the sorrowful eyes of drowned peddlers to uncover what debts keep them bound", skill: "insight", intent: "social" }
      ],
      "Memory Stall": [
        { text: "Recall the forgotten maritime laws of Bellweather to challenge an extortionate contract", skill: "lore", intent: "investigate" },
        { text: "Barter fair mortal goods for the spirit's deepest sea charts without yielding blood", skill: "negotiation", intent: "social" },
        { text: "Spin the gambler's driftwood wheel to test whether fortune favors your escape from debt", skill: "luck", intent: "utility" }
      ],
      "Sunken Council Vault": [
        { text: "Pickpocket the rusted ring of sunken vault keys from the patrolling spectral bailiff", skill: "thievery", intent: "stealth" },
        { text: "Pick the water-clogged brass lockbox containing the true town drowning records", skill: "lockpicking", intent: "utility" },
        { text: "Glide behind drowned velvet curtains to evade the scrutiny of watchful ghost watchmen", skill: "stealth", intent: "stealth" }
      ],
      "Returning Tide Gate": [
        { text: "Parry and disarm the Tide Bailiff's rusty iron gaff hook in an agile duel", skill: "light_weapons", intent: "combat" },
        { text: "Sprint and haul the heavy seawall chain shut against the crushing incoming tide", skill: "athletics", intent: "utility" },
        { text: "Brandish the council's signed treachery charter to break the Bailiff's legal power", skill: "intimidation", intent: "social" }
      ],
    },
    settingImages: {
      "Empty Tide Flats": "/images/adventures/drowned_market/empty_tide_flats.webp",
      "Ghost Bazaar Aisles": "/images/adventures/drowned_market/ghost_bazaar_aisles.webp",
      "Memory Stall": "/images/adventures/drowned_market/memory_stall.webp",
      "Sunken Council Vault": "/images/adventures/drowned_market/sunken_council_vault.webp",
      "Returning Tide Gate": "/images/adventures/drowned_market/returning_tide_gate.webp",
    },
  },
  "thorn_treaty": {
    settingChoices: {
      "Boundary Stone Field": [
        { text: "Heave fallen boundary monoliths back upright to mark the ancient ancestral line", skill: "athletics", intent: "utility" },
        { text: "Translate the weathered moss-engraved treaty script on the border stones", skill: "languages", intent: "investigate" },
        { text: "Mediate between armed human woodcutters and enraged dryads before blood is shed", skill: "negotiation", intent: "social" }
      ],
      "Milltown Hall": [
        { text: "Slam your fist onto the council table to silence the bickering timber magnates", skill: "intimidation", intent: "social" },
        { text: "Examine false lumber export ledgers to uncover illegal logging inside fey borders", skill: "insight", intent: "investigate" },
        { text: "Unite frightened townsfolk behind an honorable compromise respecting the forest pact", skill: "leadership", intent: "social" }
      ],
      "Orchard Graves": [
        { text: "Extract weeping black ichor from infected apple roots to diagnose the wood-blight", skill: "herbalism", intent: "utility" },
        { text: "Offer solemn prayers to consecrated earth to pacify unresting fallen woodsmen", skill: "divine_communion", intent: "magic" },
        { text: "Track thorn-scarred beast claw tracks leading from the orchard toward the deep woods", skill: "tracking", intent: "investigate" }
      ],
      "Thornwold Deep Path": [
        { text: "Vault gracefully over snapping bramble snares and spring-loaded vine traps", skill: "acrobatics", intent: "travel" },
        { text: "Approach the barbed guardian stag with calm murmurs and salt-lick offerings", skill: "animal_rapport", intent: "social" },
        { text: "Navigate through shifting thorn hedges by following seasonal pollen drifts", skill: "survival", intent: "travel" }
      ],
      "Oath Stone Circle": [
        { text: "Raise your shield to brace and deflect Briar-Eyed Leth's razor-bark whip strikes", skill: "blocking", intent: "combat" },
        { text: "Sing the forgotten verse of the First Canopy Accord to soothe Leth's ancestral wrath", skill: "performance", intent: "social" },
        { text: "Deceive the furious thorn spirit with an illusory offering while securing the seal", skill: "deception", intent: "social" }
      ],
    },
    settingImages: {
      "Boundary Stone Field": "/images/adventures/thorn_treaty/boundary_stone_field.webp",
      "Milltown Hall": "/images/adventures/thorn_treaty/milltown_hall.webp",
      "Orchard Graves": "/images/adventures/thorn_treaty/orchard_graves.webp",
      "Thornwold Deep Path": "/images/adventures/thorn_treaty/thornwold_deep_path.webp",
      "Oath Stone Circle": "/images/adventures/thorn_treaty/oath_stone_circle.webp",
    },
  },
  "brass_plague_tinkertown": {
    settingChoices: {
      "Ticking Market Street": [
        { text: "Shoot flying infected brass hornet drones out of the air before they sting citizens", skill: "marksmanship", intent: "combat" },
        { text: "Organize panicking townspeople into a defensive barricade behind overturned carts", skill: "leadership", intent: "social" },
        { text: "Detect the telltale rhythmic ticking sound beneath the coats of infected travelers", skill: "perception", intent: "investigate" }
      ],
      "Gearwise Workshop": [
        { text: "Forge copper lightning rods to create a perimeter that grounds rogue electrical bursts", skill: "smithing", intent: "utility" },
        { text: "Crack the magnetic tumblers on the sealed workshop armory blast door", skill: "lockpicking", intent: "utility" },
        { text: "Question the half-converted master mechanic to determine patient zero's identity", skill: "insight", intent: "social" }
      ],
      "Converted Bakery": [
        { text: "Perform delicate field surgery to excise ticking clock-ticks from an infected baker", skill: "healing", intent: "utility" },
        { text: "Brew a caustic oil blend that dissolves internal gears without melting living flesh", skill: "alchemy", intent: "utility" },
        { text: "Slip past the mechanical baker automaton while its back is turned toward the ovens", skill: "stealth", intent: "stealth" }
      ],
      "Servant Registry Hall": [
        { text: "Translate the binary punch-card code directing the city's automaton servants", skill: "languages", intent: "investigate" },
        { text: "Extract the master logic card from the registry vault without tripping alarms", skill: "thievery", intent: "stealth" },
        { text: "Imitate the vocal pitch and access frequencies of the High Artificer", skill: "deception", intent: "social" }
      ],
      "Central Logic Foundry": [
        { text: "Cleave the hydraulic conduits feeding power to Matron 12's surgical appendages", skill: "heavy_weapons", intent: "combat" },
        { text: "Surgically rewrite Matron 12's logic motherboard to override her conversion protocols", skill: "crafting", intent: "utility" },
        { text: "Channel an EMP burst of shaped static to short out the foundry's main transformer", skill: "arcane_shaping", intent: "magic" }
      ],
    },
    settingImages: {
      "Ticking Market Street": "/images/adventures/brass_plague_tinkertown/ticking_market_street.webp",
      "Gearwise Workshop": "/images/adventures/brass_plague_tinkertown/gearwise_workshop.webp",
      "Converted Bakery": "/images/adventures/brass_plague_tinkertown/converted_bakery.webp",
      "Servant Registry Hall": "/images/adventures/brass_plague_tinkertown/servant_registry_hall.webp",
      "Central Logic Foundry": "/images/adventures/brass_plague_tinkertown/central_logic_foundry.webp",
    },
  },
  "harvest_hill_hunger": {
    settingChoices: {
      "Golden Wheat Road": [
        { text: "Endure the suffocating, life-draining heat haze rising from the bleached wheat fields", skill: "survival", intent: "travel" },
        { text: "Follow the desiccated trails of vanished livestock leading straight into the barrow hill", skill: "tracking", intent: "investigate" },
        { text: "Notice the hollow, terror-filled stares behind the smiling masks of the village reapers", skill: "insight", intent: "social" }
      ],
      "Choosing Feast Hall": [
        { text: "Pretend to drink the cursed harvest-wine while secretly emptying it into your sleeve", skill: "deception", intent: "social" },
        { text: "Palm a sample of the blackened, parasitic grain kernel from the elder's ceremonial bowl", skill: "thievery", intent: "stealth" },
        { text: "Interrogate the village elders on the exact terms of their generational harvest blood pact", skill: "negotiation", intent: "social" }
      ],
      "Elder's Root Cellar": [
        { text: "Pry open the stone root-trapdoor that has been sealed with centuries of iron clamps", skill: "athletics", intent: "utility" },
        { text: "Identify the eldritch flesh-eating fungus pulsating along the subterranean roots", skill: "herbalism", intent: "utility" },
        { text: "Spot the concealed stone archway hidden behind stacks of rotting tribute sacks", skill: "perception", intent: "investigate" }
      ],
      "Hill Shrine": [
        { text: "Decipher the ancient blood contract carved into the monolithic sacrificial pillar", skill: "lore", intent: "investigate" },
        { text: "Coat steel sickles in consecrated rock salt to forge weapons capable of severing roots", skill: "smithing", intent: "utility" },
        { text: "Appeal to the ancient earth spirits who were betrayed when the hunger pact was forged", skill: "divine_communion", intent: "magic" }
      ],
      "Root-Heart Chamber": [
        { text: "Grapple and tear apart the pulsating central root arteries choking the cavern floor", skill: "brawling", intent: "combat" },
        { text: "Ignite the sacrificial pyre with sacred holy fire to burn the entity from within", skill: "divine_manifestation", intent: "magic" },
        { text: "Lead the remorseful village elders in swearing an eternal oath that breaks the pact forever", skill: "leadership", intent: "social" }
      ],
    },
    settingImages: {
      "Golden Wheat Road": "/images/adventures/harvest_hill_hunger/golden_wheat_road.webp",
      "Choosing Feast Hall": "/images/adventures/harvest_hill_hunger/choosing_feast_hall.webp",
      "Elder's Root Cellar": "/images/adventures/harvest_hill_hunger/elder_s_root_cellar.webp",
      "Hill Shrine": "/images/adventures/harvest_hill_hunger/hill_shrine.webp",
      "Root-Heart Chamber": "/images/adventures/harvest_hill_hunger/root_heart_chamber.webp",
    },
  },
  "mirror_war_saint_orra": {
    settingChoices: {
      "Village Green": [
        { text: "Scrutinize subtle facial twitches to distinguish villagers from silver mirror duplicates", skill: "insight", intent: "investigate" },
        { text: "Catch the unnatural light refraction in the eyes of disguised mirror imposters", skill: "perception", intent: "investigate" },
        { text: "Prevent terrified townspeople from lynching suspected duplicates without trial", skill: "negotiation", intent: "social" }
      ],
      "Saint Orra Chapel": [
        { text: "Pray at Saint Orra's undisturbed sanctuary altar to receive true visions of reality", skill: "divine_communion", intent: "magic" },
        { text: "Recite Saint Orra's original oath of absolute truthfulness to banish creeping illusions", skill: "lore", intent: "investigate" },
        { text: "Offer compassionate counsel to an impostor duplicate who genuinely believes they are the original person", skill: "negotiation", intent: "social" }
      ],
      "Hall of Reflections": [
        { text: "Gaze into mirror clones of your own worst sins without yielding to despair", skill: "insight", intent: "investigate" },
        { text: "Tumble across the shattered gallery floor while razor mirror shards rain from above", skill: "acrobatics", intent: "travel" },
        { text: "Thrust precisely through the silver refraction focal node to crack the mirror maze", skill: "light_weapons", intent: "combat" }
      ],
      "Vestry Archive": [
        { text: "Translate Saint Orra's hidden confession manuscript written in mirrored cipher", skill: "languages", intent: "investigate" },
        { text: "Snatch the genuine silver prism relic before the duplicate priest can shatter it", skill: "thievery", intent: "stealth" },
        { text: "Verify the purity and antiquity of the true silver sacred reliquary bell", skill: "appraise", intent: "investigate" }
      ],
      "Dawn Mirror Threshold": [
        { text: "Summon a blinding burst of sacred dawn light to dissolve the Silver Contrary", skill: "divine_manifestation", intent: "magic" },
        { text: "Duel the Silver Contrary blade-to-blade, matching rapier thrust for thrust", skill: "light_weapons", intent: "combat" },
        { text: "Acknowledge your own deepest moral hypocrisies to strip the contrary of its power", skill: "negotiation", intent: "social" }
      ],
    },
    settingImages: {
      "Village Green": "/images/adventures/mirror_war_saint_orra/village_green.webp",
      "Saint Orra Chapel": "/images/adventures/mirror_war_saint_orra/saint_orra_chapel.webp",
      "Hall of Reflections": "/images/adventures/mirror_war_saint_orra/hall_of_reflections.webp",
      "Vestry Archive": "/images/adventures/mirror_war_saint_orra/vestry_archive.webp",
      "Dawn Mirror Threshold": "/images/adventures/mirror_war_saint_orra/dawn_mirror_threshold.webp",
    },
  },
};

export const ADVENTURE_SETTING_METADATA = applyChoiceDifficultyCurve(BASE_ADVENTURE_SETTING_METADATA);
