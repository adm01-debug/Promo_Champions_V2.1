-- [PROB-SSOT] Fonte única de probabilidade por estágio/status de venda.
--
-- Contexto: existiam ~10 mapas hardcoded de probabilidade por estágio espalhados
-- entre frontend (bi-helpers, RevenueForecast, useBICloser, useWeightedForecast,
-- useDealProbability, SalesForecast, FollowUpValueAtRisk, PIPELINE_STAGES) e
-- edge functions (deal-probability, predict-quota-attainment,
-- analyze-pipeline-coverage, calibrate-win-probability,
-- calibrate-win-probabilities), cada um com valores divergentes para o mesmo
-- estágio. Esta tabela passa a ser a fonte única consultada por todos.
--
-- Seed vigente: STAGE_BASELINE de calibrate-win-probability — o mapa mais
-- completo e o único que cobre o vocabulário real de sales.status (ver
-- constraint sales_status_check) — convertido de 0-100 para fração 0-1.
-- Acrescentados: 'closed' (1.00, sinônimo de 'won'/'completed' no CHECK) e
-- 'open' (0.10, valor legado ainda consultado por useFollowUpData).

CREATE TABLE IF NOT EXISTS public.stage_probabilities (
  stage text PRIMARY KEY,
  probability numeric NOT NULL CHECK (probability >= 0 AND probability <= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stage_probabilities ENABLE ROW LEVEL SECURITY;

-- Leitura para usuários autenticados; service role (edge functions) bypassa RLS.
DROP POLICY IF EXISTS stage_probabilities_select ON public.stage_probabilities;
CREATE POLICY stage_probabilities_select
  ON public.stage_probabilities
  FOR SELECT TO authenticated
  USING (true);

INSERT INTO public.stage_probabilities (stage, probability) VALUES
  ('lead',        0.05),
  ('open',        0.10),
  ('pending',     0.10),
  ('prospecting', 0.15),
  ('qualified',   0.25),
  ('in_progress', 0.30),
  ('proposal',    0.50),
  ('negotiation', 0.75),
  ('cancelled',   0.00),
  ('lost',        0.00),
  ('completed',   1.00),
  ('closed',      1.00),
  ('won',         1.00)
ON CONFLICT (stage) DO UPDATE
  SET probability = EXCLUDED.probability,
      updated_at  = now();

-- Lookup por estágio; retorna NULL quando o estágio não está mapeado.
CREATE OR REPLACE FUNCTION public.get_stage_probability(p_stage text)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT probability FROM public.stage_probabilities WHERE stage = p_stage
$$;

REVOKE ALL ON FUNCTION public.get_stage_probability(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_stage_probability(text) TO authenticated, service_role;
