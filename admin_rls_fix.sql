-- ==========================================
-- COMPLETE RLS RESET & FIX
-- This drops ALL custom policies and recreates them cleanly.
-- Run this ENTIRE script in Supabase SQL Editor.
-- ==========================================

-- ==========================================
-- Step 1: Create helper function (bypasses RLS)
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('police_admin', 'super_admin')
  );
$$;

-- ==========================================
-- Step 2: Drop ALL existing policies
-- ==========================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;

-- Reports
DROP POLICY IF EXISTS "Reporters can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Reporters can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

-- Report media
DROP POLICY IF EXISTS "Reporters can view own media" ON public.report_media;
DROP POLICY IF EXISTS "Reporters can insert media" ON public.report_media;
DROP POLICY IF EXISTS "Admins can view all media" ON public.report_media;

-- Status history
DROP POLICY IF EXISTS "Admins can view status history" ON public.report_status_history;
DROP POLICY IF EXISTS "View status history" ON public.report_status_history;
DROP POLICY IF EXISTS "Reporters can view own report history" ON public.report_status_history;

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Violation types
DROP POLICY IF EXISTS "Read violation types" ON public.violation_types;

-- Invite codes
DROP POLICY IF EXISTS "Super admins can view invites" ON public.invite_codes;

-- Audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

-- ==========================================
-- Step 3: Recreate ALL policies cleanly
-- ==========================================

-- PROFILES --
CREATE POLICY "profiles_select"
ON public.profiles FOR SELECT
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- REPORTS --
CREATE POLICY "reports_select"
ON public.reports FOR SELECT
USING (
  reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
  OR public.is_admin()
);

CREATE POLICY "reports_insert"
ON public.reports FOR INSERT
WITH CHECK (
  reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "reports_update"
ON public.reports FOR UPDATE
USING (public.is_admin());

-- REPORT MEDIA --
CREATE POLICY "report_media_select"
ON public.report_media FOR SELECT
USING (
  report_id IN (
    SELECT report_id FROM public.reports
    WHERE reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
  )
  OR public.is_admin()
);

CREATE POLICY "report_media_insert"
ON public.report_media FOR INSERT
WITH CHECK (
  report_id IN (
    SELECT report_id FROM public.reports
    WHERE reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- STATUS HISTORY --
CREATE POLICY "status_history_select"
ON public.report_status_history FOR SELECT
USING (
  report_id IN (
    SELECT report_id FROM public.reports
    WHERE reporter_anonymous_id IN (SELECT anonymous_id FROM public.profiles WHERE id = auth.uid())
  )
  OR public.is_admin()
);

-- NOTIFICATIONS --
CREATE POLICY "notifications_select"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "notifications_update"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

-- VIOLATION TYPES --
CREATE POLICY "violation_types_select"
ON public.violation_types FOR SELECT
TO authenticated
USING (active = true);

-- INVITE CODES (super admin only) --
CREATE POLICY "invite_codes_select"
ON public.invite_codes FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- AUDIT LOGS --
CREATE POLICY "audit_logs_select"
ON public.audit_logs FOR SELECT
USING (public.is_admin());
