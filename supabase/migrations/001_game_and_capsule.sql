-- ============================================================
-- Migration 001: Game Votes & Time Capsule Messages
-- Baby in Bloom — babyshower app
-- ============================================================

-- ------------------------------------------------------------
-- Table 1: babyshower_game_votes
-- Stores each guest's answer per question in the guessing game.
-- One answer per guest per question (upsert-friendly).
-- ------------------------------------------------------------
CREATE TABLE babyshower_game_votes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id      UUID        REFERENCES babyshower_guests(id),
  guest_name    TEXT        NOT NULL,
  question_key  TEXT        NOT NULL,
  answer        TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),

  UNIQUE (guest_id, question_key)
);

-- ------------------------------------------------------------
-- Table 2: babyshower_capsule_messages
-- Audio or video messages left by guests for the baby to
-- watch/listen to in the future.
-- ------------------------------------------------------------
CREATE TABLE babyshower_capsule_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id          UUID        REFERENCES babyshower_guests(id),
  guest_name        TEXT        NOT NULL,
  media_type        TEXT        NOT NULL CHECK (media_type IN ('video', 'audio')),
  storage_path      TEXT        NOT NULL,
  duration_seconds  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row-Level Security
-- This app uses cookie-based identity with no Supabase auth,
-- so all tables allow public SELECT and INSERT.
-- ============================================================

-- babyshower_game_votes
ALTER TABLE babyshower_game_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on game_votes"
  ON babyshower_game_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on game_votes"
  ON babyshower_game_votes
  FOR INSERT
  WITH CHECK (true);

-- babyshower_capsule_messages
ALTER TABLE babyshower_capsule_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on capsule_messages"
  ON babyshower_capsule_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on capsule_messages"
  ON babyshower_capsule_messages
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- Realtime
-- Enable realtime on game_votes so the reveal screen can
-- display live voting results as guests submit answers.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE babyshower_game_votes;

-- ============================================================
-- Storage bucket (manual step)
-- Create a public bucket named "babyshower-capsule" via the
-- Supabase Dashboard > Storage. Storage buckets cannot be
-- provisioned through SQL migrations.
-- ============================================================
