
DO $$ BEGIN
  CREATE TYPE public.forecast_category AS ENUM ('commit', 'best_case', 'pipeline', 'omitted', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS forecast_category public.forecast_category;

CREATE OR REPLACE FUNCTION public.auto_set_forecast_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    NEW.forecast_category := 'closed';
  ELSIF NEW.status IN ('lost', 'cancelled') THEN
    NEW.forecast_category := 'omitted';
  ELSIF NEW.status = 'negotiation' THEN
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'commit');
  ELSIF NEW.status = 'proposal' THEN
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'best_case');
  ELSE
    NEW.forecast_category := COALESCE(NEW.forecast_category, 'pipeline');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_forecast_category ON public.sales;
CREATE TRIGGER trg_auto_forecast_category
  BEFORE INSERT OR UPDATE OF status ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_forecast_category();

UPDATE public.sales SET forecast_category =
  CASE
    WHEN status = 'completed' THEN 'closed'::forecast_category
    WHEN status IN ('lost','cancelled') THEN 'omitted'::forecast_category
    WHEN status = 'negotiation' THEN 'commit'::forecast_category
    WHEN status = 'proposal' THEN 'best_case'::forecast_category
    ELSE 'pipeline'::forecast_category
  END
WHERE forecast_category IS NULL;

CREATE TABLE IF NOT EXISTS public.buying_committee_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_email text,
  job_title text,
  committee_role text NOT NULL DEFAULT 'user',
  influence_level integer NOT NULL DEFAULT 3 CHECK (influence_level BETWEEN 1 AND 5),
  sentiment text NOT NULL DEFAULT 'neutral',
  is_single_threaded boolean DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bcm_sale ON public.buying_committee_members(sale_id);
ALTER TABLE public.buying_committee_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bcm_select" ON public.buying_committee_members;
CREATE POLICY "bcm_select" ON public.buying_committee_members FOR SELECT
USING (
  is_admin_or_manager(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_salesperson_id())
);
DROP POLICY IF EXISTS "bcm_insert" ON public.buying_committee_members;
CREATE POLICY "bcm_insert" ON public.buying_committee_members FOR INSERT
WITH CHECK (
  is_admin_or_manager(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_salesperson_id())
);
DROP POLICY IF EXISTS "bcm_update" ON public.buying_committee_members;
CREATE POLICY "bcm_update" ON public.buying_committee_members FOR UPDATE
USING (
  is_admin_or_manager(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_salesperson_id())
);
DROP POLICY IF EXISTS "bcm_delete" ON public.buying_committee_members;
CREATE POLICY "bcm_delete" ON public.buying_committee_members FOR DELETE
USING (
  is_admin_or_manager(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_salesperson_id())
);

DROP TRIGGER IF EXISTS trg_bcm_updated_at ON public.buying_committee_members;
CREATE TRIGGER trg_bcm_updated_at BEFORE UPDATE ON public.buying_committee_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.pipeline_inspection_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  stage text NOT NULL,
  days_in_stage integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz,
  days_since_activity integer,
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  health_score integer,
  inspected_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pis_sale ON public.pipeline_inspection_snapshots(sale_id);
CREATE INDEX IF NOT EXISTS idx_pis_inspected ON public.pipeline_inspection_snapshots(inspected_at DESC);
ALTER TABLE public.pipeline_inspection_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pis_select" ON public.pipeline_inspection_snapshots;
CREATE POLICY "pis_select" ON public.pipeline_inspection_snapshots FOR SELECT
USING (
  is_admin_or_manager(auth.uid()) OR
  EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.salesperson_id = get_current_salesperson_id())
);
DROP POLICY IF EXISTS "pis_insert_admin" ON public.pipeline_inspection_snapshots;
CREATE POLICY "pis_insert_admin" ON public.pipeline_inspection_snapshots FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE TABLE IF NOT EXISTS public.qbr_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_label text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  salesperson_id uuid REFERENCES public.salespeople(id) ON DELETE SET NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_narrative text,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by uuid,
  generated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qbr_period ON public.qbr_reports(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_qbr_sp ON public.qbr_reports(salesperson_id);
ALTER TABLE public.qbr_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qbr_select" ON public.qbr_reports;
CREATE POLICY "qbr_select" ON public.qbr_reports FOR SELECT
USING (is_admin_or_manager(auth.uid()) OR salesperson_id = get_current_salesperson_id());
DROP POLICY IF EXISTS "qbr_insert_admin" ON public.qbr_reports;
CREATE POLICY "qbr_insert_admin" ON public.qbr_reports FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));
DROP POLICY IF EXISTS "qbr_delete_admin" ON public.qbr_reports;
CREATE POLICY "qbr_delete_admin" ON public.qbr_reports FOR DELETE
USING (is_admin_or_manager(auth.uid()));

