-- Admin RLS policies: allow police_admin and super_admin to read/update all reports and related data

-- Admins can read ALL reports
CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Admins can update reports (status changes)
CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Admins can view all media
CREATE POLICY "Admins can view all media"
ON public.report_media FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Admins can view report history
CREATE POLICY "Admins can view status history"
ON public.report_status_history FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Admins can read all profiles (to see reporter info)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Super admins can view invite codes
CREATE POLICY "Super admins can view invites"
ON public.invite_codes FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Anyone can view own notifications
-- (already exists from schema)

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('police_admin', 'super_admin'))
);

-- Admins can read violation types (already exists for authenticated)

-- Reporters can view history of their own reports
CREATE POLICY "Reporters can view own report history"
ON public.report_status_history FOR SELECT
USING (
  report_id IN (
    SELECT report_id FROM public.reports WHERE reporter_anonymous_id IN (
      SELECT anonymous_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);
