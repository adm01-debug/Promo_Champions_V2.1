CREATE TABLE IF NOT EXISTS public.deal_stage_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  duration_hours numeric GENERATED ALWAYS AS (
    CASE WHEN exited_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (exited_at - entered_at)) / 3600.0
      ELSE NULL END
  ) STORED,
  transitioned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dst_sale_entered ON public.deal_stage_transitions(sale_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_dst_to_stage ON public.deal_stage_transitions(to_stage);
CREATE INDEX IF NOT EXISTS idx_dst_open ON public.deal_stage_transitions(sale_id) WHERE exited_at IS NULL;

ALTER TABLE public.deal_stage_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read stage transitions"
  ON public.deal_stage_transitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manager write stage transitions"
  ON public.deal_stage_transitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TABLE IF NOT EXISTS public.stage_velocity_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage text NOT NULL,
  segment text NOT NULL DEFAULT 'all',
  p50_hours numeric NOT NULL DEFAULT 0,
  p75_hours numeric NOT NULL DEFAULT 0,
  p90_hours numeric NOT NULL DEFAULT 0,
  sample_size integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stage, segment)
);

CREATE INDEX IF NOT EXISTS idx_svb_stage ON public.stage_velocity_baselines(stage);

ALTER TABLE public.stage_velocity_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read baselines"
  ON public.stage_velocity_baselines FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manager write baselines"
  ON public.stage_velocity_baselines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TABLE IF NOT EXISTS public.deal_velocity_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  current_stage text NOT NULL,
  hours_in_stage numeric NOT NULL DEFAULT 0,
  baseline_p75 numeric NOT NULL DEFAULT 0,
  baseline_p90 numeric NOT NULL DEFAULT 0,
  severity text NOT NULL DEFAULT 'watch',
  recommendation text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT severity_chk CHECK (severity IN ('watch','stuck','critical'))
);

CREATE INDEX IF NOT EXISTS idx_dva_severity ON public.deal_velocity_alerts(severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_dva_stage ON public.deal_velocity_alerts(current_stage);

ALTER TABLE public.deal_velocity_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read velocity alerts"
  ON public.deal_velocity_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manager write velocity alerts"
  ON public.deal_velocity_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE OR REPLACE FUNCTION public.record_sale_stage_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NOT NULL THEN
      INSERT INTO public.deal_stage_transitions (sale_id, from_stage, to_stage, entered_at)
      VALUES (NEW.id, NULL, NEW.status::text, COALESCE(NEW.created_at, now()));
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.deal_stage_transitions
       SET exited_at = now()
     WHERE sale_id = NEW.id AND exited_at IS NULL;

    INSERT INTO public.deal_stage_transitions (sale_id, from_stage, to_stage, entered_at)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_sale_stage_transition ON public.sales;
CREATE TRIGGER trg_record_sale_stage_transition
  AFTER INSERT OR UPDATE OF status ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.record_sale_stage_transition();

DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_stage_transitions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_velocity_baselines; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_velocity_alerts; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;