-- Stripe billing state.
--
-- subscription_tier already exists and stays the single source of truth for
-- entitlements; these columns record how that tier was granted so renewals,
-- cancellations and refunds can be reconciled against Stripe.

ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE users ADD COLUMN subscription_period_end INTEGER;

CREATE INDEX IF NOT EXISTS users_stripe_customer_idx ON users(stripe_customer_id);

-- Every processed Stripe event is recorded so replays are no-ops. Stripe
-- retries webhooks aggressively and can deliver the same event more than once;
-- without this a retry would credit turns or gems twice.
CREATE TABLE IF NOT EXISTS billing_events (
  event_id    TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  user_id     TEXT,
  processed_at INTEGER NOT NULL
);
