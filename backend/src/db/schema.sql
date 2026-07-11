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
  profile_private BOOLEAN NOT NULL DEFAULT false,
  show_reviews    BOOLEAN NOT NULL DEFAULT true,
  show_activity   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Privacy columns for existing databases (idempotent).
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_private BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_reviews    BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_activity   BOOLEAN NOT NULL DEFAULT true;

-- Steam account link (OpenID 2.0 gives us a SteamID64).
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_id             TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_persona        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_avatar         TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_connected_at   TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS steam_last_synced_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS users_steam_id_idx ON users (steam_id) WHERE steam_id IS NOT NULL;

-- Reviews ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '',
  game_id     TEXT NOT NULL,
  game_name   TEXT NOT NULL,
  game_cover  TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'completed',
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

-- status column for existing databases (idempotent).
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed';

CREATE INDEX IF NOT EXISTS reviews_game_id_idx ON reviews (game_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_public_date_idx ON reviews (is_public, date DESC);

-- "Helpful" votes on reviews (one per user per review) --------------------
CREATE TABLE IF NOT EXISTS review_votes (
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS review_votes_review_idx ON review_votes (review_id);

-- Library ---------------------------------------------------------------
-- A user's owned/tracked games. Previously client-only state; now persisted so
-- Steam imports survive restarts. One row per (user, IGDB game).
CREATE TABLE IF NOT EXISTS library_games (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id                TEXT NOT NULL,                      -- IGDB id
  game_name              TEXT NOT NULL,
  game_cover             TEXT NOT NULL DEFAULT '',
  genre                  TEXT NOT NULL DEFAULT '',
  status                 TEXT NOT NULL DEFAULT 'backlog',    -- backlog|playing|completed|dropped
  source                 TEXT NOT NULL DEFAULT 'manual',     -- manual|steam
  platform               TEXT NOT NULL DEFAULT '',
  steam_appid            TEXT,
  steam_playtime_minutes INTEGER,
  steam_playtime_updated TIMESTAMPTZ,
  added_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS library_user_idx ON library_games (user_id, added_at DESC);

-- Lists -------------------------------------------------------------------
-- Custom game lists. Previously these lived only in component state and were
-- lost on every reload, which also made the profile's "lists" count meaningless.
CREATE TABLE IF NOT EXISTS game_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_lists_user_idx ON game_lists (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS game_list_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id   UUID NOT NULL REFERENCES game_lists(id) ON DELETE CASCADE,
  game_id   TEXT NOT NULL,           -- IGDB id
  title     TEXT NOT NULL,
  cover_url TEXT NOT NULL DEFAULT '',
  genre     TEXT NOT NULL DEFAULT '',
  position  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (list_id, game_id)
);

CREATE INDEX IF NOT EXISTS game_list_items_list_idx ON game_list_items (list_id, position);

-- XP ---------------------------------------------------------------------
-- XP is EARNED, not derived. Each row is one award, keyed by (kind, ref) so it
-- can't be granted twice for the same thing. Deleting the underlying review or
-- library game does not revoke the XP — you did the work, you keep the points.
-- `amount` only ever moves up (see lib/xp.js), which is what lets playtime XP
-- grow across re-syncs without ever dropping.
CREATE TABLE IF NOT EXISTS xp_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,   -- review | game_added | list_created | achievement | playtime
  ref        TEXT NOT NULL,   -- review id / game id / achievement id / steam appid
  amount     INTEGER NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, ref)
);

CREATE INDEX IF NOT EXISTS xp_events_user_idx ON xp_events (user_id);

-- Steam games we couldn't confidently match to an IGDB entry, kept so the user
-- can review them later instead of silently dropping them.
CREATE TABLE IF NOT EXISTS steam_unmatched_games (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_appid      TEXT NOT NULL,
  name             TEXT NOT NULL,
  playtime_minutes INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, steam_appid)
);
