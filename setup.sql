-- GraveyardAPI Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Create visitors table for tracking page views
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  project_name TEXT DEFAULT 'graveyard-api'
);

-- Create signups table for tracking email submissions
CREATE TABLE IF NOT EXISTS signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  project_name TEXT NOT NULL DEFAULT 'graveyard-api',
  visitor_id UUID REFERENCES visitors(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_graveyard_visitors_created_at ON visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_graveyard_visitors_project ON visitors(project_name);
CREATE INDEX IF NOT EXISTS idx_graveyard_visitors_ip ON visitors(ip_address);
CREATE INDEX IF NOT EXISTS idx_graveyard_signups_created_at ON signups(created_at);
CREATE INDEX IF NOT EXISTS idx_graveyard_signups_project ON signups(project_name);
CREATE INDEX IF NOT EXISTS idx_graveyard_signups_email ON signups(email);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- Create policies for visitors table
CREATE POLICY IF NOT EXISTS "GraveyardAPI: Allow anonymous inserts for visitors" ON visitors
  FOR INSERT WITH CHECK (project_name = 'graveyard-api');

CREATE POLICY IF NOT EXISTS "GraveyardAPI: Allow read access for visitor analytics" ON visitors
  FOR SELECT USING (project_name = 'graveyard-api');

-- Create policies for signups table
CREATE POLICY IF NOT EXISTS "GraveyardAPI: Allow anonymous inserts for signups" ON signups
  FOR INSERT WITH CHECK (project_name = 'graveyard-api');

CREATE POLICY IF NOT EXISTS "GraveyardAPI: Allow read access for signup analytics" ON signups
  FOR SELECT USING (project_name = 'graveyard-api');

-- Create a view for GraveyardAPI analytics
CREATE OR REPLACE VIEW graveyard_api_analytics AS
SELECT 
  'visitors' as metric,
  COUNT(*) as total_count,
  COUNT(DISTINCT ip_address) as unique_count,
  DATE(created_at) as date
FROM visitors 
WHERE project_name = 'graveyard-api'
GROUP BY DATE(created_at)

UNION ALL

SELECT 
  'signups' as metric,
  COUNT(*) as total_count,
  COUNT(DISTINCT email) as unique_count,
  DATE(created_at) as date
FROM signups 
WHERE project_name = 'graveyard-api'
GROUP BY DATE(created_at);

-- Grant access to the view
GRANT SELECT ON graveyard_api_analytics TO anon, authenticated;
