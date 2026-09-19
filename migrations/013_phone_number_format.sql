-- Defense in depth: app-level validation already requires exactly 10
-- digits, but enforce it at the database level too. Run this only after
-- cleaning up any existing rows that don't match (see note below).

ALTER TABLE users
  ADD CONSTRAINT users_phone_number_format CHECK (phone_number ~ '^\d{10}$');
