-- Enable RLS on leads table (central SDR CRM table was missing protection).
-- Baseline permissive policy preserves current app behaviour; tighten per-role later.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_authenticated_all"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
