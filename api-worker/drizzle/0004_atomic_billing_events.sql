-- A unique per-attempt token lets entitlement changes and event recording run in
-- one D1 batch. Duplicate deliveries cannot satisfy the token predicate.
ALTER TABLE billing_events ADD COLUMN claim_token TEXT;
ALTER TABLE billing_events ADD COLUMN status TEXT NOT NULL DEFAULT 'processed';
