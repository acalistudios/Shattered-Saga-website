export default function AccountStatusPills({ gems = 0, userProfile = null, onOpenAccount, compact = false }) {
  const turns = userProfile?.energy_balance ?? 0;
  const tier = userProfile?.subscription_tier || 'free';
  const tierLabel = tier === 'free' ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1);
  const isPremium = ['supporter', 'adventurer', 'legend'].includes(tier);

  const content = (
    <>
      <span className="px-2.5 py-1 rounded bg-slate-950 border border-amber-500/25 text-amber-350 font-extrabold">
        Gems: {gems || 0}
      </span>
      <span className="px-2.5 py-1 rounded bg-slate-950 border border-emerald-500/20 text-emerald-350 font-extrabold">
        Turns: {turns}
      </span>
      <span className={`px-2.5 py-1 rounded bg-slate-950 border font-extrabold ${
        isPremium ? 'border-violet-500/25 text-violet-300' : 'border-slate-800 text-slate-400'
      }`}>
        {compact ? tierLabel : `Status: ${tierLabel}`}
      </span>
    </>
  );

  if (onOpenAccount) {
    return (
      <button
        type="button"
        onClick={() => onOpenAccount({ section: 'overview' })}
        className="flex flex-wrap items-center justify-end gap-1.5 text-5xs uppercase tracking-wider cursor-pointer"
        title="Open account balances and store"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 text-5xs uppercase tracking-wider">
      {content}
    </div>
  );
}
