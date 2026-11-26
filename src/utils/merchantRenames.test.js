import { describe, expect, it } from 'vitest';
import { renameMerchantKeys } from './merchantRenames';

describe('renamed merchants keep their saved standing and stock', () => {
  it('moves Brak to Breka', () => {
    const out = renameMerchantKeys({ relationships: { Brak: 25, Krag: 5 }, merchantStock: { Brak: ['x'] }, decay: {} });
    expect(out.relationships).toEqual({ Breka: 25, Krag: 5 });
    expect(out.merchantStock).toEqual({ Breka: ['x'] });
  });
  it('never overwrites a newer Breka entry', () => {
    expect(renameMerchantKeys({ relationships: { Brak: 25, Breka: 40 } }).relationships).toEqual({ Breka: 40 });
  });
});
