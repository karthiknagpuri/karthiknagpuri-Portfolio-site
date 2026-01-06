-- Create api_settings table for storing API keys
CREATE TABLE IF NOT EXISTS api_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  anthropic_key TEXT,
  openai_key TEXT,
  preferred_provider TEXT DEFAULT 'anthropic',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin access)
CREATE POLICY "Allow all access to api_settings" ON api_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default row
INSERT INTO api_settings (id, preferred_provider)
VALUES (1, 'anthropic')
ON CONFLICT (id) DO NOTHING;
