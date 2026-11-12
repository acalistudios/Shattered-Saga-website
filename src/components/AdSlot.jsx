import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, displayAdsEnabled, loadAdSense } from '../utils/ads';

/**
 * One AdSense display unit. Renders nothing until AdSense is configured
 * (utils/ads.js), so the existing ad spaces keep their placeholder look.
 */
export default function AdSlot({ slot, className = '', format = 'auto', style }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!displayAdsEnabled || !slot || pushed.current) return;
    pushed.current = true;
    loadAdSense().then((ok) => {
      if (!ok) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* an ad blocker or a duplicate push; nothing to do */
      }
    });
  }, [slot]);

  if (!displayAdsEnabled || !slot) return null;
  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
