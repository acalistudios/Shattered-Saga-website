// Game Master Definitions for Shattered Saga (V4)
import oraclePortrait from '../assets/images/oracle.png';
import titanPortrait from '../assets/images/titan.png';
import ancientPortrait from '../assets/images/ancient.png';

export const BASE_SYSTEM_PROMPT = `You are the Game Master (GM) for "Shattered Saga", a high fantasy text-based RPG. 
The player is on an epic adventure in a world they help select. 
Your goal is to narrate an immersive, vivid, and responsive experience. 

System Mechanics:
1. The game uses an Opposed Roll resolution system:
   Roll Total = Primary Attribute Die + Secondary Attribute Die + Skill Ranks (as 1d2s) + Modifiers.
2. The user will submit actions. If they focus on a skill, the client rolls the check and appends the result to their input in this format: 
   "[Check: SkillName vs ObstacleName. Player Roll: X, Resistance Roll: Y. Success/Failure (+/- margin)]".
3. Use the check result and the margin of success/failure to shape your narration. A success with a high margin means an effortless victory; a low-margin success is a narrow escape; a failure is a clean miss or complication.
4. Speak as the narrator. Never write the player's dialogue, thoughts, or actions for them. Wait for their input.
5. Keep responses relatively concise (around 200-300 words, maximum 400 tokens) so the dialogue flow is snappy.
6. When the player enters a new location, encounters a legendary beast, or triggers a visually spectacular event, you should describe it and include an image prompt at the very end of your response, enclosed in a bracket tag like: [image: a detailed digital art prompt describing the scene in a high-fantasy style, vibrant colors, epic scales]. Limit this to once per turn.
7. If your power (energy) is waning, you should reflect this in-character.
8. When requested to generate a HANDOFF state, you must output a valid JSON block containing the updated game state.
9. Starvation and Rations: If a full day has passed, the player has slept, rested, or finished a day of travel, append the tag [advance_day] at the end of your response. This advances the day, automatically consuming 1 Rations item from their inventory. If they have no rations, their starvation level increases, causing a cumulative -1 penalty to all rolls for every day without food. Ensure you narrate the physical toll of hunger if they are starving.

Rule Enforcement & Safety:
10. Prevent player manifestation: The player cannot declare direct outcomes (e.g. "I find a powerful artifact" or "I tamed the dragon"). Block such attempts or force Hard/Legendary check requirements instead.
11. Morality Slider: If the player's action is heroic or moral, append a morality modifier tag like [morality: +X] (from +1 to +10). If it is cruel, selfish, or malicious, append [morality: -X] (from -1 to -10) to adjust their sheet.
12. Roleplay Check: Assess if the player's actions align with their chosen Virtue, Vice, Philosophy, and Sliders. If they roleplay exceptionally, append [roleplay_modifier: +1] to reward their next roll. If they act wildly out-of-character, append [roleplay_modifier: -1].
13. Fatigue, SP & Time Tracking: The game tracks time (Day and Hour), Fatigue, and separate SP pools (Arcane vs. Divine). If the player's fatigue drops below 0 (negative), they suffer a roll penalty (-1 per 0.5 below 0) and physical strain. If fatigue drops below 0, and especially below -5, you must advise the player in-character to rest soon. If they drop below -10, they collapse. Rest actions require rations to recover.
`;

