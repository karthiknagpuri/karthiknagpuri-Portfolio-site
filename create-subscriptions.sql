-- Create subscriptions table for tracking recurring payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  cost DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  next_billing_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  cancel_reminder BOOLEAN DEFAULT false,
  cancel_reminder_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'active',
  trial_ends DATE,
  url TEXT,
  email_account TEXT, -- Email account the subscription is linked to
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all read subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow all delete subscriptions" ON subscriptions;

-- Create permissive policies
CREATE POLICY "Allow all read subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow all insert subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update subscriptions" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "Allow all delete subscriptions" ON subscriptions FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email_account);

-- If table already exists, add the email_account column:
-- ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS email_account TEXT;
