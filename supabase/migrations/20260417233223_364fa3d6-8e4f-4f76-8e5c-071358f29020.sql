-- Extend deal_health_scores
ALTER TABLE public.deal_health_scores
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'watch' CHECK (tier IN ('healthy','watch','at_risk','critical')),
  ADD COLUMN IF NOT EXISTS factors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
  ADD COLUMN IF NOT EXISTS days_in_stage int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill owner_id from sales
UPDATE public.deal_health_scores dhs
SET owner_id = s.salesperson_id
FROM public.sales s
WHERE dhs.sale_id = s.id AND dhs.owner_id IS NULL;

-- Backfill tier from health_score
UPDATE public.deal_health_scores
SET tier = CASE
  WHEN health_score >= 75 THEN 'healthy'
  WHEN health_score >= 50 THEN 'watch'
  WHEN health_score >= 25 THEN 'at_risk'
  ELSE 'critical'
END
WHERE tier = 'watch' AND health_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deal_health_scores_owner_tier ON public.deal_health_scores(owner_id, tier, health_score);
CREATE INDEX IF NOT EXISTS idx_deal_health_scores_sale ON public.deal_health_scores(sale_id);

-- Ensure RLS
ALTER TABLE public.deal_health_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own deal health" ON public.deal_health_scores;
CREATE POLICY "Users see own deal health"
ON public.deal_health_scores FOR SELECT
USING (
  owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "System can manage deal health" ON public.deal_health_scores;
CREATE POLICY "System can manage deal health"
ON public.deal_health_scores FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Table: deal_health_history
CREATE TABLE IF NOT EXISTS public.deal_health_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  score int NOT NULL,
  tier text NOT NULL,
  delta int NOT NULL DEFAULT 0,
  snapshot_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_health_history_sale_time ON public.deal_health_history(sale_id, snapshot_at DESC);

ALTER TABLE public.deal_health_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own deal health history" ON public.deal_health_history;
CREATE POLICY "Users see own deal health history"
ON public.deal_health_history FOR SELECT
USING (
  owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

DROP POLICY IF EXISTS "System can insert health history" ON public.deal_health_history;
CREATE POLICY "System can insert health history"
ON public.deal_health_history FOR INSERT
WITH CHECK (true);

-- Trigger: track health change
CREATE OR REPLACE FUNCTION public.track_deal_health_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delta int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_health_history (sale_id, owner_id, score, tier, delta)
    VALUES (NEW.sale_id, COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid), NEW.health_score, NEW.tier, 0);
    RETURN NEW;
  END IF;

  v_delta := NEW.health_score - OLD.health_score;
  IF ABS(v_delta) >= 5 OR NEW.tier IS DISTINCT FROM OLD.tier THEN
    INSERT INTO public.deal_health_history (sale_id, owner_id, score, tier, delta)
    VALUES (NEW.sale_id, COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid), NEW.health_score, NEW.tier, v_delta);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_deal_health_change ON public.deal_health_scores;
CREATE TRIGGER trg_track_deal_health_change
AFTER INSERT OR UPDATE OF health_score, tier ON public.deal_health_scores
FOR EACH ROW EXECUTE FUNCTION public.track_deal_health_change();

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_deal_health_scores_updated ON public.deal_health_scores;
CREATE TRIGGER trg_deal_health_scores_updated
BEFORE UPDATE ON public.deal_health_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.deal_health_scores REPLICA IDENTITY FULL;
ALTER TABLE public.deal_health_history REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_health_scores;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_health_history;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;