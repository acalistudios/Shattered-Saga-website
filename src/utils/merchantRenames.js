// Renamed merchants. Saves key standing, stock and trade logs by merchant
// name, so carry the old entries across, never overwriting an entry already
// kept under the new name.
// - Brak -> Breka (Hans, 2026-11-25): the Basalt Tankard keeper is a dwarf
//   woman.
// - Hans, 2026-11-27, to stop look-alike names: the Sunken Spire diver-vendor
//   Neris Tidehand IS Naelia the Diver (one person, one portrait); the
//   Frostfire quartermaster Theron Vell becomes Corwin Vell (Theron the Scribe
//   keeps his name); the Blackroot hunter Mara Voss becomes Kessa Voss (Old
//   Mara keeps hers).
export const MERCHANT_RENAMES = {
  Brak: 'Breka',
  'Neris Tidehand': 'Naelia the Diver',
  'Theron Vell': 'Corwin Vell',
  'Mara Voss': 'Kessa Voss',
};

function renameKeys(map) {
  if (!map || typeof map !== 'object') return map;
  let renamed = null;
  for (const [from, to] of Object.entries(MERCHANT_RENAMES)) {
    if (!(from in map)) continue;
    renamed = renamed || { ...map };
    if (!(to in renamed)) renamed[to] = renamed[from];
    delete renamed[from];
  }
  return renamed || map;
}

export function renameMerchantKeys(localEconomy) {
  if (!localEconomy) return localEconomy;
  const next = { ...localEconomy };
  for (const field of ['relationships', 'decay', 'merchantStock']) {
    if (localEconomy[field]) next[field] = renameKeys(localEconomy[field]);
  }
  return next;
}

// progression.adventureTrades = { [adventureId]: { [merchantName]: log } }
export function renameAdventureTrades(progression) {
  const trades = progression?.adventureTrades;
  if (!trades) return progression;
  const next = {};
  for (const [adventureId, log] of Object.entries(trades)) next[adventureId] = renameKeys(log);
  return { ...progression, adventureTrades: next };
}
