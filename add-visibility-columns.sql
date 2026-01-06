-- Add visibility and password columns to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update existing posts to have 'public' visibility
UPDATE blog_posts SET visibility = 'public' WHERE visibility IS NULL;
