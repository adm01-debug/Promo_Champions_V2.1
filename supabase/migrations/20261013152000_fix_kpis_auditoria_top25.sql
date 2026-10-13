-- Auditoria top 25 #8 — KPIs errados na raiz (views/MV/RPC + histórico de estágio).
--
-- Quatro defeitos confirmados no HEAD que zeravam/inflavam KPIs:
--
-- 1) mv_competitive_ranking (criada em 20260517113746): monthly_sales filtrava
--    apenas status='completed', mas o domínio de "ganho" é
--    ('completed','won','closed') — o sync do Bitrix24 grava 'won'/'closed'
--    (ver WON_SALE_STATUSES em src/constants e o CHECK de sales.status de
--    20260224142333). Resultado: vendas ganhas não entravam no somatório,
--    todos empatavam em 0 e o RANK() devolvia 1º para todo mundo.
--    Correção: filtro canônico de status ganho/perdido e janela pelo
--    COALESCE(closed_at, created_at) — venda criada em mês anterior e ganha
--    neste mês conta no mês do fechamento.
--    A MV é dropada e recriada (não existe CREATE OR REPLACE MATERIALIZED
--    VIEW); a view wrapper public.competitive_ranking e os grants vigentes
--    (20260831130000) são reproduzidos na sequência.
--
-- 2) revenue_forecast_view (recriada por último em 20260513194107):
--    open_deals excluía só ('completed','lost','abandoned'), então 'won',
--    'closed' e 'cancelled' eram contados como pipeline aberto;
--    closed_recent só contava 'completed' (mesmo problema de status ganho);
--    e os cenários (realistic/optimistic_30d) somavam commit + best_case
--    sem COALESCE interno — bastava best_case NULL para zerar o cenário.
--    Correção: open_deals passa a derivar da fonte única
--    public.stage_probabilities (SSOT de 20261001220000): só entra estágio
--    com 0 < probabilidade < 1 (won/closed/completed=1.00 e
--    lost/cancelled=0.00 ficam de fora, junto com status desconhecido);
--    closed_recent usa o trio ganho; cenários fazem COALESCE por categoria.
--
-- 3) get_industry_top_products (20260524194411): growth_rate era o
--    placeholder fixo 15.5. Correção: taxa real por produto =
--    (volume no período _days - volume no período _days anterior) /
--    volume anterior * 100. Sem baseline no período anterior, retorna 0
--    (o frontend imprime "+{growth}%"; NULL renderizaria "+null%").
--
-- 4) deal_stage_history (criada em 20251212212817): nunca teve writer —
--    o trigger trg_record_sale_stage_transition (20260418122352) alimenta
--    apenas deal_stage_transitions, então velocity/funil/conversão liam
--    tabela vazia. Correção: trigger espelho em sales (mesmo padrão
--    SECURITY DEFINER + search_path do trigger irmão) + backfill
--    idempotente que (a) replaya deal_stage_transitions na tabela legada
--    e (b) semeia uma linha com o status atual para vendas sem histórico.
--
-- Tudo idempotente (reaplicar a migration é no-op onde faz sentido) e sem
-- dados destrutivos: objetos recriados preservam nomes/colunas/grants.

-- ════════════════════════════════════════════════════════════════════════
-- 1) mv_competitive_ranking — status ganho real + janela pelo fechamento
-- ════════════════════════════════════════════════════════════════════════

DROP MATERIALIZED VIEW IF EXISTS public.mv_competitive_ranking CASCADE;

