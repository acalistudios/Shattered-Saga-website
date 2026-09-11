CREATE TABLE billing_subscriptions (
 subscription_id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id),
 tier TEXT NOT NULL, status TEXT NOT NULL, period_end INTEGER,
 observed_at INTEGER NOT NULL
);
INSERT INTO billing_subscriptions
 SELECT stripe_subscription_id,id,subscription_tier,subscription_status,subscription_period_end,0
 FROM users WHERE stripe_subscription_id IS NOT NULL;
CREATE TABLE billing_grants (grant_id TEXT PRIMARY KEY, claim_token TEXT NOT NULL, user_id TEXT NOT NULL);
CREATE TABLE billing_checkout_locks (user_id TEXT PRIMARY KEY,token TEXT NOT NULL,expires_at INTEGER NOT NULL);
-- Ownership is immutable even if two webhook requests race before their reads.
CREATE TRIGGER billing_subscription_owner_guard BEFORE INSERT ON billing_subscriptions
WHEN EXISTS(SELECT 1 FROM billing_subscriptions WHERE subscription_id=NEW.subscription_id AND user_id<>NEW.user_id)
BEGIN SELECT RAISE(ABORT, 'subscription ownership conflict'); END;
