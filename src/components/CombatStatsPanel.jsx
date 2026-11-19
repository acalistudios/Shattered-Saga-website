import { getCombatSheet } from '../utils/combatSheet';

const SKILL_NAMES = {
  light_weapons: 'One-Handed Weapons',
  heavy_weapons: 'Two-Handed Weapons',
  marksmanship: 'Marksmanship',
  brawling: 'Brawling',
};

const Row = ({ label, value, sub }) => (
  <div className="flex justify-between gap-3 py-1 border-b border-slate-900/70 last:border-0">
    <span className="text-slate-400">{label}</span>
    <span className="text-right">
      <span className="font-mono font-bold text-slate-100">{value}</span>
      {sub && <span className="block text-[10px] text-slate-500 leading-tight">{sub}</span>}
    </span>
  </div>
);

const mod = (n) => (n ? ` (${n > 0 ? '+' : ''}${n})` : '');

/**
 * Combat Stats (Hans 2026-11-18): what your current gear and condition do in a
 * fight, from the same rules the dice use (utils/combatSheet.js). Values are
 * average rolls; an attack hits when it meets the enemy's defence roll.
 */
export default function CombatStatsPanel({ character }) {
  if (!character) return null;
  const s = getCombatSheet(character);
  return (
    <section aria-label="Combat stats" className="mt-3 rounded border border-slate-800 bg-slate-950/70 p-3 text-2xs">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-3xs uppercase tracking-widest text-amber-400 font-bold">Combat Stats</h4>
        <span className="text-[10px] text-amber-300/90">
          {s.style.key === 'none' ? 'No fighting style' : `${s.style.icon} ${s.style.label}`}
        </span>
      </div>

      <Row
        label="Attacks per action"
        value={s.attacksPerAction}
        sub={s.attacks.length > 1 ? 'Dual wielding: two strikes' : s.attacksPerAction > 1 ? 'Quick bow: two shots' : null}
      />
      {s.attacks.map((a) => (
        <Row
          key={`${a.hand || 'main'}-${a.weapon}`}
          label={a.hand ? `${a.hand}: ${a.weapon}` : a.weapon}
          value={`to hit ${a.hitAvg} · ${a.damage}`}
          sub={`${SKILL_NAMES[a.skill] || a.skill} ${a.ranks}${mod(a.hitMod)} · avg damage ${a.damageAvg}${a.trait ? ` · ${a.trait}` : ''}`}
        />
      ))}
      <Row label="Armour soak" value={`${s.soak.avg} avg`} sub={s.soak.text} />
      <Row label="Dodge" value={`${s.dodge.avg} avg`} sub={`${s.dodge.note}${mod(s.dodge.mod)}`} />
      {s.block
        ? <Row label="Block" value={`${s.block.avg} avg`} sub={`${s.block.note}; ${s.block.soak}${mod(s.block.mod)}`} />
        : <Row label="Block" value="—" sub="Needs a weapon or shield in hand" />}
      <Row label="Resist (Willpower)" value={`${s.resist.avg} avg`} sub={s.resist.note} />
      {s.penalties && (
        <p className="mt-1.5 text-[10px] text-rose-300/90">Penalties now: {s.penalties} (attacks, dodges and blocks)</p>
      )}
      <p className="mt-1.5 text-[10px] text-slate-500 leading-snug">
        Averages of each roll. Your attack hits when it meets the enemy&apos;s defence; your defence works when it meets their attack.
        A typical guard attacks around 9, a brute around 15. Each extra defence in a round is -2.
      </p>
    </section>
  );
}
