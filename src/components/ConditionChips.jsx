// Small chips for active combat conditions (utils/conditions.js), on the
// player's sheet and beside the enemy's name. Unknown GM labels show plainly.
import { CONDITIONS, normalizeCondition } from '../utils/conditions';

export default function ConditionChips({ list, className = '' }) {
  const active = (list || []).filter(c => (c?.duration || 0) > 0);
  if (!active.length) return null;
  return (
    <span className={`inline-flex flex-wrap gap-1 ${className}`}>
      {active.map((c, i) => {
        const id = normalizeCondition(c.id || c.name);
        const def = id ? CONDITIONS[id] : null;
        const label = def ? def.label : String(c.name || c.id).replace(/_/g, ' ');
        return (
          <span
            key={`${id || c.name}-${i}`}
            title={def ? `${def.label}: ${def.desc} ${c.duration} round${c.duration === 1 ? '' : 's'} left.` : `${label} (${c.duration} rounds, story only)`}
            className={`normal-case tracking-normal font-sans text-4xs font-bold px-1.5 py-0.5 rounded border ${
              def ? 'bg-amber-950/40 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {def?.icon ? `${def.icon} ` : ''}{label} {c.duration}
          </span>
        );
      })}
    </span>
  );
}
