import { signCharacter, compressCharacter } from './secureHash';
import { calculateWeightAndVolume } from './items';
import { SKILLS_LIST, ELEMENTS_LIST, PROFESSIONS_LIST, ATTRIBUTE_LIST } from '../data/gms';

const ELEMENTAL_ABILITIES = {
  fire: { name: 'Cinderbreath', effect: 'Cone of flame (2d6 fire/blunt damage split or ignite hazard)' },
  earth: { name: 'Stone Mantle', effect: 'Skin of living stone (+1d6 armor soak for 3 rounds)' },
  air: { name: 'Gale Flash', effect: 'Blinding spiral of wind/dust (disorients foe for 2 rounds)' },
  water: { name: 'Tide Mend', effect: 'Heals 1d6+2 HP, stops Bleeding Tier 1/2, cleanses poison' },
  aether: { name: 'Threadstep', effect: 'Teleport 15 yds along aether thread, escape restraint, or save roll' }
};

function getStepDie(val) {
  if (val <= 1) return 'd4';
  if (val === 2) return 'd6';
  if (val === 3) return 'd8';
  if (val === 4) return 'd10';
  if (val === 5) return 'd12';
  return 'd20';
}

export function printCharacterSheet(character) {
  const signedChar = signCharacter(character);
  const compressedChar = compressCharacter(signedChar);
  const characterJson = JSON.stringify(compressedChar);
  const base64Payload = btoa(unescape(encodeURIComponent(characterJson)));
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocker prevented opening the print window.");
    return;
  }
  
  // Format Morality
  const morality = character.morality ?? 0;
  let moralityLabel = "Neutral / Pragmatic";
  let moralityBonus = "None";
  if (morality >= 60) {
    moralityLabel = "Exalted";
    moralityBonus = "+3 Atk & Dmg vs Fiends / Undead";
  } else if (morality >= 40) {
    moralityLabel = "Saintly";
    moralityBonus = "+2 Atk & Dmg vs Fiends / Undead";
  } else if (morality >= 20) {
    moralityLabel = "Virtuous";
    moralityBonus = "+1 Atk & Dmg vs Fiends / Undead";
  } else if (morality <= -60) {
    moralityLabel = "Scourge";
    moralityBonus = "+3 Atk & Dmg vs Innocents / Guards";
  } else if (morality <= -40) {
    moralityLabel = "Vile";
    moralityBonus = "+2 Atk & Dmg vs Innocents / Guards";
  } else if (morality <= -20) {
    moralityLabel = "Cruel";
    moralityBonus = "+1 Atk & Dmg vs Innocents / Guards";
  }

  // Map professions
  const profList = (character.professions || []).map(pId => {
    const found = PROFESSIONS_LIST.find(p => p.id === pId);
    return found ? found.name : (pId.charAt(0).toUpperCase() + pId.slice(1));
  }).join(', ') || 'Adventurer';

  // Map element & ability
  const elemKey = (character.element || 'air').toLowerCase();
  const elemData = ELEMENTS_LIST.find(e => e.id === elemKey) || { name: 'Air' };
  const signatureAbility = ELEMENTAL_ABILITIES[elemKey] || ELEMENTAL_ABILITIES.air;

  // Age label
  const ageLabel = character.age === 'youth' ? 'Youthful' : character.age === 'elder' ? 'Elder' : 'Middle Age';

  // Stats & Vitals
  const stats = character.stats || {};
  const hp = stats.hp ?? 10;
  const maxHp = stats.maxHp ?? 10;
  const fatigue = Math.round((stats.fatigue ?? 0) * 10) / 10;
  const maxFatigue = Math.round((stats.maxFatigue ?? 15) * 10) / 10;
  const arcaneSP = stats.arcaneSP ?? 0;
  const maxArcaneSP = stats.maxArcaneSP ?? 0;
  const divineSP = stats.divineSP ?? 0;
  const maxDivineSP = stats.maxDivineSP ?? 0;

  const isDying = hp <= 0;
  const isBleeding = stats.isBleeding || (stats.bleedingTier && stats.bleedingTier > 0);
  const bleedStatus = isDying ? 'DYING (0 HP)' : isBleeding ? `Bleeding Tier ${stats.bleedingTier || 1}` : 'Stable';
  const fatigueCondition = fatigue >= 100 ? 'COLLAPSED' : fatigue >= 70 ? 'Strained (-2)' : 'Rested';

  // Encumbrance calculation
  let encumbrance = { totalWeight: 0, maxWeight: 50, totalVolume: 0, maxVolume: 5, encumbranceLevel: 'Normal', penalties: 'None' };
  try {
    encumbrance = calculateWeightAndVolume(character);
  } catch (e) {
    console.warn("Could not calculate weight/volume:", e);
  }

  // Equipment slots
  const eq = character.equipment || {};
  const eqHead = eq.head || 'None';
  const eqNeck = eq.neck || 'None';
  const eqBody = eq.armor_body || 'Cloth Garments';
  const eqMain = eq.right_hand || eq.hand_right || (character.inventory?.find(i => /sword|dagger|bow|axe|staff|spear/i.test(i)) || 'Dagger');
  const eqOff = eq.left_hand || eq.hand_left || (character.inventory?.find(i => /shield/i.test(i)) || 'None');
  const eqHands = eq.hands || 'None';
  const eqRings = [eq.ring_left, eq.ring_right].filter(Boolean).join(', ') || 'None';
  const eqHips = [eq.hip_left, eq.hip_right].filter(Boolean).join(', ') || 'None';
  const eqPack = eq.backpack || 'Canvas Satchel (5L)';

  // Build relationships HTML
  const relations = character.relationships || {};
  const relationsHtml = Object.keys(relations).length > 0 
    ? Object.keys(relations).map(k => `<li><strong>${k}:</strong> ${relations[k]}</li>`).join('')
    : '<li class="empty-note">No notable relationships</li>';

  // Build scars HTML
  const scars = character.scars?.notes || [];
  const scarsHtml = scars.length > 0
    ? scars.map(scar => `<li class="scar-note">${scar}</li>`).join('')
    : '<li class="empty-note">Unscarred</li>';

  // Active quests
  const quests = character.active_quests || ['Explore the Shattered Realm'];
  const questsHtml = quests.length > 0
    ? quests.map(q => `<li>${q}</li>`).join('')
    : '<li class="empty-note">No active quests</li>';

  // Inventory list
  const invItems = character.inventory || [];
  const invHtml = invItems.length > 0
    ? invItems.map(item => `<li>${item}</li>`).join('')
    : '<li class="empty-note">Backpack is empty</li>';

  // Core Attributes
  const attributes = character.attributes || {
    power: 1, coordination: 1, vigor: 1, willpower: 1,
    intellect: 1, charisma: 1, attunement: 1, empathy: 1
  };

  const attrList = [
    { key: 'power', label: 'POWER', abbr: 'POW', role: 'Melee / Force' },
    { key: 'coordination', label: 'COORDINATION', abbr: 'CO', role: 'Agility / Aim' },
    { key: 'vigor', label: 'VIGOR', abbr: 'VI', role: 'Health / Soak' },
    { key: 'willpower', label: 'WILLPOWER', abbr: 'WI', role: 'Resolve / Ward' },
    { key: 'intellect', label: 'INTELLECT', abbr: 'IN', role: 'Logic / Lore' },
    { key: 'charisma', label: 'CHARISMA', abbr: 'CH', role: 'Speech / Lead' },
    { key: 'attunement', label: 'ATTUNEMENT', abbr: 'AT', role: 'Magic / Leyline' },
    { key: 'empathy', label: 'EMPATHY', abbr: 'EM', role: 'Insight / Divine' }
  ];

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Shattered Saga — Official Character Sheet: ${character.name}</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            background-color: #0b1120;
            color: #f1f5f9;
            font-family: Georgia, "Times New Roman", serif;
            margin: 0;
            padding: 24px;
            font-size: 11px;
            line-height: 1.25;
          }
          .sheet-container {
            border: 3px double #d97706;
            border-radius: 8px;
            padding: 20px 24px;
            max-width: 900px;
            margin: 0 auto;
            background-color: #111c33;
            box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          }
          .sheet-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #b45309;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .header-titles {
            text-align: center;
            flex: 1;
          }
          h1 {
            color: #f59e0b;
            font-size: 1.9em;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
          }
          .subtitle {
            color: #d97706;
            font-size: 0.8em;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 2px;
          }
          .tagline {
            color: #94a3b8;
            font-size: 0.65em;
            font-style: italic;
          }
          .crest-placeholder {
            width: 48px;
            height: 48px;
            border: 1px solid #d97706;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4em;
            color: #fbbf24;
            background: #1e293b;
          }
          
          /* Identity Section */
          .identity-grid {
            display: grid;
            grid-template-columns: 2.2fr 1fr;
            gap: 12px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 10px;
          }
          .identity-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .id-line {
            display: flex;
            align-items: baseline;
            gap: 6px;
            flex-wrap: wrap;
          }
          .label {
            color: #94a3b8;
            font-weight: bold;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .val {
            color: #f8fafc;
            font-weight: 600;
          }
          .val-gold {
            color: #fbbf24;
            font-weight: bold;
          }
          .portrait-qr-panel {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
          }
          .portrait-box {
            width: 60px;
            height: 60px;
            border: 1px solid #d97706;
            border-radius: 4px;
            overflow: hidden;
            background: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .portrait-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .qr-box {
            text-align: center;
          }
          .qr-box img {
            width: 60px;
            height: 60px;
            border: 2px solid #fff;
            border-radius: 4px;
          }
          .qr-caption {
            font-size: 6.5px;
            color: #94a3b8;
            margin-top: 2px;
            font-family: monospace;
          }

          /* Attributes Row */
          .section-title {
            color: #f59e0b;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #475569;
            padding-bottom: 3px;
            margin: 8px 0 6px 0;
          }
          .attr-strip {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 5px;
            margin-bottom: 10px;
          }
          .attr-card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 4px;
            padding: 5px 2px;
            text-align: center;
          }
          .attr-name {
            color: #94a3b8;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .attr-role {
            color: #64748b;
            font-size: 5.5px;
            margin-bottom: 2px;
          }
          .attr-val {
            color: #fbbf24;
            font-size: 1.25em;
            font-weight: bold;
            line-height: 1;
            margin: 2px 0;
          }
          .attr-die {
            color: #d97706;
            font-size: 8px;
            font-weight: bold;
            background: #1e293b;
            border-radius: 2px;
            padding: 1px 3px;
            display: inline-block;
          }

          /* Vitals & Magic Wells */
          .vitals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1.3fr;
            gap: 8px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 10px;
          }
          .vital-card {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .vital-title {
            color: #f59e0b;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .vital-value {
            color: #f8fafc;
            font-size: 1.1em;
            font-weight: bold;
          }
          .vital-sub {
            color: #94a3b8;
            font-size: 7px;
          }

          /* 36 Skills Grid */
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px 10px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 10px;
          }
          .skill-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 4px;
            border-bottom: 1px dashed #1e293b;
            font-size: 7.5px;
          }
          .skill-item.trained {
            background: rgba(217, 119, 6, 0.1);
            border-radius: 2px;
          }
          .skill-name-col {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .skill-name {
            color: #e2e8f0;
            font-weight: 500;
          }
          .skill-item.trained .skill-name {
            color: #fbbf24;
            font-weight: bold;
          }
          .skill-attr-tag {
            color: #64748b;
            font-size: 6.5px;
          }
          .skill-ranks-badge {
            color: #94a3b8;
            font-weight: bold;
            font-size: 7px;
          }
          .skill-item.trained .skill-ranks-badge {
            color: #fbbf24;
          }

          /* Gear & Adventure Journal */
          .bottom-split {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .bottom-card {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 6px;
            padding: 8px 10px;
          }
          .gear-list, .journal-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
            font-size: 7.5px;
          }
          .gear-list li, .journal-list li {
            border-bottom: 1px dotted #1e293b;
            padding-bottom: 2px;
          }
          .empty-note {
            color: #64748b;
            font-style: italic;
          }
          .scar-note {
            color: #f87171;
          }
          .encumbrance-box {
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px solid #334155;
            font-size: 7px;
            color: #cbd5e1;
            display: flex;
            justify-content: space-between;
          }

          /* Colophon & Verification */
          .footer-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #334155;
            padding-top: 6px;
            font-size: 6.5px;
            color: #64748b;
          }
          .raw-data-payload {
            display: none;
          }

          /* Strict 1-Page Print Media Styles */
          @media print {
            @page {
              size: letter portrait;
              margin: 0.28in 0.32in;
            }
            body {
              background-color: #ffffff !important;
              color: #111827 !important;
              padding: 0 !important;
              margin: 0 !important;
              font-size: 8px !important;
              line-height: 1.15 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .sheet-container {
              background-color: #ffffff !important;
              border: 1.5px solid #8c7355 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 6px 10px !important;
              max-width: 100% !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
            }
            .sheet-header {
              border-bottom: 1.5px solid #6b1515 !important;
              padding-bottom: 4px !important;
              margin-bottom: 6px !important;
            }
            h1 {
              color: #6b1515 !important;
              font-size: 1.5em !important;
            }
            .subtitle {
              color: #78450a !important;
              font-size: 0.75em !important;
            }
            .tagline {
              color: #4b5563 !important;
              font-size: 0.6em !important;
            }
            .crest-placeholder {
              border: 1px solid #78450a !important;
              color: #6b1515 !important;
              background: #f8f7f4 !important;
            }
            .identity-grid, .attr-card, .vitals-grid, .skills-grid, .bottom-card {
              background: #ffffff !important;
              border: 0.8px solid #cbd5e1 !important;
            }
            .label, .attr-name, .attr-role, .vital-title, .vital-sub, .skill-attr-tag, .footer-strip, .qr-caption {
              color: #374151 !important;
            }
            .val, .vital-value, .skill-name {
              color: #111827 !important;
            }
            .val-gold, .attr-val, .attr-die, .skill-item.trained .skill-ranks-badge {
              color: #6b1515 !important;
            }
            .attr-die {
              background: #f1f5f9 !important;
              border: 0.5px solid #cbd5e1 !important;
            }
            .section-title {
              color: #6b1515 !important;
              border-bottom: 1px solid #94a3b8 !important;
              font-size: 0.8em !important;
              margin: 4px 0 !important;
            }
            .skill-item.trained {
              background: #f8f4eb !important;
            }
            .skill-item.trained .skill-name {
              color: #6b1515 !important;
            }
            .qr-box img {
              border: 1px solid #000 !important;
            }
            .encumbrance-box {
              color: #111827 !important;
              border-top: 0.5px solid #cbd5e1 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <!-- Top Title Bar -->
          <div class="sheet-header">
            <div class="crest-placeholder">⚔</div>
            <div class="header-titles">
              <h1>Shattered Saga</h1>
              <div class="subtitle">Official Character Record & Champion's Chronicle</div>
              <div class="tagline">Canonical Rules v7.0 • ACALI Studios • Online Realm at shatteredsaga.com</div>
            </div>
            <div class="crest-placeholder">🛡</div>
          </div>

          <!-- Identity & Concept -->
          <div class="identity-grid">
            <div class="identity-col">
              <div class="id-line">
                <span class="label">Champion:</span> <span class="val" style="font-size: 1.15em;">${character.name}</span>
                <span class="label" style="margin-left: 8px;">Professions:</span> <span class="val">${profList}</span>
                <span class="label" style="margin-left: 8px;">Level:</span> <span class="val-gold">${stats.level ?? 1}</span>
              </div>
              <div class="id-line">
                <span class="label">Element:</span> <span class="val">${elemData.name}</span>
                <span class="label" style="margin-left: 8px;">Age:</span> <span class="val">${ageLabel}</span>
                <span class="label" style="margin-left: 8px;">Setting:</span> <span class="val">${character.setting || 'High Fantasy'}</span>
                <span class="label" style="margin-left: 8px;">Gold:</span> <span class="val-gold">${character.currency?.gold ?? 0} gp</span>
                <span class="label" style="margin-left: 4px;">Fate:</span> <span class="val-gold">${character.currency?.fateCoins ?? 0}</span>
              </div>
              <div class="id-line">
                <span class="label">Virtue:</span> <span class="val">${character.virtue || 'Justice'}</span>
                <span class="label" style="margin-left: 8px;">Vice:</span> <span class="val">${character.vice || 'Pride'}</span>
                <span class="label" style="margin-left: 8px;">Philosophy:</span> <span class="val">${character.philosophy || 'Preservation'}</span>
              </div>
              <div class="id-line">
                <span class="label">Morality:</span> <span class="val">${moralityLabel} (${morality > 0 ? '+' : ''}${morality})</span>
                <span class="label" style="margin-left: 8px; font-size: 6.5px; color: #d97706;">Tactical Bonus: ${moralityBonus}</span>
              </div>
            </div>

            <div class="portrait-qr-panel">
              <div class="portrait-box">
                ${character.portraitUrl 
                  ? `<img src="${character.portraitUrl}" alt="${character.name}" />`
                  : `<span style="font-size: 1.5em; color: #64748b;">?</span>`
                }
              </div>
              <div class="qr-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(base64Payload)}" alt="QR Code" />
                <div class="qr-caption">Scan to Import Hero</div>
              </div>
            </div>
          </div>

          <!-- Core Attributes (8 Stats) -->
          <div class="section-title">Core Attributes & Step-Die Polyhedrals</div>
          <div class="attr-strip">
            ${attrList.map(a => {
              const val = attributes[a.key] || 1;
              const die = getStepDie(val);
              return `
                <div class="attr-card">
                  <div class="attr-name">${a.abbr}</div>
                  <div class="attr-role">${a.role}</div>
                  <div class="attr-val">${val}</div>
                  <div class="attr-die">${die}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Vitals, Dual Magic & Crucible -->
          <div class="vitals-grid">
            <div class="vital-card">
              <div class="vital-title">Hit Points (HP)</div>
              <div class="vital-value">${hp} / ${maxHp}</div>
              <div class="vital-sub">Status: ${bleedStatus}</div>
            </div>
            <div class="vital-card">
              <div class="vital-title">Fatigue (Stamina)</div>
              <div class="vital-value">${fatigue} / ${maxFatigue}</div>
              <div class="vital-sub">${fatigueCondition} (70+ Strain / 100 Collapse)</div>
            </div>
            <div class="vital-card">
              <div class="vital-title">Dual Magic Wells</div>
              <div class="vital-value" style="font-size: 0.95em;">
                Arcane: ${arcaneSP}/${maxArcaneSP} • Divine: ${divineSP}/${maxDivineSP}
              </div>
              <div class="vital-sub">Convert 3 SP ↔ 1 SP (or Burnout)</div>
            </div>
            <div class="vital-card">
              <div class="vital-title">Elemental Crucible Awakening</div>
              <div class="vital-value" style="font-size: 0.95em; color: #fbbf24;">
                ${signatureAbility.name} (${elemKey.toUpperCase()})
              </div>
              <div class="vital-sub">${signatureAbility.effect}</div>
            </div>
          </div>

          <!-- 36 Canonical Skills Almanac -->
          <div class="section-title">The 36 Canonical Skills Almanac (Rank 0–5 • +1d2 per Rank)</div>
          <div class="skills-grid">
            ${SKILLS_LIST.map(sk => {
              const rk = character.skills?.[sk.id] || 0;
              const pAbbr = (sk.primary || '').substring(0, 2).toUpperCase();
              const sAbbr = (sk.secondary || '').substring(0, 2).toUpperCase();
              const isTrained = rk > 0;
              const pips = Array.from({ length: 5 }, (_, i) => i < rk ? '●' : '○').join(' ');
              return `
                <div class="skill-item ${isTrained ? 'trained' : ''}">
                  <div class="skill-name-col">
                    <span class="skill-name">${sk.name}</span>
                    <span class="skill-attr-tag">(${pAbbr}/${sAbbr})</span>
                  </div>
                  <div class="skill-ranks-badge">
                    ${isTrained ? `<span style="color: #fbbf24; margin-right: 3px;">+${rk}d2</span>` : ''}
                    <span>${pips}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Bottom: Equipped Loadout & Adventure Journal -->
          <div class="bottom-split">
            <!-- Equipped Loadout -->
            <div class="bottom-card">
              <div class="section-title" style="margin-top: 0;">Equipped Combat Loadout</div>
              <ul class="gear-list">
                <li><span class="label">Main Hand:</span> ${eqMain}</li>
                <li><span class="label">Off Hand:</span> ${eqOff}</li>
                <li><span class="label">Body Armor:</span> ${eqBody}</li>
                <li><span class="label">Head / Neck:</span> ${eqHead} • ${eqNeck}</li>
                <li><span class="label">Hands / Rings:</span> ${eqHands} • ${eqRings}</li>
                <li><span class="label">Hip Sheaths:</span> ${eqHips}</li>
                <li><span class="label">Backpack:</span> ${eqPack}</li>
              </ul>
              <div class="encumbrance-box">
                <div>Weight: <strong>${Math.round((encumbrance.totalWeight || 0)*10)/10} / ${encumbrance.maxWeight || 50} lbs</strong></div>
                <div>Volume: <strong>${Math.round((encumbrance.totalVolume || 0)*10)/10} / ${encumbrance.maxVolume || 5} L</strong></div>
                <div>Status: <strong>${encumbrance.encumbranceLevel || 'Normal'}</strong></div>
              </div>
            </div>

            <!-- Backpack & Journal -->
            <div class="bottom-card">
              <div class="section-title" style="margin-top: 0;">Backpack Gear & Active Quests</div>
              <ul class="journal-list">
                <li><span class="label">Active Quests:</span></li>
                ${questsHtml}
                <li style="margin-top: 4px;"><span class="label">Backpack Inventory:</span></li>
                ${invHtml}
                <li style="margin-top: 4px;"><span class="label">Narrative Scars & Boons:</span></li>
                ${scarsHtml}
              </ul>
            </div>
          </div>

          <!-- Footer Verification Strip -->
          <div class="footer-strip">
            <div>ACALI STUDIOS VERIFIED RECORD • SHA-256: <code>${signedChar.signature?.substring(0, 16)}...</code></div>
            <div>Day ${stats.day ?? 1}, Hour ${stats.hour ?? 12}:00 • Play Online: https://shatteredsaga.com</div>
          </div>

          <div class="raw-data-payload">DATA_START:${base64Payload}:DATA_END</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function printAdventureLog(character, history) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocker prevented opening the print window.");
    return;
  }

  // Build the chronicle history log HTML
  const turnsHtml = history.map((turn) => {
    const isUser = turn.role === 'user';
    if (isUser) {
      return `
        <div class="turn-block user-turn">
          <div class="turn-header">Player Action</div>
          <div class="turn-content">${turn.content}</div>
        </div>
      `;
    } else {
      const imgHtml = turn.imageUrl 
        ? `
          <div class="turn-image-container">
            <img src="${turn.imageUrl}" class="turn-image" alt="Scene Visualization" />
            <div class="image-caption">Visualized: ${turn.imagePrompt || ''}</div>
          </div>
        ` 
        : '';
      return `
        <div class="turn-block gm-turn">
          <div class="turn-header">Game Master Narration</div>
          <div class="turn-content narration">${turn.content}</div>
          ${imgHtml}
        </div>
      `;
    }
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Shattered Saga — Chronicle of ${character.name}</title>
        <style>
          body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: Georgia, serif;
            margin: 0;
            padding: 40px;
          }
          .log-container {
            border: 3px double #d97706;
            border-radius: 12px;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #1e293b;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }
          h1 {
            color: #fbbf24;
            font-size: 2.2em;
            text-align: center;
            margin-top: 0;
            border-bottom: 2px solid #d97706;
            padding-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .char-info-bar {
            background-color: #0f172a;
            border: 1px solid rgba(217, 119, 6, 0.3);
            border-radius: 6px;
            padding: 12px 18px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 0.85em;
          }
          .info-item {
            color: #cbd5e1;
          }
          .info-item strong {
            color: #fbbf24;
          }
          .timeline {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .turn-block {
            border-left: 3px solid #475569;
            padding-left: 15px;
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .user-turn {
            border-left-color: #d97706;
          }
          .gm-turn {
            border-left-color: #38bdf8;
          }
          .turn-header {
            font-size: 0.75em;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: bold;
            color: #94a3b8;
            margin-bottom: 6px;
          }
          .user-turn .turn-header {
            color: #f59e0b;
          }
          .gm-turn .turn-header {
            color: #38bdf8;
          }
          .turn-content {
            font-size: 0.95em;
            line-height: 1.6;
            color: #f1f5f9;
          }
          .turn-content.narration {
            white-space: pre-wrap;
          }
          .turn-image-container {
            margin-top: 15px;
            max-width: 500px;
            border: 1px solid #475569;
            border-radius: 6px;
            overflow: hidden;
            background-color: #0f172a;
          }
          .turn-image {
            width: 100%;
            height: auto;
            display: block;
          }
          .image-caption {
            background-color: #0f172a;
            padding: 6px 12px;
            font-size: 0.7em;
            font-style: italic;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #475569;
          }
          @media print {
            @page {
              size: auto;
              margin: 0;
            }
            body {
              background-color: #ffffff;
              color: #000000;
              padding: 0;
              margin: 1.2cm;
              font-size: 11px;
            }
            .log-container {
              background-color: #ffffff;
              border: 1px solid #000000;
              box-shadow: none;
              color: #000000;
              padding: 15px;
              max-width: 100%;
              border-radius: 0;
            }
            h1 {
              color: #000000;
              font-size: 1.6em;
              border-bottom: 1px solid #000000;
            }
            .char-info-bar {
              background-color: #ffffff;
              border: 1px solid #000000;
              color: #000000;
              padding: 8px 12px;
              margin-bottom: 20px;
            }
            .info-item, .info-item strong {
              color: #000000 !important;
            }
            .turn-block {
              border-left-width: 2px;
              border-left-color: #000000 !important;
              margin-bottom: 15px;
              padding-left: 10px;
            }
            .turn-header {
              color: #000000 !important;
              font-size: 0.7em;
            }
            .turn-content {
              color: #000000 !important;
              font-size: 0.9em;
            }
            .turn-image-container {
              border: 1px solid #000000;
              background-color: #ffffff;
              max-width: 380px;
              page-break-inside: avoid;
            }
            .image-caption {
              background-color: #ffffff;
              color: #000000 !important;
              border-top: 1px solid #000000;
            }
          }
        </style>
      </head>
      <body>
        <div class="log-container">
          <h1>Chronicle Adventure Log</h1>
          
          <div class="char-info-bar">
            <div class="info-item">Hero: <strong>${character.name}</strong></div>
            <div class="info-item">Level: <strong>${character.stats.level}</strong></div>
            <div class="info-item">Affinity: <strong>${character.element.toUpperCase()}-KIN</strong></div>
            <div class="info-item">Virtue: <strong>${character.virtue}</strong></div>
            <div class="info-item">Vice: <strong>${character.vice}</strong></div>
            <div class="info-item">Philosophy: <strong>${character.philosophy}</strong></div>
          </div>
          
          <div class="timeline">
            ${turnsHtml}
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
