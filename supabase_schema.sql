-- ==============================================================================
-- LEADS.CRM - Complete Supabase (PostgreSQL) Database Schema
-- Run this script in your Supabase Project's SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- ==============================================================================
-- ONE-CLICK MIGRATION SCRIPT (Run this in Supabase SQL Editor if tables exist):
-- ==============================================================================
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS deployed_preview_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT '';

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS has_mobile_app BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Active Client';
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Create Tables
-- ------------------------------------------------------------------------------

-- Table: profiles (Supabase Auth user metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'CRM Administrator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read, update, and insert their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Table: leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT UNIQUE NOT NULL, -- prevents scraping duplicates
  business_name TEXT,
  location TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  website_url TEXT,
  deployed_preview_url TEXT DEFAULT '', -- New deployed Vercel/demo URL
  summary TEXT DEFAULT '',              -- Quick technical config & reminders
  has_mobile_app BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'NEW',
  pitch_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  staging_url TEXT,
  location TEXT DEFAULT 'Active Client',
  has_mobile_app BOOLEAN DEFAULT false,
  summary TEXT DEFAULT '',              -- Technical deployment notes & configurations
  budget NUMERIC(10, 2) DEFAULT 0,
  phase_status TEXT DEFAULT 'UNDER_DISCUSSION',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Indexes for High-Performance Queries
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_place_id ON public.leads(place_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_phase_status ON public.projects(phase_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) - Fully Permissive for Local Single-User Portal
-- ------------------------------------------------------------------------------
-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;

-- Fully open policies (true for all operations: SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all operations on leads"
  ON public.leads
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on projects"
  ON public.projects
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant full table permissions to anon, authenticated, and service_role
GRANT ALL ON public.leads TO anon, authenticated, service_role;
GRANT ALL ON public.projects TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. Initial Seed Data (Matching CRM Dummy Data)
-- ------------------------------------------------------------------------------
INSERT INTO public.leads (id, place_id, business_name, location, rating, reviews_count, website_url, deployed_preview_url, summary, has_mobile_app, status, pitch_notes)
VALUES
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c81',
    'ChIJ_dallas_roofing_01',
    'Dallas Roofing Co.',
    'Dallas, CA',
    4.8,
    142,
    'NO WEBSITE',
    'https://dallas-roofing-demo.vercel.app',
    'Deployed modern Next.js 16 template on Vercel. Optimized for local Dallas residential quote requests.',
    false,
    'NEW',
    'Targeted outreach: High review volume with zero website presence. Built initial local SEO landing page demo.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c82',
    'ChIJ_austin_hvac_lennus_02',
    'Austin HVAC & Plumbing',
    'Lennus, VA',
    4.8,
    82,
    'NO WEBSITE',
    'https://austin-hvac-preview.vercel.app',
    'Fast booking UI deployed on Vercel with automated phone callback widget.',
    false,
    'MOCKUP_BUILT',
    'Staged high-converting booking mockup. Owner replied on initial cold call asking for preview link.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c83',
    'ChIJ_austin_hvac_barden_03',
    'Austin HVAC & Plumbing',
    'Barden, MA',
    4.4,
    82,
    'brokenlink.com',
    '',
    'Legacy domain expired. Requires DNS re-routing to Vercel upon client contract.',
    false,
    'MOCKUP_BUILT',
    'Domain expiration detected. SSL error on legacy site. Provided interactive Figma/NextJS preview.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c84',
    'ChIJ_metro_electricians_04',
    'Metro Electricians',
    'Barlers, CA',
    4.7,
    200,
    'OUTDATED',
    'https://metro-electric-showcase.vercel.app',
    'Tailwind responsive design with emergency dispatch button. Mobile app link preview included.',
    true,
    'EMAIL_SENT',
    'Email campaign #3 sent with Loom walkthrough of responsive mobile UI redesign.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c85',
    'ChIJ_summit_dental_05',
    'Summit Dental Clinic',
    'Denver, CO',
    4.9,
    310,
    'https://summitdental.example.com',
    'https://summit-dental-portal.vercel.app',
    'Patient appointment portal staging. Integrated mock Calendly iframe on Vercel preview.',
    true,
    'PITCH_RESPONSE',
    'Practice manager responded: interested in automated patient intake and booking portal.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c86',
    'ChIJ_apex_auto_care_06',
    'Apex Auto Care',
    'Phoenix, AZ',
    4.5,
    64,
    'NO WEBSITE',
    '',
    'Archived. Business ownership changing.',
    false,
    'IGNORED',
    'Lead indicated they are retiring by end of quarter. Do not follow up.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c87',
    'ChIJ_bayview_landscape_07',
    'Bayview Landscape Design',
    'San Jose, CA',
    4.6,
    118,
    'https://bayviewlandscape.sample',
    '',
    'Scraped via Google Places. Needs mobile responsiveness audit before staging.',
    false,
    'NEW',
    'Found via Google Places scraper. High engagement with local homeowners, website is non-responsive on mobile.'
  ),
  (
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c88',
    'ChIJ_coastal_vet_08',
    'Coastal Veterinary Hospital',
    'San Diego, CA',
    4.9,
    412,
    'https://coastalvet.sample',
    'https://coastal-vet-portal.vercel.app',
    'Client demo scheduled. Vercel deployment has sample pet emergency booking flow.',
    true,
    'PITCH_RESPONSE',
    'Scheduled video demo for Thursday 2 PM. Wants mobile app integration with client portal.'
  )
ON CONFLICT (place_id) DO UPDATE SET
  deployed_preview_url = EXCLUDED.deployed_preview_url,
  summary = EXCLUDED.summary;

-- Seed Projects table
INSERT INTO public.projects (id, lead_id, project_name, client_email, client_phone, staging_url, summary, budget, phase_status)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d471',
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c81',
    'Dallas Roofing Co.',
    'info@dallasroof.com',
    '+1 (214) 555-0192',
    'preview.dallasroof.com',
    'Vercel Deployment: dallas-roofing-prod.vercel.app. Custom domain DNS pending CNAME record verification. Stripe invoice #104 sent.',
    1200.00,
    'UNDER_DISCUSSION'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d472',
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c84',
    'Metro Electricians',
    'dispatch@metroelec.io',
    '+1 (415) 555-9011',
    'preview.metro.com',
    'Staging build active. Mobile PWA manifest configured with emergency one-tap call feature. Awaiting final logo asset.',
    1200.00,
    'STAGING_DESIGN'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d473',
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c82',
    'Austin HVAC',
    'info@austinhvac.com',
    '+1 (512) 555-8832',
    'preview.austinhvac.com',
    'Integrating SendGrid contact webhooks and Twilio dispatch SMS. Staging URL live on Cloudflare Pages proxy.',
    1850.00,
    'BUILD_INTEGRATION'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d474',
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c85',
    'Summit Dental Clinic',
    'dr.miller@summitdental.example.com',
    '+1 (303) 555-1234',
    'demo.summitdental.app',
    'HIPAA compliant booking questionnaire integration. GitHub repo: /leads-crm/summit-dental-v1. Review call next Tuesday.',
    2400.00,
    'BUILD_INTEGRATION'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d475',
    NULL,
    'Golden Gate Plumbing',
    'dispatch@ggplumbing.org',
    '+1 (415) 555-7788',
    'preview.ggplumbing.org',
    'Delivered final production bundle to client Vercel team account. Handover documentation signed.',
    3100.00,
    'DELIVERED'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d476',
    'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c88',
    'Coastal Veterinary Hospital',
    'admin@coastalvet.sample',
    '+1 (619) 555-2233',
    'staging.coastalvet.com',
    'Revision #2: Client requested adding emergency vet night-hours toggle to the header. Vercel preview branch: feat/hours-toggle.',
    2900.00,
    'REVISIONS'
  )
ON CONFLICT (id) DO UPDATE SET
  summary = EXCLUDED.summary;
