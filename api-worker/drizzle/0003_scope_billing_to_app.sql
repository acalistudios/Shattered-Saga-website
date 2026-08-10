-- Scope subscription lifecycle events to THIS app's subscriptions.
--
-- The Stripe account is shared with other ACALI products (ViaStellis), and
-- webhook events are delivered account-wide. Matching subscription.updated /
-- .deleted on stripe_customer_id alone risks acting on another product's
-- subscription if Stripe ever reuses a Customer across them — which would
-- silently downgrade a paying Shattered Saga user when they cancel elsewhere.
--
-- Storing the subscription id lets us match exactly the subscription we sold.
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS users_stripe_subscription_idx ON users(stripe_subscription_id);
