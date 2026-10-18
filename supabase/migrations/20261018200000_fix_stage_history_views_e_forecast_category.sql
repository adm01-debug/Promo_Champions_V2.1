-- Correções da validação pós-auditoria: guarda de status NULL no histórico
-- de estágio, fuso de negócio nas views e forecast_category para aliases de
-- venda ganha.
--
-- 1) trg_deal_stage_history (criada em 20261013152000): o branch de UPDATE
--    disparava em qualquer mudança de status, inclusive NEW.status = NULL —
--    o INSERT com stage NULL violava o NOT NULL de deal_stage_history.stage
--    e abortava o UPDATE inteiro (repro provada: UPDATE retornou ERROR e a
--    linha manteve status 'lead'). Guarda NEW.status IS NOT NULL no branch
--    de UPDATE.
--
-- 2) mv_competitive_ranking e revenue_forecast_view calculavam o início do
--    mês com date_trunc('month', now()) — fuso UTC — enquanto as edge
--    functions usam America/Sao_Paulo (toBusinessMonthStart em
--    functions/_shared/business-date.ts). Na virada de mês, entre 21h e 03h
--    UTC, os dois lados divergiam um mês inteiro. Recriadas com o boundary
--    no fuso de negócio: date_trunc('month', now() AT TIME ZONE
--    'America/Sao_Paulo') devolve o 1º dia local; reconvertido com
--    AT TIME ZONE para comparação contra colunas timestamptz, e ::date para
--    a chave YYYY-MM-01 de sales_goals.
--
-- 3) goals_current (revenue_forecast_view) exigia meta lançada no mês
--    corrente (month = mês atual); agora usa a meta MAIS RECENTE com
--    month ≤ mês corrente — mesmo fallback aplicado nas edge functions
--    analyze-pipeline-coverage e revops-hub.
--
-- 4) private.auto_set_forecast_category (movida para private em
--    20260619143950) classificava apenas 'completed' como 'closed' — os
--    aliases 'won'/'closed' gravados pelo sync caíam no ELSE 'pipeline'.
--    WHEN passa a cobrir o trio canônico, com backfill das linhas ganhas
--    ainda categorizadas como abertas.
--
-- Bônus: category_agg.closed_amount era computado mas nunca projetado no
-- SELECT externo (coluna morta) — removido da CTE.
--
-- Idempotente: recriações preservam nomes/colunas/grants; o backfill é
-- CASE-set direto e reexecução é no-op.

-- ════════════════════════════════════════════════════════════════════════
-- 1) trg_deal_stage_history — guarda NEW.status IS NOT NULL no UPDATE
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_deal_stage_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NOT NULL THEN
      INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
      SELECT NEW.id, NEW.status::text, COALESCE(NEW.created_at, now())
      WHERE NOT EXISTS (
        SELECT 1 FROM public.deal_stage_history h
        WHERE h.sale_id = NEW.id
          AND h.stage = NEW.status::text
          AND h.entered_at = COALESCE(NEW.created_at, now())
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Guarda NULL: sem ela, UPDATE status→NULL inseria stage NULL e a
  -- violação de NOT NULL revertia o UPDATE inteiro da venda.
  IF TG_OP = 'UPDATE'
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IS NOT NULL THEN
    UPDATE public.deal_stage_history
       SET exited_at = now()
     WHERE sale_id = NEW.id AND exited_at IS NULL;

    INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
    VALUES (NEW.id, NEW.status::text, now());
  END IF;

  RETURN NEW;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 2a) mv_competitive_ranking — boundary do mês no fuso de negócio
-- ════════════════════════════════════════════════════════════════════════
-- Mesma definição de 20261013152000; só muda o cálculo do início/fim do mês
-- corrente (UTC → America/Sao_Paulo). A MV é dropada e recriada (não existe
-- CREATE OR REPLACE MATERIALIZED VIEW); a view wrapper e os grants vigentes
-- são reproduzidos na sequência.

DROP MATERIALIZED VIEW IF EXISTS public.mv_competitive_ranking CASCADE;

CREATE MATERIALIZED VIEW public.mv_competitive_ranking AS
WITH monthly_sales AS (
    SELECT
        salesperson_id,
        SUM(amount) as total_sales,
        COUNT(*) as deals_count
    FROM public.sales
    WHERE status IN ('completed', 'won', 'closed')
      AND COALESCE(closed_at, updated_at) >= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo'
      AND COALESCE(closed_at, updated_at) < date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo' + interval '1 month'
    GROUP BY salesperson_id
),
monthly_leads AS (
    SELECT
        salesperson_id,
        COUNT(*) as leads_count
    FROM public.sales
    WHERE status NOT IN ('completed', 'won', 'closed', 'lost', 'cancelled')
    GROUP BY salesperson_id
)
SELECT
    s.id,
    s.name,
    s.avatar_url,
    s.role,
    COALESCE(ms.total_sales, 0) as total_sales,
    COALESCE(ms.deals_count, 0) as deals_count,
    COALESCE(ml.leads_count, 0) as leads_count,
    RANK() OVER (ORDER BY COALESCE(ms.total_sales, 0) DESC, COALESCE(ms.deals_count, 0) DESC) as rank
FROM public.salespeople s
LEFT JOIN monthly_sales ms ON s.id = ms.salesperson_id
LEFT JOIN monthly_leads ml ON s.id = ml.salesperson_id
WHERE s.is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS mv_competitive_ranking_id_idx ON public.mv_competitive_ranking (id);

