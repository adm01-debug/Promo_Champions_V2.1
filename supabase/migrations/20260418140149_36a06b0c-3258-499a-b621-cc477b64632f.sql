-- 1. role_type nas temporadas
ALTER TABLE public.race_seasons 
  ADD COLUMN IF NOT EXISTS role_type text NOT NULL DEFAULT 'closer'
  CHECK (role_type IN ('closer', 'sdr'));

CREATE INDEX IF NOT EXISTS idx_race_seasons_role_status 
  ON public.race_seasons(role_type, status);

-- 2. Regras de pontuação
CREATE TABLE IF NOT EXISTS public.race_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  metric_code text NOT NULL,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0),
  points_per_unit numeric NOT NULL DEFAULT 1.0,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, metric_code),
  CHECK (metric_code IN (
    'sales_value', 'markup_pct', 'new_clients_activated', 'routine_compliance',
    'stakeholders_captured', 'conversations_initiated', 'sales_value_originated'
  ))
);

CREATE INDEX IF NOT EXISTS idx_race_scoring_rules_season ON public.race_scoring_rules(season_id);

ALTER TABLE public.race_scoring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_scoring_rules_authenticated"
  ON public.race_scoring_rules FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin_manage_scoring_rules"
  ON public.race_scoring_rules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. View do leaderboard com pontuação dinâmica
DROP VIEW IF EXISTS public.race_leaderboard_view;

CREATE VIEW public.race_leaderboard_view
WITH (security_invoker=true)
AS
WITH season_metrics AS (
  SELECT
    rs.id AS season_id,
    rs.role_type,
    rs.start_date,
    rs.end_date,
    rs.goal_amount,
    rc.id AS car_id,
    rc.salesperson_id,
    sp.name AS salesperson_name,
    sp.avatar_url,
    rc.car_number,
    rc.primary_color,
    rc.secondary_color,
    rc.car_style,
    rc.nickname,
    COALESCE(SUM(s.amount) FILTER (WHERE s.status = 'completed'), 0)::numeric AS sales_value_raw,
    COUNT(s.id) FILTER (WHERE s.status = 'completed')::numeric AS deals_count_raw,
    COUNT(DISTINCT s.client_name) FILTER (WHERE s.status = 'completed')::numeric AS new_clients_raw,
    (SELECT COUNT(*)::numeric FROM public.activities a
       WHERE a.salesperson_id = rc.salesperson_id
         AND a.created_at::date BETWEEN rs.start_date AND rs.end_date
    ) AS activities_raw,
    (SELECT COUNT(*)::numeric FROM public.activities a
       WHERE a.salesperson_id = rc.salesperson_id
         AND a.created_at::date BETWEEN rs.start_date AND rs.end_date
         AND a.outcome IN ('connected','qualified','scheduled','callback')
    ) AS conversations_raw
  FROM public.race_seasons rs
  CROSS JOIN public.race_cars rc
  JOIN public.salespeople sp ON sp.id = rc.salesperson_id
  LEFT JOIN public.sales s 
    ON s.salesperson_id = rc.salesperson_id 
   AND s.created_at::date BETWEEN rs.start_date AND rs.end_date
  WHERE rs.status = 'active'
    AND (sp.role::text = rs.role_type OR sp.role::text = 'hybrid')
  GROUP BY rs.id, rs.role_type, rs.start_date, rs.end_date, rs.goal_amount,
           rc.id, rc.salesperson_id, sp.name, sp.avatar_url, rc.car_number,
           rc.primary_color, rc.secondary_color, rc.car_style, rc.nickname
),
scored AS (
  SELECT
    sm.*,
    COALESCE((
      SELECT SUM(
        CASE rsr.metric_code
          WHEN 'sales_value' THEN sm.sales_value_raw
          WHEN 'sales_value_originated' THEN sm.sales_value_raw
          WHEN 'new_clients_activated' THEN sm.new_clients_raw
          WHEN 'stakeholders_captured' THEN sm.new_clients_raw
          WHEN 'routine_compliance' THEN sm.activities_raw
          WHEN 'conversations_initiated' THEN sm.conversations_raw
          WHEN 'markup_pct' THEN sm.sales_value_raw * 0.3
          ELSE 0
        END * rsr.points_per_unit * rsr.weight
      )
      FROM public.race_scoring_rules rsr
      WHERE rsr.season_id = sm.season_id
    ), sm.sales_value_raw) AS score_raw
  FROM season_metrics sm
)
SELECT
  season_id,
  car_id,
  salesperson_id,
  salesperson_name,
  avatar_url,
  car_number,
  primary_color,
  secondary_color,
  car_style,
  nickname,
  role_type,
  sales_value_raw AS total_sales,
  deals_count_raw::bigint AS deals_count,
  new_clients_raw AS new_clients_count,
  activities_raw AS activities_count,
  conversations_raw AS conversations_count,
  score_raw AS score,
  CASE
    WHEN goal_amount > 0 THEN LEAST(1.0, score_raw / goal_amount)
    ELSE 0
  END AS progress
FROM scored;

-- 4. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_scoring_rules;