CREATE OR REPLACE FUNCTION public.compute_forecast_rollup(_horizon_days integer DEFAULT 90)
RETURNS TABLE(
  category public.forecast_category,
  deal_count integer,
  total_amount numeric,
  weighted_amount numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH weights AS (
    SELECT * FROM (VALUES
      ('commit'::forecast_category, 0.90),
      ('best_case'::forecast_category, 0.60),
      ('pipeline'::forecast_category, 0.25),
      ('omitted'::forecast_category, 0.0),
      ('closed'::forecast_category, 1.0)
    ) AS t(c, w)
  )
  SELECT
    s.forecast_category,
    COUNT(*)::integer,
    COALESCE(SUM(s.amount), 0)::numeric,
    COALESCE(SUM(s.amount * w.w), 0)::numeric
  FROM public.sales s
  LEFT JOIN weights w ON w.c = s.forecast_category
  WHERE s.created_at >= now() - (_horizon_days || ' days')::interval
    AND s.forecast_category IS NOT NULL
    AND (is_admin_or_manager(auth.uid()) OR s.salesperson_id = get_current_salesperson_id())
  GROUP BY s.forecast_category
  ORDER BY s.forecast_category;
END;
$$;

CREATE OR REPLACE FUNCTION public.win_rate_breakdown(_dimension text DEFAULT 'category', _days integer DEFAULT 180)
RETURNS TABLE(
  segment text,
  total_deals integer,
  won_deals integer,
  lost_deals integer,
  win_rate numeric,
  avg_deal_size numeric,
  total_revenue numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _col text;
BEGIN
  _col := CASE _dimension
    WHEN 'source' THEN 'source'
    WHEN 'product' THEN 'product_name'
    ELSE 'category'
  END;

  RETURN QUERY EXECUTE format($f$
    SELECT
      COALESCE(%I::text, 'unknown'),
      COUNT(*)::integer,
      COUNT(*) FILTER (WHERE status = 'completed')::integer,
      COUNT(*) FILTER (WHERE status IN ('lost','cancelled'))::integer,
      CASE WHEN COUNT(*) FILTER (WHERE status IN ('completed','lost','cancelled')) > 0
        THEN ROUND(100.0 * COUNT(*) FILTER (WHERE status='completed')::numeric
          / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','lost','cancelled')),0), 1)
        ELSE 0 END,
      COALESCE(AVG(amount) FILTER (WHERE status='completed'), 0)::numeric,
      COALESCE(SUM(amount) FILTER (WHERE status='completed'), 0)::numeric
    FROM public.sales
    WHERE created_at >= now() - ($1 || ' days')::interval
      AND (public.is_admin_or_manager(auth.uid()) OR salesperson_id = public.get_current_salesperson_id())
    GROUP BY %I
    ORDER BY 7 DESC
    LIMIT 50
  $f$, _col, _col) USING _days;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_pipeline_inspection()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _r RECORD;
  _flags jsonb;
  _last_act timestamptz;
  _days_act integer;
  _days_stage integer;
  _count integer := 0;
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR _r IN
    SELECT id, status, updated_at, salesperson_id
    FROM public.sales
    WHERE status NOT IN ('completed','lost','cancelled')
  LOOP
    _flags := '[]'::jsonb;
    _days_stage := EXTRACT(epoch FROM (now() - _r.updated_at))::integer / 86400;

    SELECT MAX(created_at) INTO _last_act FROM public.activities WHERE sale_id = _r.id;
    _days_act := CASE WHEN _last_act IS NULL THEN NULL ELSE EXTRACT(epoch FROM (now() - _last_act))::integer / 86400 END;

    IF _days_stage > 14 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','stale_stage','severity','high','days',_days_stage)); END IF;
    IF _days_act IS NULL OR _days_act > 7 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_recent_activity','severity','medium','days',_days_act)); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.buying_committee_members WHERE sale_id = _r.id AND committee_role IN ('decision_maker','champion')) THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_decision_maker','severity','high'));
    END IF;
    IF (SELECT COUNT(*) FROM public.buying_committee_members WHERE sale_id = _r.id) <= 1 THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','single_threaded','severity','medium'));
    END IF;

    INSERT INTO public.pipeline_inspection_snapshots
      (sale_id, stage, days_in_stage, last_activity_at, days_since_activity, risk_flags)
    VALUES (_r.id, _r.status, _days_stage, _last_act, _days_act, _flags);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$$;
