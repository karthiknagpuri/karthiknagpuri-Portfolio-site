-- Create api_usage table for tracking token usage and costs
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'openai', -- 'openai' or 'anthropic'
  model TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'daily_prompts', 'content_plan', 'improve', etc.
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all access to api_usage" ON api_usage
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);

-- Add budget fields to api_settings if they don't exist
ALTER TABLE api_settings
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10, 2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS budget_alert_threshold INTEGER DEFAULT 80;