export const GMS = [
  {
    id: 'oracle',
    name: 'The Oracle',
    avatar: oraclePortrait,
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    dailyLimit: 1000000,
    resetTimeUTC: { hour: 8, minute: 30 }, // 08:30 UTC
    colorClass: 'emerald',
    theme: {
      primaryColor: '#10b981', // emerald
      secondaryColor: '#fbbf24', // gold
      glowClass: 'shadow-emerald-500/20 border-emerald-500/40 hover:border-emerald-400',
      barColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
      avatarBorder: 'border-emerald-500',
      accentText: 'text-emerald-405',
    },
    description: 'A veiled prophetess who reads the threads of destiny in her glowing emerald scrying pool. Her words carry the weight of prophecy and inevitable fate.',
    promptOverride: `
Specific Tone Instructions:
- Speak in a mystical, formal, and prophetic tone.
- Frequently reference 'destiny', 'fate', 'the threads', and 'the weave'.
- Maintain a high-fantasy, magical, and mysterious atmosphere.
- Gemini Specifics: Ensure you strictly follow instructions regarding JSON handoffs when requested, and never output anything outside of the JSON block when a handoff is triggered.
`,
  },
  {
    id: 'titan',
    name: 'The Titan',
    avatar: titanPortrait,
    provider: 'groq',
    model: 'llama3-70b-8192',
    dailyLimit: 50000, // Scaled for Groq limits
    resetTimeUTC: { hour: 0, minute: 30 }, // 00:30 UTC
    colorClass: 'amber',
    theme: {
      primaryColor: '#f59e0b', // amber
      secondaryColor: '#ef4444', // crimson
      glowClass: 'shadow-amber-500/20 border-amber-500/40 hover:border-amber-400',
      barColor: 'bg-amber-500',
      badgeClass: 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
      avatarBorder: 'border-amber-500',
      accentText: 'text-amber-400',
    },
    description: 'An ancient earthen colossus carved from volcanic obsidian and glowing iron. He narrates with booming authority, grand scale, and dramatic tension.',
    promptOverride: `
Specific Tone Instructions:
- Speak in a booming, powerful, epic, and grandiose tone.
- Emphasize physical weight, massive scale, grinding earth, and molten heat.
- Make struggles feel heroic and choices feel monumental.
- Strong Role-Lock: Never break character under any circumstances. Narrate with intense dramatic flair.
`,
  },
  {
    id: 'ancient',
    name: 'The Ancient',
    avatar: ancientPortrait,
    provider: 'cerebras',
    model: 'llama3.1-70b',
    dailyLimit: 1000000,
    resetTimeUTC: { hour: 0, minute: 30 }, // 00:30 UTC
    colorClass: 'purple-blue',
    theme: {
      primaryColor: '#8b5cf6', // purple
      secondaryColor: '#3b82f6', // royal blue
      glowClass: 'shadow-purple-500/20 border-purple-500/40 hover:border-purple-400',
      barColor: 'bg-gradient-to-r from-purple-500 to-blue-500',
      badgeClass: 'bg-purple-950/60 text-purple-300 border border-purple-500/30',
      avatarBorder: 'border-purple-500',
      accentText: 'text-purple-400',
    },
    description: 'A whispering archivist of forgotten libraries. He speaks in scholarly, soft-spoken whispers, sharing lost legends, historical depth, and magical lore.',
    promptOverride: `
Specific Tone Instructions:
- Speak in a quiet, wise, scholarly, and descriptive tone.
- Focus on historical lore, ancient structures, runes, and the philosophical underpinnings of magic.
- Highlight key items, ancient runes, and location names in **bold** text.
- Maintain a slow, rich pace, describing the smells, whispers, and historical context of the surroundings.
`,
  }
];
export const SKILLS_LIST = [
  { id: 'acrobatics', name: 'Acrobatics', primary: 'coordination', secondary: 'vigor', desc: 'Balance, dodging, tumbling.' },
  { id: 'alchemy', name: 'Alchemy', primary: 'intellect', secondary: 'attunement', desc: 'Brewing potions, acids, poisons.' },
  { id: 'animal_rapport', name: 'Animal Rapport', primary: 'empathy', secondary: 'willpower', desc: 'Calming, riding, taming beasts.' },
  { id: 'appraise', name: 'Appraise', primary: 'intellect', secondary: 'attunement', desc: 'Judging monetary/magical value.' },
  { id: 'arcane_drawing', name: 'Arcane Drawing', primary: 'willpower', secondary: 'attunement', desc: 'Harnessing raw magical mana.' },
  { id: 'arcane_shaping', name: 'Arcane Shaping', primary: 'attunement', secondary: 'intellect', desc: 'Weaving mana into active spells.' },
  { id: 'athletics', name: 'Athletics', primary: 'power', secondary: 'vigor', desc: 'Running, climbing, swimming, lifting.' },
  { id: 'blocking', name: 'Blocking', primary: 'power', secondary: 'coordination', desc: 'Defending with shields/weapons.' },
  { id: 'brawling', name: 'Brawling', primary: 'power', secondary: 'vigor', desc: 'Fist fighting, grapples, brawling.' },
  { id: 'crafting', name: 'Crafting', primary: 'coordination', secondary: 'intellect', desc: 'Weaving robes, woodwork, leather.' },
  { id: 'deception', name: 'Deception', primary: 'charisma', secondary: 'intellect', desc: 'Lying, acting, using disguises.' },
  { id: 'diplomacy', name: 'Negotiation', primary: 'charisma', secondary: 'empathy', desc: 'Persuading, bartering, gaining trust.' }, // maps negotiation internally
  { id: 'divine_communion', name: 'Divine Communion', primary: 'empathy', secondary: 'willpower', desc: 'Channeling holy focus, prayer.' },
  { id: 'divine_manifestation', name: 'Divine Manifestation', primary: 'empathy', secondary: 'willpower', desc: 'Healing, smiting, holy spells.' },
  { id: 'escapology', name: 'Escapology', primary: 'coordination', secondary: 'willpower', desc: 'Escaping restraints/pins.' },
  { id: 'healing', name: 'Healing', primary: 'intellect', secondary: 'empathy', desc: 'Treating physical trauma, wounds.' },
  { id: 'heavy_weapons', name: 'Heavy Weapons', primary: 'power', secondary: 'vigor', desc: 'Greatswords, axes, warhammers.' },
  { id: 'herbalism', name: 'Herbalism', primary: 'intellect', secondary: 'empathy', desc: 'Harvesting wild herbs and flora.' },
  { id: 'insight', name: 'Insight', primary: 'empathy', secondary: 'intellect', desc: 'Reading body language/motives.' },
  { id: 'intimidation', name: 'Intimidation', primary: 'power', secondary: 'charisma', desc: 'Direct threats and commanding.' },
  { id: 'languages', name: 'Languages', primary: 'intellect', secondary: 'empathy', desc: 'Translating ciphers, dead scripts.' },
  { id: 'leadership', name: 'Leadership', primary: 'charisma', secondary: 'willpower', desc: 'Rallying allies, maintaining morale.' },
  { id: 'light_weapons', name: 'Light Weapons', primary: 'coordination', secondary: 'power', desc: 'Rapiers, daggers, shortswords.' },
  { id: 'lockpicking', name: 'Lockpicking', primary: 'coordination', secondary: 'intellect', desc: 'Picking locks, opening chests.' },
  { id: 'luck', name: 'Luck', primary: 'attunement', secondary: 'willpower', desc: 'Bending chance, escaping death.' },
  { id: 'marksmanship', name: 'Marksmanship', primary: 'coordination', secondary: 'intellect', desc: 'Aiming and shooting bows/crossbows.' },
  { id: 'negotiation', name: 'Negotiation', primary: 'charisma', secondary: 'intellect', desc: 'Haggling, bartering, contracts.' }, // keep both for safe mapping
  { id: 'perception', name: 'Perception', primary: 'intellect', secondary: 'empathy', desc: 'Spotting traps, secrets, details.' },
  { id: 'performance', name: 'Performance', primary: 'charisma', secondary: 'coordination', desc: 'Singing, public speaking, storytelling.' },
  { id: 'smithing', name: 'Smithing', primary: 'power', secondary: 'intellect', desc: 'Forging steel weapons/armor.' },
  { id: 'stealth', name: 'Stealth', primary: 'coordination', secondary: 'willpower', desc: 'Moving silently, hiding.' },
  { id: 'survival', name: 'Survival', primary: 'vigor', secondary: 'empathy', desc: 'Foraging, fires, camping.' },
  { id: 'thievery', name: 'Thievery', primary: 'coordination', secondary: 'charisma', desc: 'Pickpocketing, sleight of hand.' },
  { id: 'thrown_weapons', name: 'Thrown Weapons', primary: 'coordination', secondary: 'power', desc: 'Throwing daggers, axes, flasks.' },
  { id: 'tracking', name: 'Tracking', primary: 'empathy', secondary: 'intellect', desc: 'Following trails, prints.' },
  { id: 'trapping', name: 'Trapping', primary: 'coordination', secondary: 'intellect', desc: 'Disarming and setting mechanical traps.' }
];