-- View wrapper pela qual o app lê (mesma forma vigente desde 20260619145905,
-- security_invoker ligado desde 20260712221013).
CREATE OR REPLACE VIEW public.competitive_ranking
WITH (security_invoker = true) AS
SELECT * FROM public.mv_competitive_ranking;

-- Grants no estado vigente (20260831130000): MV direta só authenticated +
-- service_role; wrapper para authenticated.
REVOKE ALL ON public.mv_competitive_ranking FROM PUBLIC, anon;
GRANT SELECT ON public.mv_competitive_ranking TO authenticated;
GRANT ALL ON public.mv_competitive_ranking TO service_role;
GRANT SELECT ON public.competitive_ranking TO authenticated;
GRANT ALL ON public.competitive_ranking TO service_role;

-- ════════════════════════════════════════════════════════════════════════
-- 2b/3) revenue_forecast_view — goals_current com fallback + fuso de negócio
-- ════════════════════════════════════════════════════════════════════════
-- goals_current: meta mais recente ≤ mês corrente (DISTINCT ON + DESC) —
-- antes exigia match exato do mês e zerava monthly_goal de quem não teve
-- meta lançada. chave month comparada em ::date no fuso de negócio.
-- closed_amount da CTE category_agg era computado e nunca projetado —
-- removido (coluna morta apontada na validação).

CREATE OR REPLACE VIEW public.revenue_forecast_view
WITH (security_invoker = true)
AS
WITH open_deals AS (
  SELECT
    s.id,
    s.salesperson_id,
    s.amount,
    s.status,
    s.forecast_category,
    s.created_at,
    s.updated_at,
    sp.probability AS stage_probability
  FROM public.sales s
  JOIN public.stage_probabilities sp ON sp.stage = s.status
  -- Pipeline aberto = probabilidade estritamente entre 0 e 1 na SSOT
  -- (ganhos =1.00 e perdidos =0.00 ficam de fora, assim como status sem
  -- mapeamento — antes 'won'/'closed'/'cancelled' inflavam o pipeline).
  WHERE sp.probability > 0 AND sp.probability < 1
),
category_agg AS (
  SELECT
    salesperson_id,
    SUM(amount) FILTER (WHERE forecast_category = 'commit') as commit_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'best_case') as best_case_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'pipeline') as pipeline_amount
  FROM open_deals
  GROUP BY salesperson_id
),
closed_recent AS (
  SELECT
    salesperson_id,
    count(*) AS won_count,
    avg(EXTRACT(EPOCH FROM (COALESCE(closed_at, updated_at) - created_at)) / 86400.0) AS avg_cycle_days,
    sum(amount) AS won_amount_90d
  FROM public.sales
  WHERE status IN ('completed', 'won', 'closed')
    AND COALESCE(closed_at, updated_at) >= (now() - interval '90 days')
  GROUP BY salesperson_id
),
goals_current AS (
  -- Meta vigente = linha MAIS RECENTE de sales_goals com month ≤ mês
  -- corrente no fuso de negócio (fallback: cobre vendedor sem meta lançada
  -- no mês corrente — antes o match exato zerava monthly_goal).
  SELECT DISTINCT ON (salesperson_id)
    salesperson_id,
    goal_amount
  FROM sales_goals
  WHERE month <= date_trunc('month', now() AT TIME ZONE 'America/Sao_Paulo')::date
  ORDER BY salesperson_id, month DESC
)
SELECT
  COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
  COALESCE(SUM(od.amount), 0) AS total_open_pipeline,
  COALESCE(SUM(od.amount * od.stage_probability), 0) AS weighted_forecast,
  count(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
  COALESCE(MAX(cr.avg_cycle_days), 45) AS avg_cycle_days,
  COALESCE(MAX(cr.won_amount_90d), 0) AS won_amount_90d,
  COALESCE(MAX(cr.won_count), 0) AS won_count_90d,
  COALESCE(MAX(gc.goal_amount), 0) AS monthly_goal,
  COALESCE(MAX(ca.commit_amount), 0) as commit_amount,
  COALESCE(MAX(ca.best_case_amount), 0) as best_case_amount,
  COALESCE(MAX(ca.pipeline_amount), 0) as pipeline_amount,
  -- Cenários: COALESCE por categoria — sem best_case/pipeline o cenário não
  -- zera mais, só desconsidera o componente ausente.
  COALESCE(MAX(COALESCE(ca.commit_amount, 0)), 0) AS pessimistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) * 0.5), 0) AS realistic_30d,
  COALESCE(MAX(COALESCE(ca.commit_amount, 0) + COALESCE(ca.best_case_amount, 0) + COALESCE(ca.pipeline_amount, 0) * 0.3), 0) AS optimistic_30d
FROM open_deals od
FULL JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
FULL JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
LEFT JOIN category_agg ca ON ca.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

-- ════════════════════════════════════════════════════════════════════════
-- 4) private.auto_set_forecast_category — trio canônico de venda ganha
-- ════════════════════════════════════════════════════════════════════════
-- Recriada no schema private (destino da mudança de schema em
-- 20260619143950); CREATE OR REPLACE preserva a OID e o trigger
-- trg_auto_forecast_category continua apontando para ela.

CREATE OR REPLACE FUNCTION private.auto_set_forecast_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('completed', 'won', 'closed') THEN
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

-- Backfill: vendas ganhas categorizadas como abertas pela regra antiga
-- (qualquer categoria ≠ 'closed' vira 'closed'; idempotente).
UPDATE public.sales SET forecast_category = 'closed'::public.forecast_category
WHERE status IN ('completed', 'won', 'closed')
  AND forecast_category IS DISTINCT FROM 'closed'::public.forecast_category;
