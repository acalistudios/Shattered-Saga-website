import { useState } from 'react';
import { resolveGearRecovery } from '../data/gearRecovery';

// Deliberately not dismissable: there is no "cancel" for dying. The player must
// choose what the return costs before play continues.

const ATTRIBUTE_LABELS = {
  power: { name: 'Power', blurb: 'Melee damage and raw force.' },
  coordination: { name: 'Coordination', blurb: 'Accuracy, dodging, and fine work.' },
  vigor: { name: 'Vigor', blurb: 'Health, stamina, and endurance.' },
  willpower: { name: 'Willpower', blurb: 'Resolve against fear and domination.' },
  intellect: { name: 'Intellect', blurb: 'Lore, crafting, and deduction.' },
  charisma: { name: 'Charisma', blurb: 'Persuasion, presence, and command.' },
  attunement: { name: 'Attunement', blurb: 'Arcane and elemental power.' },
  empathy: { name: 'Empathy', blurb: 'Reading people, healing, and rapport.' },
};

export default function ResurrectionModal({ pendingResurrection, character, onConfirm }) {
  const [attributeId, setAttributeId] = useState(null);
  const [siteId, setSiteId] = useState(null);

  if (!pendingResurrection) return null;

  const { choices = [], sites = [], adventureId, killerName } = pendingResurrection;
  const site = sites.find(s => s.adventureId === siteId) || null;
  const recovery = adventureId ? resolveGearRecovery(adventureId, killerName) : null;
  const repeatDeath = (character?.progression?.resurrectionCount || 0) > 0;
  // A site is always required. An attribute is only required when one was offered
  // — a character with nothing left to lose still has to choose where to wake.
  const ready = !!site && (choices.length === 0 || !!attributeId);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-3xl bg-slate-950 border border-red-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        <div className="bg-slate-900 border-b border-red-900/40 px-6 py-4">
          <h3 className="text-lg font-bold font-serif text-red-400 tracking-wider">
            ☠ You Have Died
          </h3>
          <p className="text-3xs text-slate-400 uppercase tracking-widest mt-0.5">
            Something can be called back. It will not be entirely you.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-2xs leading-relaxed custom-scrollbar">

          {/* Step 1 — the permanent cost */}
          <section>
            <h4 className="text-amber-400 font-bold uppercase tracking-widest text-3xs mb-1">
              1 · The Price
            </h4>
            <p className="text-slate-400 mb-3">
              Returning costs part of what you were. Choose which. This is permanent and is
              never refunded, even if the undeath is later cured.
            </p>

            {choices.length === 0 ? (
              <p className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-400">
                There is nothing left in you to take. You return no weaker than you fell.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {choices.map(id => {
                  const label = ATTRIBUTE_LABELS[id] || { name: id, blurb: '' };
                  const current = character?.attributes?.[id] ?? 1;
                  const selected = attributeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAttributeId(id)}
                      className={`text-left p-3 rounded border transition-all cursor-pointer ${
                        selected
                          ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-900/20'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-100">{label.name}</span>
                        <span className="text-3xs font-mono text-red-400">
                          {current} → {Math.max(1, current - 1)}
                        </span>
                      </div>
                      <p className="text-3xs text-slate-400 mt-1">{label.blurb}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Step 2 — where to return */}
          <section>
            <h4 className="text-amber-400 font-bold uppercase tracking-widest text-3xs mb-1">
              2 · Consecrated Ground
            </h4>
            <p className="text-slate-400 mb-3">
              You wake where the rite is performed, not where you fell.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {sites.map(s => {
                const selected = siteId === s.adventureId;
                return (
                  <button
                    key={s.adventureId}
                    type="button"
                    onClick={() => setSiteId(s.adventureId)}
                    className={`text-left p-3 rounded border transition-all cursor-pointer ${
                      selected
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-900/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-slate-100">{s.name}</span>
                    <p className="text-3xs text-slate-400 mt-1">{s.flavor}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* What returning does to you, stated plainly up front */}
          <section className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
            <h4 className="text-slate-200 font-bold uppercase tracking-widest text-3xs">
              What You Become
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <span className="text-red-400 font-bold">Risen.</span> You are visibly not
                wholly living. Permanent <span className="font-mono text-red-400">-{repeatDeath ? 2 : 1}</span> to
                Deception, Intimidation, Leadership, Negotiation and Performance.
                {repeatDeath && ' Returning more than once has marked you further.'}
              </li>
              <li>
                <span className="text-red-400 font-bold">Stripped.</span> Everything you
                carried stayed with your body.
              </li>
              <li>
                <span className="text-slate-300 font-bold">Curable.</span> Only by a
                purchased rite. Nothing you do in play will lift it.
              </li>
            </ul>
          </section>

          {/* Where the gear went */}
          {recovery && (
            <section className="p-4 rounded-lg bg-amber-950/15 border border-amber-900/30">
              <h4 className="text-amber-400 font-bold uppercase tracking-widest text-3xs mb-2">
                Your Gear
              </h4>
              <p className="text-slate-300">
                {recovery.carries ? (
                  <>
                    <span className="font-bold text-amber-300">{recovery.killer}</span> took
                    it. Last seen near <span className="font-bold">{recovery.location}</span>.
                    Kill them or take it back from their quarters.
                  </>
                ) : (
                  <>
                    It lies where you fell, near{' '}
                    <span className="font-bold text-amber-300">{recovery.location}</span>.
                  </>
                )}
              </p>
              <p className="text-3xs text-slate-400 mt-2">
                The trail decays. {recovery.carries ? 'Carriers move on' : 'Caches are scavenged'} within{' '}
                {recovery.movesAfterHours} hours, and after {recovery.coldAfterHours} hours it is
                gone for good.
              </p>
            </section>
          )}
        </div>

        {/* Stacks on mobile with extra bottom clearance: the fixed music player
            sits bottom-right and would otherwise cover the confirm button. */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 pb-24 sm:pb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-3xs text-slate-500">
            {ready
              ? 'This cannot be undone.'
              : choices.length === 0
                ? 'Choose where to return.'
                : 'Choose what to lose, and where to return.'}
          </p>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onConfirm(attributeId, site)}
            className={`px-5 py-2.5 sm:py-2 rounded font-black text-3xs uppercase tracking-widest transition-all order-first sm:order-none ${
              ready
                ? 'bg-red-700 hover:bg-red-600 text-white cursor-pointer shadow-lg shadow-red-900/30'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Rise
          </button>
        </div>
      </div>
    </div>
  );
}
