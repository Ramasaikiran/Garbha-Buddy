-- Public-facing profile fields, distinct from the private verification
-- selfie (never shown publicly) and Aadhaar images (never shown publicly).
ALTER TABLE companions_meta
  ADD COLUMN profile_photo_url TEXT,
  ADD COLUMN bio TEXT;
