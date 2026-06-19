import { signCharacter, compressCharacter } from './secureHash';

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
  let moralityLabel = "Neutral";
  if (morality > 50) moralityLabel = "Heroic";
  else if (morality > 10) moralityLabel = "Pragmatic Hero";
  else if (morality < -50) moralityLabel = "Villainous";
  else if (morality < -10) moralityLabel = "Ruthless Pragmatist";

  // Build relationships HTML
  const relations = character.relationships || {};
  const relationsHtml = Object.keys(relations).length > 0 
    ? Object.keys(relations).map(k => `<li><span class="skill-name">${k}:</span> <span class="skill-ranks">${relations[k]}</span></li>`).join('')
    : '<li style="color: #94a3b8; font-style: italic;">No notable relationships</li>';

  // Build storage HTML
  const storageItems = character.storage || [];
  const storageHtml = storageItems.length > 0
    ? storageItems.map(item => `<li><span class="skill-name">${item}</span></li>`).join('')
    : '<li style="color: #94a3b8; font-style: italic;">Vault is empty</li>';

  // Build strongholds HTML
  const strongholds = character.strongholds || [];
  const strongholdsHtml = strongholds.length > 0
    ? strongholds.map(sh => `<li><span class="skill-name">${sh}</span></li>`).join('')
    : '<li style="color: #94a3b8; font-style: italic;">No strongholds claimed</li>';

  // Build scars HTML
  const scars = character.scars?.notes || [];
  const scarsHtml = scars.length > 0
    ? scars.map(scar => `<li style="color: #f87171;"><span class="skill-name">${scar}</span></li>`).join('')
    : '<li style="color: #94a3b8; font-style: italic;">Unscarred</li>';

  printWindow.document.write(`
    <html>
      <head>
        <title>Shattered Saga - Character Sheet: ${character.name}</title>
        <style>
          body {
            background-color: #0f172a;
            color: #f8fafc;
            font-family: Georgia, serif;
            margin: 0;
            padding: 40px;
          }
          .sheet-container {
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
            font-size: 2.5em;
            text-align: center;
            margin-top: 0;
            border-bottom: 2px solid #d97706;
            padding-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .col {
            flex: 1;
            margin-right: 20px;
          }
          .col:last-child {
            margin-right: 0;
          }
          .section-title {
            color: #f59e0b;
            font-size: 1.2em;
            border-bottom: 1px solid #475569;
            padding-bottom: 4px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .stat-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 10px;
          }
          .stat-item {
            background-color: #0f172a;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #334155;
            display: flex;
            justify-content: space-between;
          }
          .stat-name {
            color: #94a3b8;
            text-transform: capitalize;
          }
          .stat-value {
            color: #f59e0b;
            font-weight: bold;
          }
          .skills-list {
            list-style-type: none;
            padding-left: 0;
            margin: 0;
          }
          .skills-list li {
            padding: 4px 0;
            border-bottom: 1px dashed #334155;
            display: flex;
            justify-content: space-between;
          }
          .skill-name {
            color: #e2e8f0;
          }
          .skill-ranks {
            color: #fbbf24;
            font-weight: bold;
          }
          .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #0f172a;
            border: 1px solid #d97706;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .qr-title {
            color: #f59e0b;
            font-size: 0.9em;
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .signature-label {
            margin-top: 10px;
            font-family: monospace;
            font-size: 8px;
            color: #64748b;
            word-break: break-all;
            max-width: 150px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            background-color: #d97706;
            color: #0f172a;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8em;
          }
          .info-list {
            list-style: none;
            padding: 0;
          }
          .info-list li {
            margin-bottom: 8px;
            font-size: 0.95em;
          }
          .info-label {
            color: #94a3b8;
          }
          .portrait-frame {
            width: 150px;
            height: 150px;
            border: 2px solid #d97706;
            border-radius: 8px;
            overflow: hidden;
            background-color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .raw-data-payload {
            color: #1e293b;
            font-size: 1px;
            opacity: 0.01;
            word-break: break-all;
            max-height: 1px;
            overflow: hidden;
            line-height: 1px;
            font-family: monospace;
          }
          .portrait-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .portrait-placeholder {
            color: #475569;
            font-size: 3em;
            font-family: serif;
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
            .sheet-container {
              background-color: #ffffff;
              border: 1px solid #000000;
              box-shadow: none;
              color: #000000;
              padding: 15px;
              margin: 0 auto;
              max-width: 100%;
              border-radius: 0;
            }
            h1 {
              font-size: 1.6em;
              margin-top: 0;
              margin-bottom: 5px;
              color: #000000;
            }
            .row {
              margin-bottom: 8px;
            }
            .section-title {
              font-size: 1em;
              margin-bottom: 5px;
              color: #000000;
            }
            .stat-grid {
              gap: 5px;
            }
            .stat-item {
              background-color: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 4px;
            }
            .stat-value, .skill-ranks, .qr-title {
              color: #000000;
            }
            .skills-list li {
              padding: 2px 0;
              border-bottom: 1px dashed #cbd5e1;
            }
            .qr-section {
              background-color: #ffffff;
              border: 1px solid #000000;
              padding: 8px;
            }
            .signature-label {
              color: #475569;
              max-width: 120px;
            }
            .badge {
              border: 1px solid #000000;
              background-color: #f1f5f9;
              color: #000000;
              font-size: 0.7em;
            }
            .portrait-frame {
              border: 1.5px solid #000000;
              width: 110px;
              height: 110px;
            }
            .raw-data-payload {
              color: #ffffff !important;
              font-size: 1px !important;
              opacity: 0.01 !important;
              max-height: 1px !important;
              overflow: hidden !important;
            }
            .skill-name, .info-label, strong, span, li, p, div {
              color: #000000 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet-container">
          <h1>Shattered Saga</h1>
          <div style="text-align: center; margin-bottom: 25px;">
            <span class="badge">Official Signed Character Record</span>
          </div>
          
          <div class="row">
            <div class="col" style="flex: 1.2;">
              <div class="section-title">Character Identity</div>
              <ul class="info-list">
                <li><span class="info-label">Name:</span> <strong>${character.name}</strong></li>
                <li><span class="info-label">Gender:</span> ${character.gender}</li>
                <li><span class="info-label">Age Tier:</span> <span style="text-transform: capitalize;">${character.age}</span></li>
                <li><span class="info-label">Primal Element:</span> <span style="text-transform: capitalize;">${character.element}</span></li>
                <li><span class="info-label">Philosophy:</span> ${character.philosophy}</li>
                <li><span class="info-label">Virtue:</span> ${character.virtue}</li>
                <li><span class="info-label">Vice:</span> ${character.vice}</li>
                <li><span class="info-label">Morality:</span> ${moralityLabel} (${morality > 0 ? '+' : ''}${morality})</li>
                <li><span class="info-label">Level:</span> ${character.stats.level}</li>
                <li><span class="info-label">Health:</span> ${character.stats.hp} / ${character.stats.maxHp} HP</li>
                <li><span class="info-label">Gold:</span> <strong>${character.currency?.gold ?? 0} gp</strong></li>
                <li><span class="info-label">Fate Coins:</span> <strong>${character.currency?.fateCoins ?? 0}</strong></li>
              </ul>
            </div>
            
            <div class="col" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
              <div class="portrait-frame">
                ${character.portraitUrl 
                  ? `<img class="portrait-img" src="${character.portraitUrl}" alt="${character.name}" />`
                  : `<div class="portrait-placeholder">?</div>`
                }
              </div>
              <div class="qr-section" style="border-color: #475569;">
                <div class="qr-title" style="color: #94a3b8;">VERIFIED RECORD</div>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(base64Payload)}" alt="QR Code" style="width: 100px; height: 100px; margin: 8px 0; border: 4px solid white; border-radius: 4px;" />
                <div style="font-size: 8px; color: #cbd5e1; margin-bottom: 5px;">Scan to Import Hero</div>
                <div class="signature-label" style="font-size: 8px; word-break: break-all;">SIG: ${signedChar.signature}</div>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col">
              <div class="section-title">Core Attributes</div>
              <div class="stat-grid">
                ${Object.keys(character.attributes).map(attr => `
                  <div class="stat-item">
                    <span class="stat-name">${attr}</span>
                    <span class="stat-value">${character.attributes[attr]}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="row" style="margin-top: 10px;">
            <div class="col">
              <div class="section-title">Trained Skills</div>
              <ul class="skills-list">
                ${Object.keys(character.skills)
                  .filter(sk => character.skills[sk] > 0)
                  .map(sk => `
                    <li>
                      <span class="skill-name" style="text-transform: capitalize;">${sk.replace('_', ' ')}</span>
                      <span class="skill-ranks">${character.skills[sk]} Ranks</span>
                    </li>
                  `).join('')}
                ${Object.values(character.skills).every(v => v === 0) ? '<li style="color: #94a3b8; font-style: italic;">No trained skills</li>' : ''}
              </ul>
            </div>
            
            <div class="col">
              <div class="section-title">Backpack Inventory</div>
              <ul class="skills-list">
                ${character.inventory.map(item => `
                  <li><span class="skill-name" style="text-transform: capitalize;">${item}</span></li>
                `).join('')}
                ${character.inventory.length === 0 ? '<li style="color: #94a3b8; font-style: italic;">Backpack is empty</li>' : ''}
              </ul>
            </div>
          </div>

          <div class="row" style="margin-top: 10px;">
            <div class="col">
              <div class="section-title">Storage Vault</div>
              <ul class="skills-list">
                ${storageHtml}
              </ul>
            </div>
            
            <div class="col">
              <div class="section-title">Strongholds</div>
              <ul class="skills-list">
                ${strongholdsHtml}
              </ul>
            </div>
          </div>

          <div class="row" style="margin-top: 10px;">
            <div class="col">
              <div class="section-title">Key Relationships</div>
              <ul class="skills-list">
                ${relationsHtml}
              </ul>
            </div>
            
            <div class="col">
              <div class="section-title">Narrative Scars</div>
              <ul class="skills-list">
                ${scarsHtml}
              </ul>
            </div>
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
