-- ==========================================
-- ChenEYE Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- ==========================================

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('reporter', 'police_admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'banned', 'suspended');
CREATE TYPE report_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'action_taken');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE invite_status AS ENUM ('active', 'used', 'expired', 'revoked');
CREATE TYPE appeal_status AS ENUM ('pending', 'accepted', 'denied');
CREATE TYPE app_language AS ENUM ('en', 'ta', 'hi');
CREATE TYPE app_theme AS ENUM ('light', 'dark');

-- 2. Create tables
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  anonymous_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_hash TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'reporter'::user_role NOT NULL,
  status user_status DEFAULT 'active'::user_status NOT NULL,
  warnings INTEGER DEFAULT 0 NOT NULL,
  language app_language DEFAULT 'en'::app_language NOT NULL,
  theme app_theme DEFAULT 'light'::app_theme NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT UNIQUE NOT NULL,
  reporter_anonymous_id TEXT REFERENCES public.profiles(anonymous_id) ON DELETE SET NULL NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT,
  vehicle_color TEXT,
  violation_type TEXT NOT NULL,
  custom_violation TEXT,
  location_text TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  landmark TEXT,
  direction TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  severity TEXT,
  is_repeat_offender BOOLEAN DEFAULT FALSE NOT NULL,
  description TEXT NOT NULL,
  status report_status DEFAULT 'submitted'::report_status NOT NULL,
  rejection_reason TEXT,
  action_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.report_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT REFERENCES public.reports(report_id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type media_type NOT NULL,
  size INTEGER NOT NULL,
  original_filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.report_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT REFERENCES public.reports(report_id) ON DELETE CASCADE NOT NULL,
  status report_status NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  report_id TEXT REFERENCES public.reports(report_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_hash TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  generated_for TEXT NOT NULL,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status invite_status DEFAULT 'active'::invite_status NOT NULL,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.warnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  report_id TEXT REFERENCES public.reports(report_id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  warning_number INTEGER NOT NULL,
  issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.banned_phones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.appeals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appeal_text TEXT NOT NULL,
  status appeal_status DEFAULT 'pending'::appeal_status NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.violation_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Introduce default violation types
INSERT INTO public.violation_types (name, sort_order) VALUES
('Helmetless Riding', 1),
('Signal Jumping', 2),
('Wrong Way Driving', 3),
('Triple Riding', 4),
('Defective Number Plate', 5),
('Overspeeding', 6),
('Mobile Phone While Riding/Driving', 7),
('No Seatbelt', 8),
('Illegal Parking', 9);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_types ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile. Admins can read all profiles.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Note: Service role (admin API) bypasses RLS for signup creation.

-- Reports: Reporters can view their own reports. Admins can view all.
CREATE POLICY "Reporters can view own reports" ON public.reports FOR SELECT USING (
  reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Reporters can insert reports" ON public.reports FOR INSERT WITH CHECK (
  reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
);

-- Media: Reporters can view media for their reports. Reporters can insert media.
CREATE POLICY "Reporters can view own media" ON public.report_media FOR SELECT USING (
  report_id IN (SELECT report_id FROM public.reports WHERE reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid()))
);
CREATE POLICY "Reporters can insert media" ON public.report_media FOR INSERT WITH CHECK (
  report_id IN (SELECT report_id FROM public.reports WHERE reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid()))
);

-- Notifications: Users can view their own notifications.
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Types: Anyone authenticated can read violation types
CREATE POLICY "Read violation types" ON public.violation_types FOR SELECT TO authenticated USING (active = true);

-- 4. Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Storage setup (run these commands in Supabase SQL editor or create the bucket manually in the dashboard)
-- NOTE: Please create a public storage bucket named "evidence" in your Supabase dashboard.
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view evidence" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence');
