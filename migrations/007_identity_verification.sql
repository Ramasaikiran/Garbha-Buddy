ALTER TABLE users
  ADD COLUMN aadhaar_front_url TEXT,
  ADD COLUMN aadhaar_back_url TEXT,
  ADD COLUMN aadhaar_last4 VARCHAR(4),
  ADD COLUMN selfie_url TEXT,
  ADD COLUMN identity_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookings
  ADD COLUMN companion_mismatch_reported BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN mismatch_note TEXT;