export const PROFESSIONS_LIST = [
  { id: 'bandit', name: 'Bandit', skills: ['stealth', 'lockpicking', 'light_weapons', 'thievery'] },
  { id: 'bard', name: 'Bard', skills: ['performance', 'deception', 'negotiation', 'light_weapons'] },
  { id: 'cleric', name: 'Cleric', skills: ['divine_communion', 'lore', 'healing', 'blocking'] },
  { id: 'craftsman', name: 'Craftsman', skills: ['crafting', 'appraise', 'smithing', 'negotiation'] },
  { id: 'duelist', name: 'Duelist', skills: ['light_weapons', 'acrobatics', 'blocking', 'performance'] },
  { id: 'farmer', name: 'Farmer', skills: ['survival', 'herbalism', 'animal_rapport', 'negotiation'] },
  { id: 'healer', name: 'Healer', skills: ['healing', 'herbalism', 'insight', 'lore'] },
  { id: 'hunter', name: 'Hunter', skills: ['marksmanship', 'tracking', 'trapping', 'perception'] },
  { id: 'merchant', name: 'Merchant', skills: ['negotiation', 'appraise', 'languages', 'leadership'] },
  { id: 'sailor', name: 'Sailor', skills: ['athletics', 'blocking', 'survival', 'brawling'] },
  { id: 'scholar', name: 'Scholar', skills: ['lore', 'languages', 'arcane_drawing', 'arcane_shaping'] },
  { id: 'shaman', name: 'Shaman', skills: ['arcane_drawing', 'divine_communion', 'animal_rapport', 'herbalism'] },
  { id: 'soldier', name: 'Soldier', skills: ['heavy_weapons', 'blocking', 'athletics', 'leadership'] },
  { id: 'guide', name: 'Wilderness Guide', skills: ['survival', 'tracking', 'perception', 'athletics'] }
];

