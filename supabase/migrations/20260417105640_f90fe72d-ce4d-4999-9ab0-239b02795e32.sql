
CREATE TABLE public.contact_engagement_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead','client')),
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'cold' CHECK (tier IN ('cold','warm','hot','on_fire')),
  total_opens INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_replies INTEGER NOT NULL DEFAULT 0,
  last_signal_at TIMESTAMPTZ,
  decay_applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, contact_type)
);

CREATE INDEX idx_ces_contact ON public.contact_engagement_score(contact_id, contact_type);
CREATE INDEX idx_ces_score_tier ON public.contact_engagement_score(tier, score DESC);

ALTER TABLE public.contact_engagement_score ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.user_owns_engagement_contact(_contact_id UUID, _contact_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.is_admin_or_manager(auth.uid())
    OR (
      _contact_type = 'lead' AND EXISTS (
        SELECT 1 FROM public.sales s
        WHERE s.id = _contact_id
          AND s.salesperson_id = public.get_current_salesperson_id()
      )
    )
    OR (
      _contact_type = 'client' AND EXISTS (
        SELECT 1 FROM public.client_portfolio cp
        WHERE cp.client_id = _contact_id
          AND cp.salesperson_id = public.get_current_salesperson_id()
      )
    )
$$;

CREATE POLICY "ces_select_owner" ON public.contact_engagement_score
  FOR SELECT USING (public.user_owns_engagement_contact(contact_id, contact_type));

CREATE POLICY "ces_admin_all" ON public.contact_engagement_score
  FOR ALL USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE TABLE public.engagement_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('lead','client')),
  score NUMERIC(5,2) NOT NULL,
  tier TEXT NOT NULL,
  captured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, contact_type, captured_at)
);

CREATE INDEX idx_esh_contact_date ON public.engagement_score_history(contact_id, contact_type, captured_at DESC);

ALTER TABLE public.engagement_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "esh_select_owner" ON public.engagement_score_history
  FOR SELECT USING (public.user_owns_engagement_contact(contact_id, contact_type));

CREATE POLICY "esh_admin_all" ON public.engagement_score_history
  FOR ALL USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE OR REPLACE VIEW public.engagement_score_leaderboard AS
SELECT
  ces.id,
  ces.contact_id,
  ces.contact_type,
  ces.score,
  ces.tier,
  ces.total_opens,
  ces.total_clicks,
  ces.total_replies,
  ces.last_signal_at,
  ces.updated_at,
  CASE
    WHEN ces.contact_type = 'lead' THEN (SELECT client_name FROM public.sales WHERE id = ces.contact_id)
    WHEN ces.contact_type = 'client' THEN (SELECT name FROM public.clients WHERE id = ces.contact_id)
  END AS contact_name,
  CASE
    WHEN ces.contact_type = 'lead' THEN (SELECT salesperson_id FROM public.sales WHERE id = ces.contact_id)
    WHEN ces.contact_type = 'client' THEN (SELECT salesperson_id FROM public.client_portfolio WHERE client_id = ces.contact_id LIMIT 1)
  END AS owner_salesperson_id
FROM public.contact_engagement_score ces
WHERE ces.last_signal_at >= now() - interval '14 days';

CREATE OR REPLACE FUNCTION public.recompute_engagement_score(_contact_id UUID, _contact_type TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total_opens INTEGER := 0;
  v_total_clicks INTEGER := 0;
  v_total_replies INTEGER := 0;
  v_raw_score NUMERIC := 0;
  v_score NUMERIC := 0;
  v_tier TEXT := 'cold';
  v_last_signal TIMESTAMPTZ;
  v_half_life_days NUMERIC := 7;
BEGIN
  IF _contact_id IS NULL OR _contact_type NOT IN ('lead','client') THEN
    RETURN 0;
  END IF;

  SELECT
    COALESCE(SUM(opens), 0),
    COALESCE(SUM(clicks), 0),
    COALESCE(SUM(replies), 0),
    MAX(updated_at)
  INTO v_total_opens, v_total_clicks, v_total_replies, v_last_signal
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND updated_at >= now() - interval '30 days';

  SELECT COALESCE(SUM(
    (opens * 1 + clicks * 3 + replies * 8) *
    POWER(0.5, EXTRACT(EPOCH FROM (now() - updated_at)) / (v_half_life_days * 86400))
  ), 0)
  INTO v_raw_score
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND updated_at >= now() - interval '30 days';

  v_score := LEAST(100, GREATEST(0, v_raw_score * 2));

  v_tier := CASE
    WHEN v_score >= 81 THEN 'on_fire'
    WHEN v_score >= 51 THEN 'hot'
    WHEN v_score >= 21 THEN 'warm'
    ELSE 'cold'
  END;

  INSERT INTO public.contact_engagement_score
    (contact_id, contact_type, score, tier, total_opens, total_clicks, total_replies, last_signal_at, decay_applied_at, updated_at)
  VALUES
    (_contact_id, _contact_type, v_score, v_tier, v_total_opens, v_total_clicks, v_total_replies, v_last_signal, now(), now())
  ON CONFLICT (contact_id, contact_type) DO UPDATE SET
    score = EXCLUDED.score,
    tier = EXCLUDED.tier,
    total_opens = EXCLUDED.total_opens,
    total_clicks = EXCLUDED.total_clicks,
    total_replies = EXCLUDED.total_replies,
    last_signal_at = EXCLUDED.last_signal_at,
    decay_applied_at = now(),
    updated_at = now();

  INSERT INTO public.engagement_score_history (contact_id, contact_type, score, tier, captured_at)
  VALUES (_contact_id, _contact_type, v_score, v_tier, CURRENT_DATE)
  ON CONFLICT (contact_id, contact_type, captured_at) DO UPDATE SET
    score = EXCLUDED.score,
    tier = EXCLUDED.tier;

  RETURN v_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.bulk_recompute_engagement(_owner_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT cstp.contact_id, cstp.contact_type
    FROM public.contact_send_time_profile cstp
    WHERE cstp.updated_at >= now() - interval '30 days'
      AND (
        _owner_id IS NULL
        OR (
          cstp.contact_type = 'lead' AND EXISTS (
            SELECT 1 FROM public.sales s WHERE s.id = cstp.contact_id AND s.salesperson_id = _owner_id
          )
        )
        OR (
          cstp.contact_type = 'client' AND EXISTS (
            SELECT 1 FROM public.client_portfolio cp WHERE cp.client_id = cstp.contact_id AND cp.salesperson_id = _owner_id
          )
        )
      )
  LOOP
    PERFORM public.recompute_engagement_score(r.contact_id, r.contact_type);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recompute_engagement()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_engagement_score(NEW.contact_id, NEW.contact_type);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_engagement_on_signal ON public.contact_send_time_profile;
CREATE TRIGGER trg_recompute_engagement_on_signal
AFTER INSERT OR UPDATE ON public.contact_send_time_profile
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_engagement();
