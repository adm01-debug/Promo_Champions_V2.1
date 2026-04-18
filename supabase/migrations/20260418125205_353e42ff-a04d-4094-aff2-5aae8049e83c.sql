-- Win Probability Calibrator (bucket-based)
CREATE TABLE public.win_calibration_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage text NOT NULL,
  segment text NOT NULL DEFAULT 'all',
  bucket_min numeric NOT NULL,
  bucket_max numeric NOT NULL,
  actual_win_rate numeric NOT NULL DEFAULT 0,
  sample_size integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stage, segment, bucket_min)
);

CREATE INDEX idx_win_calibration_buckets_stage_segment ON public.win_calibration_buckets (stage, segment);

ALTER TABLE public.win_calibration_buckets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read win_calibration_buckets"
ON public.win_calibration_buckets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager manage win_calibration_buckets"
ON public.win_calibration_buckets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TABLE public.win_probability_deal_calibrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  stage text NOT NULL,
  segment text NOT NULL DEFAULT 'all',
  owner_id uuid,
  declared_probability numeric NOT NULL DEFAULT 0,
  historical_win_rate numeric NOT NULL DEFAULT 0,
  calibrated_probability numeric NOT NULL DEFAULT 0,
  calibration_delta numeric GENERATED ALWAYS AS (calibrated_probability - declared_probability) STORED,
  confidence text NOT NULL DEFAULT 'low' CHECK (confidence IN ('low','medium','high')),
  flag text NOT NULL DEFAULT 'aligned' CHECK (flag IN ('overconfident','underconfident','aligned')),
  sample_size integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wpdc_sale ON public.win_probability_deal_calibrations (sale_id);
CREATE INDEX idx_wpdc_flag ON public.win_probability_deal_calibrations (flag);
CREATE INDEX idx_wpdc_stage_segment ON public.win_probability_deal_calibrations (stage, segment);

ALTER TABLE public.win_probability_deal_calibrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read wpdc"
ON public.win_probability_deal_calibrations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/manager manage wpdc"
ON public.win_probability_deal_calibrations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.win_calibration_buckets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.win_probability_deal_calibrations;