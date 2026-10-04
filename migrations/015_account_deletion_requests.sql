-- Account deletion now goes through admin review instead of being
-- immediate. The user submits a request here; an admin approves (which
-- runs the same anonymization /api/account/delete used to do directly)
-- or rejects it.
CREATE TABLE account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    admin_note TEXT
);

CREATE INDEX idx_account_deletion_requests_status ON account_deletion_requests(status);

-- One pending request per user at a time.
CREATE UNIQUE INDEX idx_account_deletion_requests_one_pending
  ON account_deletion_requests(user_id) WHERE status = 'pending';
