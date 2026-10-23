import { useState } from 'react';
import { getCompanionCampfireInfo } from '../data/campfireInterludes';

// Hooks must not sit behind the isOpen early return (rules-of-hooks): React
// would see a different hook count when the modal opens and throw. The body
// mounts fresh on each open, so initial selections still reset as before.
export default function CampfireModal({ isOpen, ...props }) {
  return isOpen ? <CampfireModalBody {...props} /> : null;
}

function CampfireModalBody({
  character,
  onClose,
  onConfirmRest,
}) {
  const companionsList = (character?.companions || [])
    .map(id => getCompanionCampfireInfo(id))
    .filter(Boolean);

  const [selectedCompanionId, setSelectedCompanionId] = useState(
    companionsList.length > 0 ? companionsList[0].id : null
  );
  const [selectedDutyCompanionId, setSelectedDutyCompanionId] = useState(null);
  const [dialogueIndexMap, setDialogueIndexMap] = useState({});

  const selectedCompanion = companionsList.find(c => c.id === selectedCompanionId);

  const handleNextDialogue = (comp) => {
    if (!comp || !comp.dialogue) return;
    setDialogueIndexMap(prev => ({
      ...prev,
      [comp.id]: ((prev[comp.id] || 0) + 1) % comp.dialogue.length,
    }));
  };

  const handleToggleDuty = (comp) => {
    if (selectedDutyCompanionId === comp.id) {
      setSelectedDutyCompanionId(null);
    } else {
      setSelectedDutyCompanionId(comp.id);
    }
  };

  const handleSleep = () => {
    onConfirmRest(selectedDutyCompanionId);
  };

  const hasRations = (character?.inventory || []).some(item =>
    String(item).toLowerCase().includes('ration')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-black border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Campfire Visual Header Banner */}
        <div className="relative p-5 pb-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/60 via-slate-950 to-orange-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/40 border border-amber-500/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse">
              🔥
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-amber-200 text-lg tracking-wide">
                Campfire Interlude
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                <span>Setting up camp for an 8-Hour Rest</span>
                <span>•</span>
                <span className={hasRations ? 'text-emerald-400 font-mono text-[11px]' : 'text-rose-400 font-mono text-[11px]'}>
                  {hasRations ? '🍖 1 Ration will nourish you' : '⚠️ No rations available'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 flex items-center justify-center text-sm cursor-pointer transition-colors"
            title="Cancel Rest"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          
          {companionsList.length > 0 ? (
            <>
              {/* Party Members Roster Tabs */}
              <div>
                <span className="block text-[11px] font-serif font-bold uppercase tracking-wider text-amber-300/80 mb-2">
                  Allies Around the Fire ({companionsList.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {companionsList.map((comp) => {
                    const isSelected = selectedCompanionId === comp.id;
                    const hasActiveDuty = selectedDutyCompanionId === comp.id;

                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setSelectedCompanionId(comp.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className="text-xl">{comp.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-amber-200 truncate block text-[11px]">
                              {comp.name}
                            </span>
                            {hasActiveDuty && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-mono">
                                Duty
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {comp.role}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Companion Fireplace Conversation Card */}
              {selectedCompanion && (
                <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedCompanion.icon}</span>
                      <div>
                        <strong className="text-amber-200 font-serif text-sm block">
                          {selectedCompanion.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          Recruited from {selectedCompanion.recruitLocation}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNextDialogue(selectedCompanion)}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-[10px] cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      💬 Hear More Banter
                    </button>
                  </div>

                  {/* Dialogue Quote */}
                  <blockquote className="p-3 bg-black/40 rounded-lg border-l-2 border-amber-500/70 italic text-slate-300 text-[11px] leading-relaxed">
                    {selectedCompanion.dialogue[dialogueIndexMap[selectedCompanion.id] || 0]}
                  </blockquote>

                  {/* Companion Rest Duty Card */}
                  <div className="p-3 bg-gradient-to-r from-slate-950 to-slate-900 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🛠️</span>
                        <strong className="text-amber-300 font-serif text-xs">
                          {selectedCompanion.duty.name}
                        </strong>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {selectedCompanion.duty.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDuty(selectedCompanion)}
                      className={`px-3 py-1.5 rounded-lg font-serif font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                        selectedDutyCompanionId === selectedCompanion.id
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : 'bg-slate-900 border-amber-500/40 hover:border-amber-500 text-amber-300 hover:bg-slate-850'
                      }`}
                    >
                      {selectedDutyCompanionId === selectedCompanion.id
                        ? '✓ Duty Assigned'
                        : `Assign: ${selectedCompanion.duty.actionText}`}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Solo Camp Scene */
            <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-3xl">🏕️</span>
              <h4 className="font-serif font-bold text-amber-200 text-sm">
                Quiet Solitude by the Embers
              </h4>
              <p className="text-slate-300 text-[11px] max-w-md mx-auto leading-relaxed">
                You stoke the small fire alone, cleaning your gear as the twilight fades into dark. Recruit companions across the realm to unlock fireside dialogue, watch duties, and preparation perks!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-amber-500/30 bg-slate-950 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
          >
            Cancel Camp
          </button>

          <button
            type="button"
            onClick={handleSleep}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer transition-all border border-amber-400/50 flex items-center gap-2"
          >
            <span>🌙</span>
            <span>Sleep & Rest 8 Hours</span>
          </button>
        </div>

      </div>
    </div>
  );
}
