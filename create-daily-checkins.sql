-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT NOT NULL, -- 'great', 'good', 'okay', 'low', 'rough'
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  accomplishments TEXT,
  goals TEXT,
  gratitude TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(checkin_date) -- One checkin per day
);

-- Enable RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin access)
CREATE POLICY "Allow all access to daily_checkins" ON daily_checkins
  FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date DESC);
