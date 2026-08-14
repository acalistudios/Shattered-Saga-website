import { ADVENTURE_PROGRESSION_METADATA } from './adventureProgression';

const EXPLICIT_SCALABLE_ROLES = new Set(['minion', 'standard', 'elite', 'boss']);
const EXPLICIT_EXCLUDED_ROLES = new Set([
  'civilian',
  'ally',
  'merchant',
  'guide',
  'social_threat',
  'ritual_threat',
  'mythic',
  'hazard',
]);

const EXCLUDED_ROLE_KEYWORDS = [
  'civilian',
  'ally',
  'merchant',
  'guide',
  'caretaker',
  'healer',
  'priest',
  'scholar',
  'archivist',
  'social',
  'ritual',
  'mythic',
  'hazard',
  'god-fragment',
  'planar being',
];

// Primary power score calculation. Completed adventures are intentionally not
// counted directly because character level already advances on completion.
export function calculatePlayerPower(character) {
  const level = character?.stats?.level || 1;
  const inventory = character?.inventory || [];

  const scoreItem = (itemName) => {
    const item = String(itemName || '').toLowerCase();
    if (item.includes('mythic')) return 3;
    if (item.includes('major relic') || item.includes('relic')) return 2;
    if (item.includes('+1') || item.includes('masterwork')) return 1;
    return 0;
  };

  const gearPower = inventory
    .map(scoreItem)
    .sort((a, b) => b - a)
    .slice(0, 4)
    .reduce((sum, score) => sum + score, 0);

  const elementalPower = character?.stats?.elementalAbility ? 1 : 0;

  return level + Math.min(4, gearPower) * 0.5 + elementalPower;
}

// Get the adventure power band. Major under-level gaps are still dangerous;
// gear can help a character feel strong, but it cannot fully bypass tier gates.
export function getAdventurePowerBand(character, adventure) {
  const level = character?.stats?.level || 1;
  const playerPower = calculatePlayerPower(character);
  const effectiveLevel = Math.max(level, Math.floor(playerPower));
  const progression = adventure?.progression || ADVENTURE_PROGRESSION_METADATA[adventure?.id];
  const [minLevel, maxLevel] = progression?.recommendedLevel || [1, 2];

  if (level < minLevel - 1) return 'dangerously_underpowered';
  if (effectiveLevel < minLevel) return 'underpowered';
  if (effectiveLevel <= maxLevel) return 'expected';
  if (effectiveLevel <= maxLevel + 2) return 'strong';
  return 'overpowered';
}

// The active scaling values
const SCALING_BANDS = {
  dangerously_underpowered: {
    hpMultiplier: 1.0,
    attackModifier: 0,
    defenseModifier: 0,
    choiceShift: 0,
    warning: true,
  },
  underpowered: {
    hpMultiplier: 0.9,
    attackModifier: -1,
    defenseModifier: 0,
    choiceShift: -1,
    warning: true,
  },
  expected: {
    hpMultiplier: 1.0,
    attackModifier: 0,
    defenseModifier: 0,
    choiceShift: 0,
    warning: false,
  },
  strong: {
    hpMultiplier: 1.15,
    attackModifier: 1,
    defenseModifier: 0,
    choiceShift: 1,
    warning: false,
  },
  overpowered: {
    hpMultiplier: 1.3,
    attackModifier: 1,
    defenseModifier: 1,
    choiceShift: 1,
    warning: false,
  },
};

export function canScaleNpc(npc) {
  if (!npc) return true;

  const explicitThreatRole = String(npc.threatRole || '').toLowerCase();
  if (EXPLICIT_EXCLUDED_ROLES.has(explicitThreatRole)) return false;
  if (EXPLICIT_SCALABLE_ROLES.has(explicitThreatRole)) return true;

  const role = String(npc.role || '').toLowerCase();
  const desc = String(npc.desc || '').toLowerCase();
  const name = String(npc.name || '').toLowerCase();
  const combined = [name, role, desc].join(' ');

  if (EXCLUDED_ROLE_KEYWORDS.some(keyword => combined.includes(keyword))) {
    return false;
  }

  const attacks = npc?.stats?.attacks || npc?.attacks || [];
  const hp = npc?.stats?.HP ?? npc?.HP ?? npc?.stats?.hp ?? npc?.hp;
  const hasCombatStats = Number.isFinite(hp) && hp >= 10 && attacks.length > 0;
  if (!hasCombatStats) return false;

  const mythicSignals = [
    'demon',
    'ancient',
    'god',
    'planar',
    'hunger',
    'mirror',
    'spectral guide',
    'cannot be harmed',
  ];

  return !mythicSignals.some(signal => combined.includes(signal));
}

// Main scaling mapping
export function getDifficultyScaling(character, adventure, npc = null) {
  const band = getAdventurePowerBand(character, adventure);
  const baseScaling = { ...SCALING_BANDS[band] };

  if (npc && !canScaleNpc(npc)) {
    baseScaling.hpMultiplier = 1.0;
    baseScaling.attackModifier = 0;
    baseScaling.defenseModifier = 0;
  }

  return {
    band,
    playerPower: calculatePlayerPower(character),
    ...baseScaling,
  };
}

// Shifts choice difficulty strings: novice -> professional -> veteran -> legendary
export function applyChoiceDifficultyScaling(baseDifficulty, scaling) {
  const diffs = ['novice', 'professional', 'veteran', 'legendary'];
  const shift = scaling?.choiceShift || 0;
  if (shift === 0) return baseDifficulty;

  const baseIdx = diffs.indexOf(baseDifficulty?.toLowerCase());
  if (baseIdx === -1) return baseDifficulty;

  const newIdx = Math.max(0, Math.min(diffs.length - 1, baseIdx + shift));
  return diffs[newIdx];
}
