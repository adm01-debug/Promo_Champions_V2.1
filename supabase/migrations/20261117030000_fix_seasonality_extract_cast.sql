-- Completa o conserto de get_client_seasonality e get_industry_seasonality.
--
-- A migration 20261117010000 trocou q.total_amount (coluna inexistente) por
-- q.total_value e removeu o erro 42703. Com ele fora do caminho, apareceu um
-- SEGUNDO erro, que estava escondido atras do primeiro:
--
--   ERROR: 42804: structure of query does not match function result type
--   DETAIL: Returned type numeric does not match expected type double
--           precision in column 1.
--
-- Causa: EXTRACT(YEAR FROM ...) e EXTRACT(MONTH FROM ...) devolvem numeric no
-- PostgreSQL atual, e as duas funcoes declaram RETURNS TABLE(year double
-- precision, month double precision, ...). O RETURN QUERY nao faz coercao
-- implicita entre numeric e double precision.
--
-- Fix: cast explicito ::double precision nas colunas year/month. A assinatura
-- declarada fica intacta de proposito -- mudar o tipo de retorno invalidaria
-- src/integrations/supabase/types.ts e os 3 consumidores
-- (src/hooks/bi/useClientBI.ts, src/hooks/bi/useIndustryTrends.ts,
-- src/hooks/dashboard/useIntelligenceZones.ts).
--
-- Verificado em producao antes deste commit, dentro de BEGIN ... ROLLBACK, com
-- cliente real (7d126461, 300 orcamentos):
--
--   get_client_seasonality   -> 2025/12: 30 orcamentos, 121907.8790
--                               2025/11: 40 orcamentos, 209989.7860
--                               2025/10: 30 orcamentos, 173910.7995
--   get_industry_seasonality -> 2025/12: media 30 orcamentos, 1 empresa ativa
--                               2025/11: media 40 orcamentos, 1 empresa ativa
--
-- Fora o cast, o corpo e identico ao que 20261117010000 deixou em producao.

CREATE OR REPLACE FUNCTION public.get_client_seasonality(_client_id uuid, _months integer DEFAULT 24)
 RETURNS TABLE(year double precision, month double precision, quotes_count bigint, total_revenue numeric, avg_ticket numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM q.created_at)::double precision as year,
        EXTRACT(MONTH FROM q.created_at)::double precision as month,
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
        yr::double precision as year,
        mon::double precision as month,
        AVG(q_count)::NUMERIC as avg_quotes_per_company,
        AVG(total_rev)::NUMERIC as avg_revenue_per_company,
        COUNT(DISTINCT client_id)::BIGINT as companies_active
    FROM monthly_stats
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC;
END;
$function$;
