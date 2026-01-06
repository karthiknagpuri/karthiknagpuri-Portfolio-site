-- Create snake_scores table for leaderboard
CREATE TABLE IF NOT EXISTS snake_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE snake_scores ENABLE ROW LEVEL SECURITY;

-- Create policy for public read and insert
CREATE POLICY "Allow public read snake_scores" ON snake_scores
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert snake_scores" ON snake_scores
  FOR INSERT WITH CHECK (true);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_snake_scores_score ON snake_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_snake_scores_created ON snake_scores(created_at DESC);
