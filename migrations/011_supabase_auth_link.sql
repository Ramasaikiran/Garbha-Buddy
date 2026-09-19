-- Migrating companion/client/admin auth to Supabase Auth.
-- These columns link our existing profile tables to auth.users, which
-- Supabase manages. password_hash on admin_users is no longer written —
-- Supabase now holds the credential — so it's made nullable rather than
-- dropped, to avoid touching any existing rows.

ALTER TABLE users
  ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

ALTER TABLE admin_users
  ADD COLUMN auth_user_id UUID REFERENCES auth.users(id),
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