CREATE MATERIALIZED VIEW public.mv_competitive_ranking AS
WITH monthly_sales AS (
    SELECT
        salesperson_id,
        SUM(amount) as total_sales,
        COUNT(*) as deals_count
    FROM public.sales
    WHERE status IN ('completed', 'won', 'closed')
      AND COALESCE(closed_at, created_at) >= date_trunc('month', now())
      AND COALESCE(closed_at, created_at) < date_trunc('month', now()) + interval '1 month'
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
-- 2) revenue_forecast_view — pipeline aberto real + cenários sem NULL
-- ════════════════════════════════════════════════════════════════════════

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
    SUM(amount) FILTER (WHERE forecast_category = 'pipeline') as pipeline_amount,
    SUM(amount) FILTER (WHERE forecast_category = 'closed') as closed_amount
  FROM open_deals
  GROUP BY salesperson_id
),
closed_recent AS (
  SELECT
    salesperson_id,
    count(*) AS won_count,
    avg(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0) AS avg_cycle_days,
    sum(amount) AS won_amount_90d
  FROM public.sales
  WHERE status IN ('completed', 'won', 'closed')
    AND updated_at >= (now() - interval '90 days')
  GROUP BY salesperson_id
),
goals_current AS (
  SELECT
    salesperson_id,
    goal_amount
  FROM sales_goals
  WHERE month = date_trunc('month', now())::date
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
-- 3) get_industry_top_products — growth_rate real (era placeholder 15.5)
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_industry_top_products(_company_ids UUID[], _days INT DEFAULT 90, _limit INT DEFAULT 5)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    total_sales BIGINT,
    growth_rate NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    WITH cur AS (
        SELECT qi.product_id, COUNT(qi.id)::BIGINT AS sales_now
        FROM public.quotes q
        JOIN public.quote_items qi ON q.id = qi.quote_id
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (_days || ' days')::INTERVAL
        AND q.status = 'approved'
        GROUP BY qi.product_id
    ),
    prev AS (
        SELECT qi.product_id, COUNT(qi.id)::BIGINT AS sales_prev
        FROM public.quotes q
        JOIN public.quote_items qi ON q.id = qi.quote_id
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (2 * _days || ' days')::INTERVAL
        AND q.created_at <  NOW() - (_days || ' days')::INTERVAL
        AND q.status = 'approved'
        GROUP BY qi.product_id
    )
    SELECT
        c.product_id,
        p.name as product_name,
        c.sales_now as total_sales,
        CASE
            WHEN COALESCE(pr.sales_prev, 0) > 0
            THEN ROUND(((c.sales_now - pr.sales_prev)::NUMERIC / pr.sales_prev) * 100, 1)
            ELSE 0::NUMERIC
        END as growth_rate
    FROM cur c
    JOIN public.products p ON c.product_id = p.id
    LEFT JOIN prev pr ON pr.product_id = c.product_id
    ORDER BY total_sales DESC
    LIMIT _limit;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════
-- 4) deal_stage_history — trigger de escrita + backfill idempotente
-- ════════════════════════════════════════════════════════════════════════

-- Trigger espelho de record_sale_stage_transition (20260418122352), mesmo
-- padrão: SECURITY DEFINER porque a policy de INSERT exige ownership da venda
-- e writers de sistema (service_role, RPCs definer) precisam passar.
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

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.deal_stage_history
       SET exited_at = now()
     WHERE sale_id = NEW.id AND exited_at IS NULL;

    INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
    VALUES (NEW.id, NEW.status::text, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deal_stage_history ON public.sales;
CREATE TRIGGER trg_deal_stage_history
  AFTER INSERT OR UPDATE OF status ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_deal_stage_history();

-- Backfill idempotente.
-- (a) Replay das transições reais já registradas em deal_stage_transitions:
INSERT INTO public.deal_stage_history (sale_id, stage, entered_at, exited_at)
SELECT t.sale_id, t.to_stage, t.entered_at, t.exited_at
FROM public.deal_stage_transitions t
WHERE NOT EXISTS (
  SELECT 1 FROM public.deal_stage_history h
  WHERE h.sale_id = t.sale_id
    AND h.stage = t.to_stage
    AND h.entered_at = t.entered_at
);

-- (b) Vendas sem histórico nenhum (criadas antes dos triggers): semeia a
-- linha inicial com o status atual no created_at — sem inventar transições.
INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
SELECT s.id, s.status, COALESCE(s.created_at, now())
FROM public.sales s
WHERE s.status IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.deal_stage_history h WHERE h.sale_id = s.id
  );
