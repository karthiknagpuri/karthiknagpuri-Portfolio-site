-- Create revenue_streams table
CREATE TABLE IF NOT EXISTS revenue_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue_goals table
CREATE TABLE IF NOT EXISTS revenue_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount DECIMAL(10,2) DEFAULT 0,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_goals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin only table)
CREATE POLICY "Allow all for revenue_streams" ON revenue_streams FOR ALL USING (true);
CREATE POLICY "Allow all for revenue_goals" ON revenue_goals FOR ALL USING (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
DROP TRIGGER IF EXISTS update_revenue_streams_updated_at ON revenue_streams;
CREATE TRIGGER update_revenue_streams_updated_at
  BEFORE UPDATE ON revenue_streams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_revenue_goals_updated_at ON revenue_goals;
CREATE TRIGGER update_revenue_goals_updated_at
  BEFORE UPDATE ON revenue_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
