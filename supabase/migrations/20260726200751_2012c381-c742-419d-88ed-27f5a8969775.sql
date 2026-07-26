GRANT INSERT ON public.email_opt_outs TO authenticated;

DROP POLICY IF EXISTS "Admins can add opt-outs" ON public.email_opt_outs;
CREATE POLICY "Admins can add opt-outs" ON public.email_opt_outs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_email_opt_outs_created_at ON public.email_opt_outs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_opt_outs_source ON public.email_opt_outs (source);