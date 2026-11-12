// Real ads for the free tier (Hans, 2026-11-12).
//
// Display ads: Google AdSense banners in the existing ad spaces.
// Rewarded ads: Google Ad Manager's rewarded web format via Google Publisher
// Tag (GPT). The page only learns that a reward was granted, so the Worker
// still bounds /api/ads/claim with an interval and a daily cap.
//
// Everything is off until the IDs are set at build time. These IDs are public
// by nature (they appear in every page that shows an ad):
//   VITE_ADSENSE_CLIENT           ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADSENSE_SLOT_SIDEBAR     AdSense ad unit id for the play-screen sidebar
//   VITE_ADSENSE_SLOT_INLINE      AdSense ad unit id for the narrow inline space
//   VITE_GAM_REWARDED_AD_UNIT     /NETWORK_CODE/ad_unit for the rewarded ad
// Consent (EEA/UK) is Google's own message, configured in AdSense/Ad Manager
// under Privacy & messaging; both scripts pick it up automatically.

export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || '';
export const ADSENSE_SLOTS = {
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '',
  inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE || '',
};
export const REWARDED_AD_UNIT = import.meta.env.VITE_GAM_REWARDED_AD_UNIT || '';

export const displayAdsEnabled = !!ADSENSE_CLIENT;
export const rewardedAdsEnabled = !!REWARDED_AD_UNIT;

const loadScript = (src, attrs = {}) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  s.onload = () => resolve();
  s.onerror = () => reject(new Error('ad script blocked'));
  document.head.appendChild(s);
});

let adsenseLoad = null;
export function loadAdSense() {
  if (!displayAdsEnabled) return Promise.resolve(false);
  adsenseLoad ??= loadScript(
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`,
    { crossorigin: 'anonymous' },
  ).then(() => true, () => false);
  return adsenseLoad;
}

let gptLoad = null;
function loadGpt() {
  window.googletag = window.googletag || { cmd: [] };
  gptLoad ??= loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js').then(() => true, () => false);
  return gptLoad;
}

// One rewarded ad at a time; GPT's listeners are page-wide, so they are added
// once and routed to the ad that is currently showing.
let current = null;
let listenersAdded = false;

function addListeners(googletag) {
  if (listenersAdded) return;
  listenersAdded = true;
  const pubads = googletag.pubads();
  pubads.addEventListener('rewardedSlotReady', (e) => {
    if (current && e.slot === current.slot) e.makeRewardedVisible();
  });
  pubads.addEventListener('rewardedSlotGranted', (e) => {
    if (current && e.slot === current.slot) current.granted = true;
  });
  pubads.addEventListener('rewardedSlotClosed', (e) => {
    if (current && e.slot === current.slot) current.finish(current.granted ? 'granted' : 'closed');
  });
  pubads.addEventListener('slotRenderEnded', (e) => {
    if (current && e.slot === current.slot && e.isEmpty) current.finish('unavailable');
  });
}

/**
 * Show a rewarded ad. Resolves 'granted' (watched to the end), 'closed'
 * (closed early, no reward) or 'unavailable' (not configured, blocked, or no
 * ad to show right now).
 */
export async function showRewardedAd({ timeoutMs = 20000 } = {}) {
  if (!rewardedAdsEnabled || current) return 'unavailable';
  if (!(await loadGpt())) return 'unavailable';
  const googletag = window.googletag;
  return new Promise((resolve) => {
    googletag.cmd.push(() => {
      const slot = googletag.defineOutOfPageSlot(REWARDED_AD_UNIT, googletag.enums.OutOfPageFormat.REWARDED);
      // null when the format is not supported on this page or device.
      if (!slot) { resolve('unavailable'); return; }
      slot.addService(googletag.pubads());
      let timer = null;
      current = {
        slot,
        granted: false,
        finish: (outcome) => {
          if (!current || current.slot !== slot) return;
          clearTimeout(timer);
          current = null;
          googletag.destroySlots([slot]);
          resolve(outcome);
        },
      };
      // No ad ever became ready: give up rather than leave the player waiting.
      timer = setTimeout(() => current?.slot === slot && !current.granted && current.finish('unavailable'), timeoutMs);
      addListeners(googletag);
      googletag.enableServices();
      googletag.display(slot);
    });
  });
}
