-- Rate limiting for the sponsored-ad energy reward.
--
-- /api/ads/claim previously granted +10 energy on any authenticated POST, with
-- no cooldown and no cap, so a signed-in user could loop the endpoint for
-- unlimited turns. These columns let the grant be gated by a minimum interval
-- and a per-day cap inside a single conditional UPDATE, the same way gem spends
-- and energy debits are already made race-safe.
--
-- This bounds abuse; it is not proof an ad was watched. Real verification needs
-- the ad network's server-side callback (AdMob SSV), which would replace the
-- client's unauthenticated "I finished the ad" assertion entirely.

-- Wall-clock ms of the last successful claim. NULL means never claimed.
ALTER TABLE users ADD COLUMN ad_last_claim_at INTEGER;

-- Day bucket (floor(epoch_ms / 86400000)) that ad_claims_today counts against.
-- Storing the bucket alongside the count lets the daily reset happen inside the
-- same UPDATE rather than needing a scheduled job.
ALTER TABLE users ADD COLUMN ad_claim_day INTEGER NOT NULL DEFAULT 0;

-- Claims already made during ad_claim_day.
ALTER TABLE users ADD COLUMN ad_claims_today INTEGER NOT NULL DEFAULT 0;
