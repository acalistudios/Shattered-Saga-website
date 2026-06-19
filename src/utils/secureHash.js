// Pure JS SHA-256 Implementation for Tamper-proof Character Sheets
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';

  var words = [];
  var asciiLength = ascii[lengthProperty] * 8;
  
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];

  var isPrime = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isPrime[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII only
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiLength);
  
  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash.slice(0);
    
    hash = hash.slice(0, 8);
    
    for (i = 0; i < 64; i++) {
      var wItem = w[i];
      if (i >= 16) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      
      var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      var sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      var sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      
      var temp1 = (hash[7] + sigma1 + ch + k[i] + wItem) | 0;
      var temp2 = (sigma0 + maj) | 0;
      
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    var val = hash[i] >>> 0;
    result += (val.toString(16).padStart(8, '0'));
  }
  return result;
}

const SECRET_SALT = 'shattered-saga-client-secret-salt-2026';

/**
 * Computes a deterministic SHA-256 hash of a character's core parameters.
 */
export function computeCharacterHash(character, useNewFields = true) {
  if (!character) return '';

  const attributes = character.attributes || {};
  const skills = character.skills || {};
  
  const sortedAttrs = Object.keys(attributes).sort().map(k => `${k}:${attributes[k]}`).join(',');
  const sortedSkills = Object.keys(skills).sort().map(k => `${k}:${skills[k]}`).join(',');
  
  const payloadItems = [
    character.name || '',
    character.gender || '',
    character.age || '',
    character.element || '',
    character.virtue || '',
    character.vice || '',
    character.philosophy || '',
    sortedAttrs,
    sortedSkills,
    character.stats?.maxHp || 10,
    character.stats?.hp || 10,
    character.stats?.level || 1,
    (character.inventory || []).join(','),
    character.morality || 0,
    character.portraitUrl || '',
    (character.storage || []).join(','),
    (character.strongholds || []).join(','),
    Object.keys(character.relationships || {}).sort().map(k => `${k}:${character.relationships[k]}`).join(',')
  ];

  if (useNewFields) {
    payloadItems.push((character.completed_quests || []).join(','));
    payloadItems.push(character.equipment?.weapon || '');
    payloadItems.push(character.equipment?.shield || '');
    payloadItems.push(character.equipment?.armor || '');
  }

  const payload = payloadItems.join('|');
  return sha256(payload + SECRET_SALT);
}

/**
 * Signs a character data object, returning a copy with a valid signature.
 */
export function signCharacter(character) {
  const hash = computeCharacterHash(character, true);
  return {
    ...character,
    signature: hash
  };
}

/**
 * Validates whether a character object matches its signature.
 */
export function validateCharacter(character) {
  if (!character || !character.signature) return false;
  
  // Extract signature and make a copy without it
  const { signature, ...rest } = character;
  
  // Try new format
  const computedNew = computeCharacterHash(rest, true);
  if (computedNew === signature) return true;

  // Try old format
  const computedOld = computeCharacterHash(rest, false);
  return computedOld === signature;
}

// Key mappings for short JSON compression
const STATS_MAP = {
  level: 'l', hp: 'h', maxHp: 'mh', fatigue: 'f', maxFatigue: 'mf',
  arcaneSP: 'as', maxArcaneSP: 'mas', divineSP: 'ds', maxDivineSP: 'mds',
  day: 'd', hour: 'o', bleedingTier: 'b', deathCountdown: 'dc', defenseCount: 'df'
};

const REV_STATS_MAP = Object.fromEntries(Object.entries(STATS_MAP).map(([k, v]) => [v, k]));
const CURRENCY_MAP = { gold: 'go', fateCoins: 'fc', gp: 'gp', sp: 'sp', cp: 'cp' };
const REV_CURRENCY_MAP = Object.fromEntries(Object.entries(CURRENCY_MAP).map(([k, v]) => [v, k]));
const EQ_MAP = { weapon: 'w', shield: 'sd', armor: 'ar' };
const REV_EQ_MAP = Object.fromEntries(Object.entries(EQ_MAP).map(([k, v]) => [v, k]));

