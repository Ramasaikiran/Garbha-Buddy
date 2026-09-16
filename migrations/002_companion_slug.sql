ALTER TABLE companions_meta
  ADD COLUMN slug VARCHAR(160) UNIQUE;

CREATE INDEX idx_companions_slug ON companions_meta(slug);
