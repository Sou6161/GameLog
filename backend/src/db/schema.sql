-- GameLog database schema
-- Run against the database referenced by DATABASE_URL.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '',
  game_id     TEXT NOT NULL,
  game_name   TEXT NOT NULL,
  rating      INTEGER NOT NULL,
  review_text TEXT NOT NULL DEFAULT '',
  play_time   TEXT NOT NULL DEFAULT '',
  difficulty  TEXT NOT NULL DEFAULT '',
  platform    TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '',
  is_public   BOOLEAN NOT NULL DEFAULT true,
  date        TEXT NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_game_id_idx ON reviews (game_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_public_date_idx ON reviews (is_public, date DESC);
