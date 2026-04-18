-- 1. committee_coverage_history
CREATE TABLE public.committee_coverage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  coverage_score numeric NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'weak',
  stakeholder_count integer NOT NULL DEFAULT 0,
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  snapshot_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cch_sale_snapshot ON public.committee_coverage_history(sale_id, snapshot_at DESC);

ALTER TABLE public.committee_coverage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read coverage history"
  ON public.committee_coverage_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin manager write coverage history"
  ON public.committee_coverage_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.committee_coverage_history;

-- 2. committee_extraction_runs
CREATE TABLE public.committee_extraction_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE,
  extracted_count integer NOT NULL DEFAULT 0,
  created_count integer NOT NULL DEFAULT 0,
  updated_count integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  raw_output jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cer_recording ON public.committee_extraction_runs(recording_id);
CREATE INDEX idx_cer_sale ON public.committee_extraction_runs(sale_id, created_at DESC);

ALTER TABLE public.committee_extraction_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read extraction runs"
  ON public.committee_extraction_runs FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin manager write extraction runs"
  ON public.committee_extraction_runs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.committee_extraction_runs;

-- 3. Trigger: snapshot history on coverage upsert
CREATE OR REPLACE FUNCTION public.snapshot_committee_coverage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.committee_coverage_history (
    sale_id, coverage_score, tier, stakeholder_count, gaps
  ) VALUES (
    NEW.sale_id,
    COALESCE(NEW.coverage_score, 0),
    COALESCE(NEW.tier, 'weak'),
    COALESCE(NEW.stakeholder_count, 0),
    COALESCE(NEW.gaps, '[]'::jsonb)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_snapshot_committee_coverage
AFTER INSERT OR UPDATE ON public.deal_committee_coverage
FOR EACH ROW
EXECUTE FUNCTION public.snapshot_committee_coverage();