-- Indices to accelerate impact window calculations
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_completed_sp
  ON public.coaching_sessions (salesperson_id, completed_at)
  WHERE status = 'completed' AND completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ccs_sp_calc
  ON public.call_coaching_scorecards (salesperson_id, calculated_at);

CREATE INDEX IF NOT EXISTS idx_sales_sp_created_status
  ON public.sales (salesperson_id, created_at, status);

-- Drop existing view if any
DROP VIEW IF EXISTS public.coaching_impact_metrics;

-- View: per-session before/after metrics in 30-day windows
CREATE VIEW public.coaching_impact_metrics
WITH (security_invoker = true)
AS
WITH base AS (
  SELECT
    cs.id              AS session_id,
    cs.salesperson_id,
    cs.coach_id,
    cs.completed_at,
    cs.focus_skills,
    cs.outcome_rating
  FROM public.coaching_sessions cs
  WHERE cs.status = 'completed'
    AND cs.completed_at IS NOT NULL
    AND cs.salesperson_id IS NOT NULL
),
score_pre AS (
  SELECT b.session_id, AVG(s.overall_score)::numeric AS pre_avg_overall
  FROM base b
  LEFT JOIN public.call_coaching_scorecards s
    ON s.salesperson_id = b.salesperson_id
   AND s.calculated_at >= b.completed_at - INTERVAL '30 days'
   AND s.calculated_at <  b.completed_at
  GROUP BY b.session_id
),
score_post AS (
  SELECT b.session_id, AVG(s.overall_score)::numeric AS post_avg_overall
  FROM base b
  LEFT JOIN public.call_coaching_scorecards s
    ON s.salesperson_id = b.salesperson_id
   AND s.calculated_at >  b.completed_at
   AND s.calculated_at <= b.completed_at + INTERVAL '30 days'
  GROUP BY b.session_id
),
sales_pre AS (
  SELECT
    b.session_id,
    COUNT(*) FILTER (WHERE sa.status = 'completed')::numeric
      / NULLIF(COUNT(*), 0)::numeric AS pre_conversion,
    AVG(sa.amount) FILTER (WHERE sa.status = 'completed')::numeric AS pre_ticket
  FROM base b
  LEFT JOIN public.sales sa
    ON sa.salesperson_id = b.salesperson_id
   AND sa.created_at >= b.completed_at - INTERVAL '30 days'
   AND sa.created_at <  b.completed_at
  GROUP BY b.session_id
),
sales_post AS (
  SELECT
    b.session_id,
    COUNT(*) FILTER (WHERE sa.status = 'completed')::numeric
      / NULLIF(COUNT(*), 0)::numeric AS post_conversion,
    AVG(sa.amount) FILTER (WHERE sa.status = 'completed')::numeric AS post_ticket
  FROM base b
  LEFT JOIN public.sales sa
    ON sa.salesperson_id = b.salesperson_id
   AND sa.created_at >  b.completed_at
   AND sa.created_at <= b.completed_at + INTERVAL '30 days'
  GROUP BY b.session_id
)
SELECT
  b.session_id,
  b.salesperson_id,
  b.coach_id,
  b.completed_at,
  b.focus_skills,
  b.outcome_rating,
  COALESCE(sp.pre_avg_overall, 0)::numeric  AS pre_avg_overall,
  COALESCE(spo.post_avg_overall, 0)::numeric AS post_avg_overall,
  CASE
    WHEN COALESCE(sp.pre_avg_overall, 0) = 0 THEN 0
    ELSE ((COALESCE(spo.post_avg_overall, 0) - sp.pre_avg_overall) / sp.pre_avg_overall) * 100
  END::numeric AS delta_overall,
  COALESCE(sap.pre_conversion, 0)::numeric  AS pre_conversion,
  COALESCE(sapo.post_conversion, 0)::numeric AS post_conversion,
  CASE
    WHEN COALESCE(sap.pre_conversion, 0) = 0 THEN 0
    ELSE ((COALESCE(sapo.post_conversion, 0) - sap.pre_conversion) / sap.pre_conversion) * 100
  END::numeric AS delta_conversion,
  COALESCE(sap.pre_ticket, 0)::numeric  AS pre_ticket,
  COALESCE(sapo.post_ticket, 0)::numeric AS post_ticket,
  CASE
    WHEN COALESCE(sap.pre_ticket, 0) = 0 THEN 0
    ELSE ((COALESCE(sapo.post_ticket, 0) - sap.pre_ticket) / sap.pre_ticket) * 100
  END::numeric AS delta_ticket
FROM base b
LEFT JOIN score_pre   sp   ON sp.session_id   = b.session_id
LEFT JOIN score_post  spo  ON spo.session_id  = b.session_id
LEFT JOIN sales_pre   sap  ON sap.session_id  = b.session_id
LEFT JOIN sales_post  sapo ON sapo.session_id = b.session_id;

GRANT SELECT ON public.coaching_impact_metrics TO authenticated;