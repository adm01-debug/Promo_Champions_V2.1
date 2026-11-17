-- Conserta get_client_seasonality e get_industry_seasonality, que estao
-- QUEBRADAS em producao: ambas somam public.quotes.total_amount, coluna que
-- nao existe. A coluna de valor de quotes e total_value.
--
-- Evidencia (chamada real em producao, nao leitura de codigo):
--   select * from public.get_client_seasonality((select id from public.clients limit 1));
--   ERROR: 42703: column q.total_amount does not exist
--   CONTEXT: PL/pgSQL function get_client_seasonality(uuid,integer) line 3 at RETURN QUERY
--   select * from public.get_industry_seasonality(array[...], 24);
--   ERROR: 42703: column q.total_amount does not exist
--
-- Em public.quotes existem apenas discount_amount, subtotal e total_value
-- (numeric). Nenhuma tabela do schema public tem total_amount exceto
-- supplier_orders, que nao e usada aqui.
--
-- Impacto: 3 consumidores no front chamam get_client_seasonality
-- (src/hooks/bi/useClientBI.ts, src/hooks/bi/useIndustryTrends.ts,
-- src/hooks/dashboard/useIntelligenceZones.ts), logo as telas de BI do cliente,
-- tendencias do setor e zonas de inteligencia falham na chamada.
--
-- Unica mudanca: q.total_amount -> q.total_value. Assinatura, tipo de retorno,
-- SECURITY DEFINER, search_path, agrupamento e ordenacao ficam identicos.
-- compute_forecast_rollup tambem cita total_amount, mas ali e NOME DE COLUNA DE
-- RETORNO, nao coluna de tabela: a funcao executa sem erro e nao e tocada.

CREATE OR REPLACE FUNCTION public.get_client_seasonality(_client_id uuid, _months integer DEFAULT 24)
 RETURNS TABLE(year double precision, month double precision, quotes_count bigint, total_revenue numeric, avg_ticket numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM q.created_at) as year,
        EXTRACT(MONTH FROM q.created_at) as month,
        COUNT(q.id)::BIGINT as quotes_count,
        SUM(q.total_value)::NUMERIC as total_revenue,
        AVG(q.total_value)::NUMERIC as avg_ticket
    FROM public.quotes q
    WHERE q.client_id = _client_id
    AND q.created_at >= NOW() - (_months || ' months')::INTERVAL
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_industry_seasonality(_company_ids uuid[], _months integer DEFAULT 24)
 RETURNS TABLE(year double precision, month double precision, avg_quotes_per_company numeric, avg_revenue_per_company numeric, companies_active bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    WITH monthly_stats AS (
        SELECT 
            EXTRACT(YEAR FROM q.created_at) as yr,
            EXTRACT(MONTH FROM q.created_at) as mon,
            q.client_id,
            COUNT(q.id) as q_count,
            SUM(q.total_value) as total_rev
        FROM public.quotes q
        WHERE q.client_id = ANY(_company_ids)
        AND q.created_at >= NOW() - (_months || ' months')::INTERVAL
        GROUP BY 1, 2, 3
    )
    SELECT 
        yr as year,
        mon as month,
        AVG(q_count)::NUMERIC as avg_quotes_per_company,
        AVG(total_rev)::NUMERIC as avg_revenue_per_company,
        COUNT(DISTINCT client_id)::BIGINT as companies_active
    FROM monthly_stats
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC;
END;
$function$;