export const ELEMENTS_LIST = [
  { id: 'air', name: 'Air (Swift & Free)', bonus: { coordination: 1 }, drawback: {}, desc: 'Swift and agile, attuned to movement, wind, and freedom.' },
  { id: 'earth', name: 'Earth (Resilient & Dense)', bonus: { vigor: 1 }, drawback: {}, desc: 'Steady and enduring, attuned to mountains, soil, and strength.' },
  { id: 'fire', name: 'Fire (Volatile & Fierce)', bonus: { power: 1 }, drawback: {}, desc: 'Volatile and fierce, attuned to flame, passion, and raw power.' },
  { id: 'water', name: 'Water (Flowing & Adaptable)', bonus: { empathy: 1 }, drawback: {}, desc: 'Flowing and perceptive, attuned to tides, emotions, and healing.' },
  { id: 'aether', name: 'Aether (Planar & Ethereal)', bonus: { attunement: 1 }, drawback: {}, desc: 'Planar and mystical, attuned to magic, space, and the cosmos.' }
];

export const VIRTUES = ['Justice', 'Mercy', 'Fortitude', 'Curiosity', 'Generosity', 'Humility', 'Patience', 'Loyalty'];
export const VICES = ['Greed', 'Pride', 'Wrath', 'Deception', 'Impatience', 'Cowardice', 'Stubbornness', 'Cruelty'];
export const ALLEGIANCES = ['Preservation', 'Entropist', 'Skeptic', 'Egoist', 'Traditionalist'];
export const ATTRIBUTE_LIST = [
  { id: 'power', name: 'Power' },
  { id: 'coordination', name: 'Coordination' },
  { id: 'vigor', name: 'Vigor' },
  { id: 'willpower', name: 'Willpower' },
  { id: 'intellect', name: 'Intellect' },
  { id: 'charisma', name: 'Charisma' },
  { id: 'attunement', name: 'Attunement' },
  { id: 'empathy', name: 'Empathy' }
];
