-- Rejecting a companion used to set is_verified = FALSE, which is the same
-- state as "pending", so rejected companions kept reappearing in Pending.
ALTER TABLE companions_meta
    ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN NOT NULL DEFAULT FALSE;
