-- Etapa 8: Rivalidades + Highlights
-- View: race_rivalries_view detecta pares de salespeople que se ultrapassaram >= 3x

CREATE OR REPLACE VIEW public.race_rivalries_view AS
WITH overtake_pairs AS (
  SELECT
    season_id,
    salesperson_id AS overtaker_id,
    (metadata->>'overtaken_id')::uuid AS overtaken_id,
    created_at
  FROM public.race_events
  WHERE event_type = 'overtake'
    AND metadata ? 'overtaken_id'
    AND (metadata->>'overtaken_id')::uuid IS NOT NULL
),
normalized AS (
  SELECT
    season_id,
    LEAST(overtaker_id, overtaken_id) AS rival_a,
    GREATEST(overtaker_id, overtaken_id) AS rival_b,
    created_at
  FROM overtake_pairs
  WHERE overtaker_id <> overtaken_id
)
SELECT
  season_id,
  rival_a,
  rival_b,
  COUNT(*)::int AS swap_count,
  MAX(created_at) AS last_swap_at
FROM normalized
GROUP BY season_id, rival_a, rival_b
HAVING COUNT(*) >= 3;

COMMENT ON VIEW public.race_rivalries_view IS 'Pares de vendedores com >= 3 ultrapassagens entre si na mesma temporada (rivalidades).';

GRANT SELECT ON public.race_rivalries_view TO authenticated;