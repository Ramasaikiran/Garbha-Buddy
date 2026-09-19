-- Client self-cancellation and companion no-show penalties.

ALTER TABLE bookings
  ADD COLUMN cancellation_reason VARCHAR(30)
    CHECK (cancellation_reason IN ('client_cancelled', 'companion_no_show', 'companion_mismatch', 'payment_failed')),
  ADD COLUMN refund_amount INTEGER, -- actual amount refunded to the client, in rupees
  ADD COLUMN cancellation_note TEXT; -- free-text detail for any cancellation reason

-- A no-show penalty owed by a companion, settled against a FUTURE payout
-- (the no-show booking itself never completes, so there's nothing to
-- deduct from directly — this is deducted from their next paid-out booking).
CREATE TABLE companion_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    companion_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount INTEGER NOT NULL, -- rupees, owed by the companion
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deducted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companion_penalties_companion ON companion_penalties(companion_id, status);
