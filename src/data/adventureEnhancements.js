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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Cinder Trial Grove": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Granite Burden Hall": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Skyblind Walk": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
      ],
      "Tide Memory Pool": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Aether Thread Nave": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Sense and shape the arcane flow before it surges", skill: "arcane_drawing", difficulty: "professional", intent: "magic" },
      ],
      "Mirror of Affinity": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Use raw strength to shift the obstacle or hold the line", skill: "athletics", difficulty: "professional", intent: "utility" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Yew Graveyard": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Great Hall": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Lord's Study": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Chapel": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Prison Sub-Level": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Prisoner Barracks": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Processing Hall": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Deep Redvein Vein": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Threx's Office": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
      ],
      "Supply Depot": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Sulfuric Vents Chamber": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Molten Lava Tube": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Altar of Ember": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
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
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Approach the creature by reading instinct instead of threatening it", skill: "animal_rapport", difficulty: "professional", intent: "social" },
      ],
      "Hall of Forgotten Runes": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Approach the creature by reading instinct instead of threatening it", skill: "animal_rapport", difficulty: "professional", intent: "social" },
      ],
      "Tidal Siphon Junction": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Planar Archives Sanctuary": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
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
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
      ],
      "Floating Leyline Isles": [
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
        { text: "Use raw strength to shift the obstacle or hold the line", skill: "athletics", difficulty: "professional", intent: "utility" },
      ],
      "Gravity Siphon Spires": [
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
      ],
      "Astral Focal Altar": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "The Steam-Weaving Gallery": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "The Clockwork Arboretum": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "The Alchemical Lab": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "The Chronos Vault": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
      ],
      "The Boiler Core Basement": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "The Sunken Reliquary": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "The Glyphed Catacombs": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
      ],
      "The Glacial Reach": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
      ],
      "The Sarcophagus Chamber": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "The Core Vault": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Training Sand": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Treat the injured and learn what their wounds reveal", skill: "healing", difficulty: "professional", intent: "support" },
      ],
      "Beast Gate Underworks": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Noble Gallery": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
        { text: "Analyze the substance for a safer or more useful approach", skill: "alchemy", difficulty: "professional", intent: "investigate" },
      ],
      "Champion Dais": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
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
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Abandoned Mine Mouth": [
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Webbed Root Gallery": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Egg Nursery": [
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Lower Molt Rift": [
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
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
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Hungry Pines Camp": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
        { text: "Use a convincing falsehood to make others reveal the truth", skill: "deception", difficulty: "professional", intent: "social" },
      ],
      "Deserter Ridge Camp": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Smuggler Mill Base": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Crown Hollow": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
        { text: "Use raw strength to shift the obstacle or hold the line", skill: "athletics", difficulty: "professional", intent: "utility" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Chained Abbey Gate": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Infirmary Cloister": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
        { text: "Treat the injured and learn what their wounds reveal", skill: "healing", difficulty: "professional", intent: "support" },
      ],
      "Reliquary Library": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Bell Tower": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
        { text: "Treat the injured and learn what their wounds reveal", skill: "healing", difficulty: "professional", intent: "support" },
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
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Cross the dangerous space with controlled movement", skill: "acrobatics", difficulty: "professional", intent: "travel" },
        { text: "Negotiate for leverage, aid, or a less bloody outcome", skill: "negotiation", difficulty: "professional", intent: "social" },
      ],
      "Mirror Hedge": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Negotiate for leverage, aid, or a less bloody outcome", skill: "negotiation", difficulty: "professional", intent: "social" },
      ],
      "Glass Orchard Ballroom": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Negotiate for leverage, aid, or a less bloody outcome", skill: "negotiation", difficulty: "professional", intent: "social" },
        { text: "Use a convincing falsehood to make others reveal the truth", skill: "deception", difficulty: "professional", intent: "social" },
      ],
      "Servant Passage": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Move quietly and find a better position before acting", skill: "stealth", difficulty: "professional", intent: "stealth" },
      ],
      "Midnight Fountain": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Negotiate for leverage, aid, or a less bloody outcome", skill: "negotiation", difficulty: "professional", intent: "social" },
        { text: "Sense and shape the arcane flow before it surges", skill: "arcane_drawing", difficulty: "professional", intent: "magic" },
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
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Ghost Bazaar Aisles": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Memory Stall": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Sunken Council Vault": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Returning Tide Gate": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
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
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Milltown Hall": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
        { text: "Use raw strength to shift the obstacle or hold the line", skill: "athletics", difficulty: "professional", intent: "utility" },
      ],
      "Orchard Graves": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Thornwold Deep Path": [
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Oath Stone Circle": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
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
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Gearwise Workshop": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Use smithing knowledge to judge the metalwork and weak points", skill: "smithing", difficulty: "professional", intent: "utility" },
      ],
      "Converted Bakery": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Search Converted Bakery for hidden details before choosing a path", skill: "perception", difficulty: "novice", intent: "investigate" },
      ],
      "Servant Registry Hall": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
      ],
      "Central Logic Foundry": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Search Central Logic Foundry for hidden details before choosing a path", skill: "perception", difficulty: "novice", intent: "investigate" },
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
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
      ],
      "Choosing Feast Hall": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Use raw strength to shift the obstacle or hold the line", skill: "athletics", difficulty: "professional", intent: "utility" },
      ],
      "Elder's Root Cellar": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Hill Shrine": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Root-Heart Chamber": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Read the terrain for tracks, hazards, and safer routes", skill: "survival", difficulty: "novice", intent: "travel" },
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
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Trace the mechanism and look for a controlled way to disable it", skill: "trapping", difficulty: "professional", intent: "utility" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Saint Orra Chapel": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Hall of Reflections": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
      ],
      "Vestry Archive": [
        { text: "Inspect the locks, seams, and mechanisms for a safe way through", skill: "lockpicking", difficulty: "professional", intent: "utility" },
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
      ],
      "Dawn Mirror Threshold": [
        { text: "Study the symbols, records, and old magic for useful context", skill: "languages", difficulty: "professional", intent: "investigate" },
        { text: "Speak carefully and draw out motives before committing", skill: "insight", difficulty: "novice", intent: "social" },
        { text: "Offer a respectful prayer and listen for a spiritual response", skill: "divine_communion", difficulty: "professional", intent: "magic" },
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