export function compressCharacter(character) {
  if (!character) return null;
  const comp = {};
  
  if (character.name) comp.n = character.name;
  if (character.gender) comp.g = character.gender;
  if (character.age) comp.a = character.age;
  if (character.element) comp.e = character.element;
  if (character.virtue) comp.v = character.virtue;
  if (character.vice) comp.c = character.vice;
  if (character.philosophy) comp.p = character.philosophy;
  if (character.morality !== undefined) comp.m = character.morality;
  if (character.setting) comp.se = character.setting;
  if (character.portraitUrl) comp.pu = character.portraitUrl;
  if (character.portraitSeed !== undefined) comp.ps = character.portraitSeed;
  if (character.signature) comp.sig = character.signature;

  if (character.attributes) comp.at = { ...character.attributes };
  
  if (character.skills) {
    const compSkills = {};
    for (const [sk, rank] of Object.entries(character.skills)) {
      if (rank > 0) compSkills[sk] = rank;
    }
    if (Object.keys(compSkills).length > 0) comp.sk = compSkills;
  }

  if (character.inventory && character.inventory.length > 0) comp.i = character.inventory;
  if (character.storage && character.storage.length > 0) comp.st = character.storage;
  if (character.strongholds && character.strongholds.length > 0 && !(character.strongholds.length === 1 && character.strongholds[0] === 'None')) {
    comp.sh = character.strongholds;
  }
  if (character.completed_quests && character.completed_quests.length > 0) comp.cq = character.completed_quests;
  if (character.active_quests && character.active_quests.length > 0) comp.aq = character.active_quests;

  if (character.stats) {
    const compStats = {};
    for (const [k, v] of Object.entries(character.stats)) {
      const shortKey = STATS_MAP[k];
      if (shortKey && v !== null && v !== undefined) compStats[shortKey] = v;
    }
    comp.s = compStats;
  }

  if (character.currency) {
    const compCurr = {};
    for (const [k, v] of Object.entries(character.currency)) {
      const shortKey = CURRENCY_MAP[k];
      if (shortKey && v !== null && v !== undefined && v !== 0) compCurr[shortKey] = v;
    }
    if (Object.keys(compCurr).length > 0) comp.cu = compCurr;
  }

  if (character.equipment) {
    const compEq = {};
    for (const [k, v] of Object.entries(character.equipment)) {
      const shortKey = EQ_MAP[k];
      if (shortKey && v) compEq[shortKey] = v;
    }
    if (Object.keys(compEq).length > 0) comp.eq = compEq;
  }

  if (character.scars) {
    const compScars = {};
    if (character.scars.maxHpPenalty) compScars.p = character.scars.maxHpPenalty;
    if (character.scars.notes && character.scars.notes.length > 0) compScars.n = character.scars.notes;
    if (Object.keys(compScars).length > 0) comp.sc = compScars;
  }

  if (character.relationships && Object.keys(character.relationships).length > 0) comp.r = character.relationships;
  if (character.professions && character.professions.length > 0) comp.pr = character.professions;
  if (character.hobbySkills && character.hobbySkills.length > 0) comp.hs = character.hobbySkills;

  return comp;
}

export function decompressCharacter(comp) {
  if (!comp) return null;

  const allSkillIds = [
    'acrobatics', 'alchemy', 'animal_rapport', 'appraise', 'arcane_drawing', 
    'arcane_shaping', 'athletics', 'blocking', 'brawling', 'crafting', 
    'deception', 'diplomacy', 'divine_communion', 'divine_manifestation', 
    'escapology', 'healing', 'heavy_weapons', 'herbalism', 'insight', 
    'intimidation', 'languages', 'leadership', 'light_weapons', 'lockpicking', 
    'luck', 'marksmanship', 'negotiation', 'perception', 'performance', 
    'smithing', 'stealth', 'survival', 'thievery', 'thrown_weapons', 
    'tracking', 'trapping'
  ];

  const character = {
    name: comp.n || '',
    gender: comp.g || 'Other',
    age: comp.a || 'middle',
    element: comp.e || 'air',
    virtue: comp.v || '',
    vice: comp.c || '',
    philosophy: comp.p || 'Skeptic',
    morality: comp.m ?? 0,
    setting: comp.se || 'High Fantasy',
    portraitUrl: comp.pu || null,
    portraitSeed: comp.ps ?? null,
    signature: comp.sig || '',
    
    attributes: comp.at ? {
      power: comp.at.power ?? 1,
      coordination: comp.at.coordination ?? 1,
      vigor: comp.at.vigor ?? 1,
      willpower: comp.at.willpower ?? 1,
      intellect: comp.at.intellect ?? 1,
      charisma: comp.at.charisma ?? 1,
      attunement: comp.at.attunement ?? 1,
      empathy: comp.at.empathy ?? 1
    } : {
      power: 1, coordination: 1, vigor: 1, willpower: 1, intellect: 1, charisma: 1, attunement: 1, empathy: 1
    },

    skills: {},
    inventory: comp.i || [],
    storage: comp.st || [],
    strongholds: comp.sh || ["None"],
    completed_quests: comp.cq || [],
    active_quests: comp.aq || [],
    relationships: comp.r || {},
    professions: comp.pr || [],
    hobbySkills: comp.hs || []
  };

  for (const skillId of allSkillIds) {
    character.skills[skillId] = 0;
  }
  if (comp.sk) {
    for (const [sk, rank] of Object.entries(comp.sk)) {
      character.skills[sk] = rank;
    }
  }

  character.stats = {
    hp: 10, maxHp: 10, level: 1, fatigue: 15, maxFatigue: 15,
    arcaneSP: 0, maxArcaneSP: 0, divineSP: 0, maxDivineSP: 0,
    day: 1, hour: 13.0, bleedingTier: 0, deathCountdown: null, defenseCount: 0
  };
  if (comp.s) {
    for (const [k, v] of Object.entries(comp.s)) {
      const fullKey = REV_STATS_MAP[k];
      if (fullKey) character.stats[fullKey] = v;
    }
  }

  character.currency = { gold: 0, fateCoins: 0, gp: 0, sp: 0, cp: 0 };
  if (comp.cu) {
    for (const [k, v] of Object.entries(comp.cu)) {
      const fullKey = REV_CURRENCY_MAP[k];
      if (fullKey) character.currency[fullKey] = v;
    }
  }

  character.equipment = { weapon: null, shield: null, armor: null };
  if (comp.eq) {
    for (const [k, v] of Object.entries(comp.eq)) {
      const fullKey = REV_EQ_MAP[k];
      if (fullKey) character.equipment[fullKey] = v;
    }
  }

  character.scars = { maxHpPenalty: 0, notes: [] };
  if (comp.sc) {
    if (comp.sc.p) character.scars.maxHpPenalty = comp.sc.p;
    if (comp.sc.n) character.scars.notes = comp.sc.n;
  }

  return character;
}

