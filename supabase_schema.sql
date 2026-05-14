-- ==============================================================================
-- SolarPulse Supabase Database Schema
-- ==============================================================================
-- This script contains the complete database schema for SolarPulse as described.
-- You can run this directly in the Supabase SQL Editor.

-- 1. Organizations Table (Multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users Table (Authenticated users)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Will link to auth.users in Supabase
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sites Table (Solar installations)
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  inverter_brand TEXT,
  inverter_model TEXT,
  total_kwp NUMERIC,
  api_key TEXT,
  api_url TEXT,
  timezone TEXT DEFAULT 'Africa/Nairobi',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Telemetry Table (Live measurements - Time-series)
CREATE TABLE telemetry (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  current_power_kw NUMERIC,
  daily_energy_kwh NUMERIC,
  total_energy_kwh NUMERIC,
  battery_soc NUMERIC,
  grid_import_kw NUMERIC,
  grid_export_kw NUMERIC,
  inverter_temp NUMERIC,
  status TEXT,
  raw_payload JSONB
);

-- 5. Alerts Table (System warnings and faults)
CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  severity TEXT,
  message TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Daily Site Metrics (Precomputed analytics)
CREATE TABLE daily_site_metrics (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_energy_kwh NUMERIC,
  specific_yield NUMERIC,
  performance_ratio NUMERIC,
  downtime_minutes INTEGER
);


-- ==============================================================================
-- INDEXES (For fast querying)
-- ==============================================================================

CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp DESC);
CREATE INDEX idx_telemetry_site ON telemetry(site_id);
CREATE INDEX idx_site_timestamp ON telemetry(site_id, timestamp DESC);
-- Additional useful indexes
CREATE INDEX idx_alerts_site_id ON alerts(site_id);
CREATE INDEX idx_metrics_site_date ON daily_site_metrics(site_id, date DESC);


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_site_metrics ENABLE ROW LEVEL SECURITY;

-- Function to get the current user's organization_id
-- This allows us to reuse the logic and make queries faster
CREATE OR REPLACE FUNCTION get_current_user_org()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- Organizations: Users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_current_user_org());

-- Users: Users can view other users in their organization
CREATE POLICY "Users can view members of their organization"
  ON users FOR SELECT
  USING (organization_id = get_current_user_org());

-- Sites: Users can view sites in their organization
CREATE POLICY "Users can view sites in their organization"
  ON sites FOR SELECT
  USING (organization_id = get_current_user_org());

-- Telemetry: Users can view telemetry for sites in their organization
CREATE POLICY "Users can view telemetry for their sites"
  ON telemetry FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE organization_id = get_current_user_org()));

-- Alerts: Users can view alerts for sites in their organization
CREATE POLICY "Users can view alerts for their sites"
  ON alerts FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE organization_id = get_current_user_org()));

-- Metrics: Users can view metrics for sites in their organization
CREATE POLICY "Users can view metrics for their sites"
  ON daily_site_metrics FOR SELECT
  USING (site_id IN (SELECT id FROM sites WHERE organization_id = get_current_user_org()));


-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Enable realtime for telemetry and alerts so the dashboard can listen to updates
ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
