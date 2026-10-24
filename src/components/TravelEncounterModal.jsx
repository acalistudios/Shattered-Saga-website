import { useState } from 'react';
import { executeOpposedCheck } from '../utils/ai';
import { SKILLS_LIST } from '../data/gms';
import { getCompanionForSkill } from '../data/companions';
import {
  applyPatrolCosts, rollPatrolLoot, resolvePatrolFailure, retreatPursuitDamage,
  addLootToInventory, PATROL_HOURS, PATROL_FOES,
} from '../utils/patrolEngine';
import { recoverGear } from '../utils/resurrectionEngine';

// Each approach's authored failure damage ("... inflicting 5 HP damage").
const failDamageOf = (approach) => {
  const m = String(approach?.failDesc || '').match(/(\d+)\s*HP/i);
  return m ? Number(m[1]) : 4;
};

/**
 * Interactive Travel & Roadside Combat Encounter Modal.
 * Allows the player to protect against bandit ambushes and hazards between adventures
 * using physical combat (archery/stealth, melee charge, blocking), arcane attacks,
 * divine smiting, or diplomatic parleys with financial/reputation trade-offs.
 */
export default function TravelEncounterModal({
  encounter,
  character,
  onClose,
  onUpdateCharacterStats,
  onPatrolDeath
}) {
  const [selectedApproach, setSelectedApproach] = useState(null);
  const [rollResult, setRollResult] = useState(null);
  const [outcomeApplied, setOutcomeApplied] = useState(false);

  if (!encounter || !character) return null;

  const currentHp = character.stats?.hp || 10;
  const maxHp = character.stats?.maxHp || 10;
  const currentGp = character.currency?.gp ?? character.currency?.gold ?? 0;
  const currentSp = character.currency?.sp ?? 0;
  const currentCp = character.currency?.cp ?? 0;
  // This road's foe is holding the gear you lost here: beating it recovers it.
  const pendingRecovery = character.progression?.pendingGearRecovery;
  const huntingOwnGear = !!pendingRecovery && pendingRecovery.patrolEncounterId === encounter.id;

  // Find skill info and character capability for a given skill ID
  const getSkillMeta = (skillId) => {
    return SKILLS_LIST.find(s => s.id === skillId) || {
      id: skillId,
      name: skillId,
      primary: 'power',
      secondary: 'vigor'
    };
  };

  const getEffectiveSkillData = (approach) => {
    const primarySkill = getSkillMeta(approach.skill);
    const primaryRanks = character.skills?.[approach.skill] || 0;

    let chosenSkill = primarySkill;
    let chosenRanks = primaryRanks;

    if (approach.fallbackSkill) {
      const fallbackSkill = getSkillMeta(approach.fallbackSkill);
      const fallbackRanks = character.skills?.[approach.fallbackSkill] || 0;
      if (fallbackRanks > primaryRanks) {
        chosenSkill = fallbackSkill;
        chosenRanks = fallbackRanks;
      }
    }

    const pAttr = chosenSkill.primary;
    const sAttr = chosenSkill.secondary;
    const pScore = character.attributes?.[pAttr] || 1;
    const sScore = character.attributes?.[sAttr] || 1;

    const companion = getCompanionForSkill(character.companions, chosenSkill.id);
    const companionBonus = companion ? (companion.assistBonus || 1) : 0;

    return {
      skill: chosenSkill,
      ranks: chosenRanks,
      primaryAttr: pAttr,
      primaryScore: pScore,
      secondaryAttr: sAttr,
      secondaryScore: sScore,
      companion,
      companionBonus
    };
  };

  const handleExecuteApproach = (approach) => {
    if (rollResult) return; // Already resolved

    const meta = getEffectiveSkillData(approach);
    const opposedCheck = executeOpposedCheck({
      skillName: meta.skill.name,
      primaryAttr: meta.primaryAttr,
      primaryScore: meta.primaryScore,
      secondaryAttr: meta.secondaryAttr,
      secondaryScore: meta.secondaryScore,
      skillRanks: meta.ranks,
      difficulty: approach.difficulty || 'novice',
      roleplayModifier: meta.companionBonus
    });

    const isSuccess = opposedCheck.success || opposedCheck.tie;
    const margin = opposedCheck.margin;
    const isDiplomacy = approach.id === 'diplomatic_parley' || approach.id === 'corsair_bribe' || approach.id === 'mountain_intimidation' || approach.id === 'ration_bargain' || approach.id === 'gladiator_code' || approach.id === 'pack_negotiate' || approach.id === 'medical_triage_parley' || approach.id === 'planar_bargain';
    const isNarrowDiplomacy = isDiplomacy && isSuccess && margin <= 2;

    // Roll everything ONCE here so the screen shows exactly what is applied.
    const appliedToll = isNarrowDiplomacy ? Math.min(currentGp, approach.tollCost || 10) : 0;
    const loot = isSuccess && !isNarrowDiplomacy ? rollPatrolLoot(approach.rewards) : null;
    const failDamage = failDamageOf(approach);
    const failure = isSuccess ? null : resolvePatrolFailure({ hp: currentHp, damage: failDamage, margin });
    const stolenGold = !isSuccess && isDiplomacy ? Math.min(currentGp, 15) : 0;
    const recovers = isSuccess && huntingOwnGear;

    setRollResult({
      ...opposedCheck,
      mode: 'approach',
      isSuccess,
      isNarrowDiplomacy,
      appliedToll,
      approach,
      loot,
      failDamage,
      died: !!failure?.died,
      stolenGold,
      recovers,
      companion: meta.companion,
      companionBonus: meta.companionBonus
    });

    if (onUpdateCharacterStats && !outcomeApplied) {
      setOutcomeApplied(true);
      onUpdateCharacterStats(prev => {
        // Every patrol costs time and fatigue, and crossing midnight eats a
        // ration: that is what stops patrols being an unlimited grind.
        let next = applyPatrolCosts(prev);
        const currency = { ...next.currency };
        const gp = currency.gp ?? currency.gold ?? 0;
        let morality = next.morality || 0;

        if (isSuccess) {
          if (isNarrowDiplomacy) {
            currency.gp = currency.gold = Math.max(0, gp - appliedToll);
            morality += 1;
          } else {
            currency.gp = currency.gold = gp + loot.gold;
            morality += loot.morality;
            next = { ...next, inventory: addLootToInventory(next.inventory, loot.items) };
          }
          if (recovers) next = recoverGear(next);
        } else {
          next = { ...next, stats: { ...next.stats, hp: failure.hp } };
          if (stolenGold) currency.gp = currency.gold = Math.max(0, gp - stolenGold);
        }

        // Morality lives on the character (it drives prices and GM tone). It
        // used to be written to progression.morality, which nothing reads.
        return { ...next, currency, morality: Math.max(-100, Math.min(100, morality)) };
      });
    }

    if (failure?.died && onPatrolDeath) onPatrolDeath(encounter.id, encounter.region);
  };

  // Retreat is a roll, not a free exit (Hans 2026-09-08): fail and the foe
  // gives chase, costing part of the failure damage before you get clear.
  const handleRetreat = () => {
    if (rollResult) return;
    const retreatApproach = { skill: 'athletics', fallbackSkill: 'acrobatics', difficulty: 'novice' };
    const meta = getEffectiveSkillData(retreatApproach);
    const check = executeOpposedCheck({
      skillName: meta.skill.name,
      primaryAttr: meta.primaryAttr,
      primaryScore: meta.primaryScore,
      secondaryAttr: meta.secondaryAttr,
      secondaryScore: meta.secondaryScore,
      skillRanks: meta.ranks,
      difficulty: 'novice',
      roleplayModifier: meta.companionBonus
    });
    const escaped = check.success || check.tie;
    const worstDamage = Math.max(...encounter.approaches.map(failDamageOf));
    const pursuit = escaped ? 0 : retreatPursuitDamage(worstDamage);

    setRollResult({ ...check, mode: 'retreat', isSuccess: escaped, pursuit, approach: { id: 'retreat' }, companion: meta.companion, companionBonus: meta.companionBonus });

    if (onUpdateCharacterStats && !outcomeApplied) {
      setOutcomeApplied(true);
      onUpdateCharacterStats(prev => {
        const next = applyPatrolCosts(prev);
        // Being run down while fleeing hurts but never kills.
        return pursuit ? { ...next, stats: { ...next.stats, hp: Math.max(1, (next.stats.hp ?? 10) - pursuit) } } : next;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-3xl bg-slate-950 border border-amber-900/40 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-amber-900/40 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-lg">⚔️</span>
              <h3 className="text-lg font-bold font-serif text-amber-300 tracking-wider">
                {encounter.title}
              </h3>
            </div>
            <p className="text-3xs text-slate-400 uppercase tracking-widest mt-0.5">
              Roadside Combat Hazard · {encounter.regionName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xs font-mono font-bold text-slate-350 block">
              ❤️ Health: <strong className={currentHp <= 5 ? "text-red-400" : "text-emerald-400"}>{currentHp} / {maxHp} HP</strong>
            </span>
            <span className="text-4xs text-amber-400 font-mono">
              💰 Purse: {currentGp}g {currentSp}s {currentCp}c
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-2xs leading-relaxed custom-scrollbar">
          
          {/* Narrative Scene Intro */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 text-3xs leading-relaxed italic border-l-4 border-l-amber-500">
            "{encounter.intro}"
          </div>

          {!rollResult && huntingOwnGear && (
            <div className="mb-4 p-3 rounded border border-emerald-500/40 bg-emerald-955/20 text-3xs text-emerald-200">
              🎒 This is the {PATROL_FOES[encounter.id]?.name || 'band'} that took your gear. Beat them to get it back.
            </div>
          )}
          {!rollResult ? (
            /* Choose Tactical Approach */
            <div>
              <h4 className="text-amber-400 font-bold uppercase tracking-widest text-3xs mb-3 flex items-center gap-2">
                <span>Select Your Tactical Approach</span>
                <span className="text-slate-500 font-normal normal-case text-4xs">
                  (Choose how to confront the ambush)
                </span>
              </h4>

              <div className="grid gap-3">
                {encounter.approaches.map((app) => {
                  const meta = getEffectiveSkillData(app);
                  const isSelected = selectedApproach?.id === app.id;

                  let typeIcon = '⚔️';
                  let badgeColor = 'bg-amber-955 text-amber-300 border-amber-500/30';
                  if (app.id.includes('archery') || app.id.includes('stealth')) {
                    typeIcon = '🏹';
                    badgeColor = 'bg-emerald-955 text-emerald-300 border-emerald-500/30';
                  } else if (app.id.includes('arcane')) {
                    typeIcon = '🔮';
                    badgeColor = 'bg-indigo-955 text-indigo-300 border-indigo-500/30';
                  } else if (app.id.includes('divine')) {
                    typeIcon = '☀️';
                    badgeColor = 'bg-amber-955 text-amber-200 border-amber-400/30';
                  } else if (app.id.includes('parley') || app.id.includes('bribe')) {
                    typeIcon = '📜';
                    badgeColor = 'bg-blue-955 text-blue-300 border-blue-500/30';
                  }

                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApproach(app)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{typeIcon}</span>
                          <span className="font-bold text-amber-200 text-xs">
                            {app.name}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-5xs uppercase tracking-wider font-extrabold border ${badgeColor}`}>
                          {app.difficulty}
                        </span>
                      </div>

                      <p className="text-3xs text-slate-350 mb-2 leading-snug">
                        {app.actionDesc}
                      </p>

                      {meta.companion && (
                        <div className="mb-3 flex items-center gap-1.5 text-4xs text-emerald-300 bg-emerald-955/60 px-2 py-0.5 rounded border border-emerald-500/25 w-fit font-medium">
                          <span>{meta.companion.icon || '🤝'}</span>
                          <span>Teamwork: <strong>{meta.companion.name}</strong> assists (+{meta.companionBonus} to check)</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-4xs pt-2 border-t border-slate-850/60 text-slate-400">
                        <span>
                          Skill: <strong className="text-slate-200">{meta.skill.name}</strong> ({meta.primaryAttr} + {meta.secondaryAttr})
                          {meta.ranks > 0 && <span className="text-amber-400 ml-1">Rank {meta.ranks}</span>}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteApproach(app);
                          }}
                          className="px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-slate-950 font-bold rounded text-4xs uppercase tracking-wider transition-all shadow-sm"
                        >
                          Engage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Outcome / Roll Resolution Screen */
            <div className="space-y-5 animate-fade-in">
              
              {/* Roll Breakdown Card */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left font-mono text-3xs space-y-1.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400 font-sans">
                  <span className="font-bold uppercase tracking-wider text-4xs">Opposed Combat Check</span>
                  <span className={`px-2 py-0.5 rounded text-5xs font-bold uppercase tracking-wider ${
                    rollResult.isSuccess ? 'bg-emerald-955 text-emerald-400 border border-emerald-500/30' : 'bg-red-955 text-red-400 border border-red-500/30'
                  }`}>
                    {rollResult.isSuccess ? 'Victory' : 'Defeat'}
                  </span>
                </div>
                <div className="text-slate-300">
                  Player Roll: <span className="text-amber-300 font-bold text-xs">{rollResult.playerTotal}</span> ({rollResult.primaryRoll} + {rollResult.secondaryRoll} + {rollResult.skillRoll} skill)
                </div>
                <div className="text-slate-400">
                  Bandit Resistance: <span className="text-red-300 font-bold text-xs">{rollResult.resistanceTotal}</span> (Base {rollResult.resistanceBase})
                </div>
                {rollResult.companion && (
                  <div className="text-emerald-400 text-4xs flex items-center gap-1">
                    <span>{rollResult.companion.icon || '🤝'}</span>
                    <span>Teamwork Assist: <strong>{rollResult.companion.name}</strong> added +{rollResult.companionBonus} to roll</span>
                  </div>
                )}
                <div className="text-slate-355 text-4xs pt-1 border-t border-slate-850">
                  {rollResult.text}
                </div>
              </div>

              {/* Narrative Outcome */}
              <div className={`p-4 rounded-lg border text-left ${
                rollResult.isSuccess
                  ? 'bg-emerald-955/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-red-955/20 border-red-500/30 text-red-200'
              }`}>
                <h4 className="font-serif font-extrabold text-sm mb-1.5 flex items-center gap-2">
                  <span>{rollResult.isSuccess ? '⚔️' : '⚠️'}</span>
                  <span>
                    {rollResult.mode === 'retreat'
                      ? (rollResult.isSuccess ? 'You Slip Away' : 'Run Down While Fleeing')
                      : rollResult.died
                        ? 'You Fall on the Road'
                        : rollResult.isSuccess
                          ? (rollResult.isNarrowDiplomacy ? 'Toll Paid for Safe Passage' : rollResult.approach.winTitle)
                          : 'Ambush Overwhelms Your Position'}
                  </span>
                </h4>
                <p className="text-3xs leading-relaxed text-slate-300">
                  {rollResult.mode === 'retreat'
                    ? (rollResult.isSuccess
                      ? 'You break from the road and lose them in the rough country. No spoils, but no wounds either.'
                      : `They give chase and catch you before you get clear: ${rollResult.pursuit} HP of damage before you finally escape.`)
                    : rollResult.isSuccess
                      ? (rollResult.isNarrowDiplomacy ? rollResult.approach.narrowWinDesc : rollResult.approach.winDesc)
                      : rollResult.approach.failDesc}
                </p>
              </div>

              {/* Spoils & Consequences Summary */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-850 text-left space-y-2">
                <span className="text-4xs uppercase tracking-widest text-amber-400 font-bold block">
                  Encounter Aftermath & Rewards
                </span>

                <div className="flex flex-wrap gap-2 text-3xs">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-400">
                    ⏳ {PATROL_HOURS} hours on the road · fatigue spent
                  </span>
                  {rollResult.recovers && (
                    <span className="px-2 py-1 rounded bg-slate-950 border border-emerald-500/40 text-emerald-300">
                      🎒 Recovered the gear you lost on this road
                    </span>
                  )}
                  {rollResult.mode === 'retreat' ? (
                    !rollResult.isSuccess && (
                      <span className="px-2 py-1 rounded bg-slate-950 border border-red-500/30 text-red-400">
                        ❤️ Caught fleeing: -{rollResult.pursuit} HP
                      </span>
                    )
                  ) : rollResult.isSuccess ? (
                    <>
                      {rollResult.isNarrowDiplomacy ? (
                        <>
                          <span className="px-2 py-1 rounded bg-slate-950 border border-red-500/30 text-red-400">
                            💰 Toll Paid: -{rollResult.appliedToll} Gold
                          </span>
                          <span className="px-2 py-1 rounded bg-slate-950 border border-blue-500/30 text-blue-400">
                            ⚖️ Morality: +1
                          </span>
                        </>
                      ) : (
                        <>
                          {rollResult.loot?.gold > 0 && (
                            <span className="px-2 py-1 rounded bg-slate-950 border border-amber-500/30 text-amber-400">
                              💰 Gold Looted: +{rollResult.loot.gold}g
                            </span>
                          )}
                          {rollResult.loot?.morality > 0 && (
                            <span className="px-2 py-1 rounded bg-slate-950 border border-blue-500/30 text-blue-400">
                              ⚖️ Morality: +{rollResult.loot.morality}
                            </span>
                          )}
                          {rollResult.loot?.items?.map((it, idx) => (
                            <span key={idx} className="px-2 py-1 rounded bg-slate-950 border border-purple-500/30 text-purple-300">
                              🎁 Loot: {it}
                            </span>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-slate-950 border border-red-500/30 text-red-400">
                        ❤️ Damage Taken: -{rollResult.failDamage} HP{rollResult.died ? ' — fatal' : ''}
                      </span>
                      {rollResult.stolenGold > 0 && (
                        <span className="px-2 py-1 rounded bg-slate-950 border border-red-500/30 text-red-400">
                          💰 Gold Stolen: -{rollResult.stolenGold}g
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Dismiss Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-450 text-slate-950 font-bold rounded text-3xs uppercase tracking-wider transition-all shadow-lg text-center cursor-pointer"
                >
                  Continue Journey
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        {!rollResult && (
          <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center">
            <span className="text-4xs text-slate-500 italic">
              Fleeing is an Athletics roll. Fail, and they run you down.
            </span>
            <button
              type="button"
              onClick={handleRetreat}
              className="px-4 py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 text-3xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Flee & Retreat
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
