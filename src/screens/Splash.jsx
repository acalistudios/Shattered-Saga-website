import { useState, useRef } from 'react';
import banner from '../assets/images/banner.png';
import { validateCharacter, decompressCharacter } from '../utils/secureHash';
import storage from '../utils/storage';

const scanQrOnline = async (blobOrFile) => {
  const formData = new FormData();
  formData.append('file', blobOrFile);
  
  const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`QR server reader returned status ${response.status}`);
  }
  
  const results = await response.json();
  if (results && results[0] && results[0].symbol && results[0].symbol[0]) {
    const sym = results[0].symbol[0];
    if (sym.data) {
      return sym.data;
    }
    if (sym.error) {
      throw new Error(sym.error);
    }
  }
  return null;
};

export default function Splash({ 
  onImportCharacter,
  username,
  isLoggedIn,
  gems,
  onSocialLogin,
  onLogout,
  onLoadSlot,
  onCreateInSlot,
  onWipeSlot,
  onUnlockSlot,
  layoutMode = 'auto'
}) {
  const fileInputRef = useRef(null);
  const [importingSlot, setImportingSlot] = useState(null);
  const [importErrorSlotIdx, setImportErrorSlotIdx] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleSocialLogin = (profileName) => {
    onSocialLogin(profileName);
  };

  const handleLogout = () => {
    onLogout();
  };

  const triggerImportForSlot = (slotIdx) => {
    setImportingSlot(slotIdx);
    setImportError(null);
    setImportErrorSlotIdx(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0] && importingSlot !== null) {
      const file = e.target.files[0];
      await processSelectedFile(file, importingSlot);
    }
  };

  const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        window.pdfjsLib = pdfjsLib;
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF parsing library. Check your network.'));
      document.body.appendChild(script);
    });
  };

  const loadJsQr = () => {
    return new Promise((resolve, reject) => {
      if (window.jsQR) {
        resolve(window.jsQR);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.onload = () => {
        resolve(window.jsQR);
      };
      script.onerror = () => reject(new Error('Failed to load QR scanning library. Check your network.'));
      document.body.appendChild(script);
    });
  };

  const getCanvasFromPdfPage = async (page) => {
    const viewport = page.getViewport({ scale: 4.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas;
  };

  const getCanvasFromImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = () => reject(new Error('Failed to load image file.'));
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const scanCanvasForQr = (canvas, jsQR) => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code.data : null;
  };

  const scanCanvasRegionsForQr = (canvas, jsQR) => {
    // 1. Try full canvas
    let data = scanCanvasForQr(canvas, jsQR);
    if (data) return data;
    
    console.log("Full canvas scan failed. Trying cropped regions...");
    const w = canvas.width;
    const h = canvas.height;
    const regions = [
      // Top-Right Quadrant (where the QR code card is typically printed)
      { x: Math.floor(w * 0.5), y: Math.floor(h * 0.1), width: Math.floor(w * 0.45), height: Math.floor(h * 0.45), name: "Top-Right Quadrant" },
      // Tight QR Area
      { x: Math.floor(w * 0.55), y: Math.floor(h * 0.22), width: Math.floor(w * 0.4), height: Math.floor(h * 0.26), name: "Tight QR Area" },
      // Right Half of the page
      { x: Math.floor(w * 0.5), y: 0, width: Math.floor(w * 0.5), height: h, name: "Right Half" }
    ];

    for (const reg of regions) {
      try {
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = reg.width;
        cropCanvas.height = reg.height;
        const cropCtx = cropCanvas.getContext('2d');
        
        cropCtx.drawImage(
          canvas, 
          reg.x, reg.y, reg.width, reg.height, 
          0, 0, reg.width, reg.height
        );
        
        const cropData = scanCanvasForQr(cropCanvas, jsQR);
        if (cropData) {
          console.log(`Scan succeeded in cropped region: ${reg.name}`);
          return cropData;
        }
      } catch (err) {
        console.warn(`Cropped region ${reg.name} scan failed:`, err);
      }
    }
    return null;
  };

  const processSelectedFile = async (file, slotIdx) => {
    if (!file || slotIdx === null) return;

    setIsDecoding(true);
    setImportError(null);
    setImportErrorSlotIdx(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      const fileType = file.type || '';

      // Helper to process, validate, and import character JSON
      const processAndImportCharacter = (characterJson) => {
        let parsed = JSON.parse(characterJson);
        // Decompress if compressed format
        if (parsed.n !== undefined && parsed.name === undefined) {
          parsed = decompressCharacter(parsed);
        }
        if (validateCharacter(parsed)) {
          if (!isLoggedIn) {
            handleSocialLogin(parsed.name || 'Imported_Hero');
          }
          onImportCharacter(parsed, slotIdx);
          return true;
        } else {
          throw new Error('Validation failed: Tampered or invalid checksum signature.');
        }
      };

      // 1. Direct JSON File Import
      const isJson = fileNameLower.endsWith('.json') || fileType === 'application/json';
      if (isJson) {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
        processAndImportCharacter(text.trim());
        return;
      }

      // 2. Direct Image File Import (QR Code scan)
      const isImage = fileType.startsWith('image/') || fileNameLower.endsWith('.png') || fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg');
      if (isImage) {
        let qrData = null;
        
        // Try online scan first
        try {
          console.log('Attempting online QR scan for image...');
          qrData = await scanQrOnline(file);
        } catch (err) {
          console.warn('Online QR scan failed, falling back to local scan:', err);
        }
        
        // Fall back to local scan
        if (!qrData) {
          const jsQR = await loadJsQr();
          const canvas = await getCanvasFromImage(file);
          qrData = scanCanvasRegionsForQr(canvas, jsQR);
        }
        
        if (!qrData) {
          throw new Error('No QR code detected in the image. Please upload a clear photo or screenshot of the printed sheet showing the verified QR code.');
        }

        const characterJson = decodeURIComponent(escape(atob(qrData.trim())));
        processAndImportCharacter(characterJson);
        return;
      }

      // 3. Direct PDF File Import (Visual QR code scan with Text Layer Fallback)
      const isPdf = fileType === 'application/pdf' || fileNameLower.endsWith('.pdf');
      if (isPdf) {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Try visual QR code scanning first
        let qrData = null;
        try {
          const canvas = await getCanvasFromPdfPage(page);
          
          // Try online scan via blob
          try {
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
            if (blob) {
              console.log('Attempting online QR scan of PDF canvas blob...');
              qrData = await scanQrOnline(blob);
            }
          } catch (err) {
            console.warn('Online PDF canvas scan failed, falling back to local scan:', err);
          }
          
          // Fall back to local scan with regions
          if (!qrData) {
            const jsQR = await loadJsQr();
            qrData = scanCanvasRegionsForQr(canvas, jsQR);
          }
        } catch (qrErr) {
          console.warn('QR visual scan failed:', qrErr);
        }

        let base64Payload = null;
        if (qrData) {
          console.log('Successfully scanned QR code from PDF page pixels.');
          base64Payload = qrData.trim();
        } else {
          // Fall back to text layer extraction
          console.log('No QR code detected in PDF pixels. Falling back to text layer extraction...');
          const textContent = await page.getTextContent();
          const text = textContent.items.map(item => item.str).join('');
          const match = text.match(/DATA_START:(.+?):DATA_END/);
          if (!match) {
            throw new Error('This character sheet PDF does not contain a scanable QR code or embedded character metadata. If it was generated in an older version, please export a new sheet.');
          }
          base64Payload = match[1].trim();
        }

        const characterJson = decodeURIComponent(escape(atob(base64Payload)));
        processAndImportCharacter(characterJson);
        return;
      }

      throw new Error('Unsupported file format. Please upload the exported PDF character sheet, a screenshot/image, or a .json backup file.');
    } catch (err) {
      console.error('Import Error:', err);
      setImportError(err.message || 'Failed to parse character sheet.');
      setImportErrorSlotIdx(slotIdx);
    } finally {
      setIsDecoding(false);
      setImportingSlot(null);
    }
  };

  const getLockoutTimer = (expiry) => {
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return '';
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  const renderSlotsList = () => {
    return [1, 2, 3].map((slotIdx) => {
      const activeSlotIndex = storage.get('active_slot_index', 1);
      const unlockedSlots = storage.get(`shattered_unlocked_slots_${username}`) || [1, 2];
      const isUnlocked = unlockedSlots.includes(slotIdx);
      const isActive = activeSlotIndex === slotIdx;
      
      // Read character details for this slot
      const char = storage.get(`slot_${slotIdx}_character`, null);
      const hasCharacter = char && char.name;

      if (!isUnlocked) {
        return (
          <div 
            key={slotIdx}
            className="flex justify-between items-center p-3 rounded-lg border border-slate-905 bg-slate-950/20 opacity-60 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-500 text-sm">🔒</span>
              <div>
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">Character Slot {slotIdx}</span>
                <span className="text-4xs text-slate-655">Requires 5 Gems to unlock</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (gems < 5) {
                  alert("You need at least 5 Gems to unlock this slot. Complete quests or log in with another profile.");
                  return;
                }
                if (window.confirm(`Unlock Character Slot ${slotIdx} for 5 Gems?`)) {
                  onUnlockSlot(slotIdx, 5);
                }
              }}
              className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-4xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Unlock 💎5
            </button>
          </div>
        );
      }

      if (!hasCharacter) {
        const isThisDecoding = isDecoding && importingSlot === slotIdx;
        const hasErrorThisSlot = importError && importErrorSlotIdx === slotIdx;

        return (
          <div 
            key={slotIdx}
            className={`flex flex-col gap-2.5 p-3 rounded-lg border border-dashed transition-all text-left ${
              isActive 
                ? 'border-amber-500/40 bg-amber-500/5' 
                : 'border-slate-800 bg-slate-950/10 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-3xs font-serif bg-slate-950">
                  +
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block font-serif">Empty Slot {slotIdx}</span>
                  <span className="text-4xs text-slate-550">
                    {isThisDecoding ? 'Decoding character sheet...' : 'Ready for a new saga'}
                  </span>
                </div>
              </div>
              
              {!isThisDecoding && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerImportForSlot(slotIdx);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-950 border border-slate-850 hover:border-amber-500/40 text-slate-350 hover:text-amber-300 text-4xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Import
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCreateInSlot(slotIdx);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-900 border border-slate-850 hover:border-amber-500/40 text-amber-450 hover:text-amber-400 text-4xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    New Hero
                  </button>
                </div>
              )}

              {isThisDecoding && (
                <div className="flex items-center gap-2 text-amber-400 text-4xs font-bold uppercase tracking-wider">
                  <span className="animate-pulse">🌀</span> Decoding...
                </div>
              )}
            </div>

            {hasErrorThisSlot && (
              <div className="mt-0.5 text-5xs text-red-400 bg-red-950/20 border border-red-500/10 p-2 rounded leading-relaxed">
                ⚠️ {importError}
              </div>
            )}
          </div>
        );
      }

      const safety = storage.get(`slot_${slotIdx}_safety_state`, null);
      const isLocked = safety && safety.lockoutExpiryTimestamp && 
                       new Date(safety.lockoutExpiryTimestamp).getTime() > Date.now();

      return (
        <div 
          key={slotIdx}
          className={`flex justify-between items-center p-3 rounded-lg border transition-all text-left ${
            isLocked
              ? 'border-red-955/45 bg-red-950/5 opacity-80'
              : isActive 
                ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5' 
                : 'border-slate-800 bg-slate-950/20 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {char.portraitUrl ? (
              <div className="w-10 h-10 rounded border border-slate-805 overflow-hidden bg-slate-950 shrink-0">
                <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded border border-dashed border-slate-850 flex items-center justify-center text-slate-600 text-4xs font-serif bg-slate-950 shrink-0">
                ?
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold truncate font-serif ${isLocked ? 'text-red-400 line-through' : 'text-slate-200'}`}>{char.name}</span>
                {isActive && !isLocked && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-5xs font-extrabold uppercase tracking-widest leading-normal">
                    Active
                  </span>
                )}
                {isLocked && (
                  <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-500/30 text-red-400 text-5xs font-extrabold uppercase tracking-widest leading-normal">
                    Locked
                  </span>
                )}
              </div>
              <span className="text-4xs text-slate-450 leading-normal block">
                {isLocked 
                  ? `🔒 Cooldown: ${getLockoutTimer(safety.lockoutExpiryTimestamp)}`
                  : `Lvl ${char.stats.level} • ${char.element.toUpperCase()}-KIN`
                }
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => {
                onLoadSlot(slotIdx);
              }}
              className={`px-3 py-1.5 rounded text-slate-950 text-4xs font-extrabold uppercase tracking-wider transition-all ${
                isLocked
                  ? 'bg-slate-900 border border-slate-950 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 cursor-pointer'
              }`}
            >
              {isLocked ? 'Locked' : (isActive ? 'Play' : 'Load')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete ${char.name} and all progress in Slot ${slotIdx}?`)) {
                  onWipeSlot(slotIdx);
                }
              }}
              className="p-1.5 rounded bg-slate-950 border border-slate-900 hover:border-rose-900/50 text-rose-500 hover:text-rose-450 cursor-pointer transition-all"
              title="Wipe Character Slot"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`flex-1 flex flex-col items-center p-6 mx-auto w-full text-center overflow-y-auto custom-scrollbar ${
      layoutMode === 'desktop' ? 'max-w-4xl' : 'max-w-lg'
    }`}>
      
      {/* Inner centering block with my-auto prevents centering scroll clip bug */}
      <div className="w-full flex flex-col items-center justify-start py-4 my-auto">
        
        {/* Branding Header Banner */}
        <div className={`w-full mb-6 ${layoutMode === 'desktop' ? 'max-w-2xl' : 'max-w-lg'}`}>
          <div className="relative inline-block w-full rounded-xl overflow-hidden shadow-lg border border-amber-500/20 bg-slate-950/45 p-1 group">
            <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all duration-700 pulse-glow-effect"></div>
            <img 
              src={banner} 
              alt="Shattered Saga Banner Logo" 
              className="relative w-full h-auto object-contain rounded-lg drop-shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-101 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Main Panel */}
        <div className={`w-full ${layoutMode === 'desktop' ? 'max-w-2xl' : 'max-w-lg'} flex flex-col items-center`}>
          <div className="w-full fantasy-panel-gold rounded-xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-left">
            {/* Subtle decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-500/40"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-500/40"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-500/40"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-500/40"></div>

            {!isLoggedIn ? (
              /* Simulated Social Login Stack */
              <div className="space-y-4 text-left">
                <div>
                  <h2 className="text-md md:text-lg font-bold text-amber-300 font-serif border-b border-amber-500/20 pb-2 mb-4">
                    Sign In to Shattered Saga
                  </h2>
                  <p className="text-4xs text-slate-400 leading-relaxed mb-4">
                    Connect your profile to synchronize campaign progress, unlock strongholds, and access special items.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full py-2.5 rounded border border-red-500/20 hover:border-red-400/50 bg-red-950/20 hover:bg-red-950/45 text-red-300 hover:text-red-200 text-3xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-99"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.693 0-8.503-3.81-8.503-8.503 0-4.692 3.81-8.503 8.503-8.503 2.222 0 4.113.848 5.603 2.298l3.238-3.238C18.664 1.896 15.7 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.304 0 10.742-4.407 10.742-10.94 0-.665-.08-1.285-.24-1.755H12.24z"/>
                    </svg>
                    Sign In with Google
                  </button>

                  {/* Facebook Button */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('facebook')}
                    className="w-full py-2.5 rounded border border-blue-600/20 hover:border-blue-500/50 bg-blue-950/20 hover:bg-blue-950/45 text-blue-300 hover:text-blue-200 text-3xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-99"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                    Sign In with Facebook
                  </button>


                </div>

                <div className="border-t border-slate-850/60 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Guest_Adventurer')}
                    className="fantasy-button w-full py-2.5 rounded bg-slate-950 border border-slate-850 hover:border-amber-500/40 text-amber-450 hover:text-amber-400 text-3xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Guest Play (Sandbox)
                  </button>
                </div>
              </div>
            ) : (
              /* Logged In Game Selection */
              <div className="space-y-5">
                <div className="flex justify-between items-center bg-slate-950/50 border border-slate-850 px-4 py-2 rounded-lg">
                  <div className="text-left">
                    <span className="text-4xs text-slate-500 uppercase tracking-widest block font-semibold">Active Session</span>
                    <span className="text-xs font-bold text-amber-400 font-serif">{username.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-450 text-3xs font-extrabold flex items-center gap-1 font-sans uppercase tracking-wider">
                      💎 {gems} Gems
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:border-rose-900/40 text-4xs font-bold text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-left">
                  <h3 className="text-3xs uppercase tracking-widest text-slate-500 font-bold mb-1">
                    Chronicle Character Slots
                  </h3>
                  {renderSlotsList()}
                </div>
              </div>
            )}
          </div>

          {/* Monetization Roadmap Banner */}
          <div className="mt-6 p-4 rounded-lg border border-slate-900 bg-slate-950/40 w-full text-center">
            <span className="text-4xs text-amber-500/90 font-extrabold uppercase tracking-widest block mb-1">
              Marketplace Features (Future Roadmap)
            </span>
            <p className="text-5xs text-slate-500 leading-normal">
              Chronal rewinds, character resurrection, special strongholds, exclusive items, and high-value custom adventures will be unlocked here.
            </p>
          </div>

          {/* Subtle Privacy Footer */}
          <div className="mt-8 text-5xs text-slate-600 flex justify-center gap-4 select-none">
            <span>© {new Date().getFullYear()} ACALI Studios</span>
            <span>•</span>
            <a 
              href="/privacy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-amber-400 transition-colors hover:underline"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a 
              href="/terms.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-amber-400 transition-colors hover:underline"
            >
              Terms of Service
            </a>
          </div>
        </div>

      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,application/pdf,.json"
        onChange={handleFileChange}
      />
    </div>
  );
}
