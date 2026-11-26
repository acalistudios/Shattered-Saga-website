// Renamed downtime merchants (Hans, 2026-11-25: the Basalt Tankard keeper is
// now Breka, a dwarf woman). Saves key standing and stock by name, so carry
// the old entries across.
export const MERCHANT_RENAMES = { Brak: 'Breka' };
export function renameMerchantKeys(localEconomy) {
  if (!localEconomy) return localEconomy;
  const next = { ...localEconomy };
  for (const field of ['relationships', 'decay', 'merchantStock']) {
    const map = localEconomy[field];
    if (!map) continue;
    const renamed = { ...map };
    for (const [from, to] of Object.entries(MERCHANT_RENAMES)) {
      if (from in renamed) {
        if (!(to in renamed)) renamed[to] = renamed[from];
        delete renamed[from];
      }
    }
    next[field] = renamed;
  }
  return next;
}
