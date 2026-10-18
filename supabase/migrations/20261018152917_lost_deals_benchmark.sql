-- lost_deals_benchmark
-- Rollback: DROP FUNCTION public.get_monthly_sales_benchmark(integer);
--           ALTER TABLE public.monthly_sales_summary DROP COLUMN lost_deals;
--           recriar private.refresh_monthly_sales_summary (sem lost_deals)
--           conforme 20260513192406 (corpo + SET search_path TO 'public') +
--           20260619145322 (schema private), recriar
--           private.trigger_refresh_monthly_summary conforme 20260619145322
--           (sem o refresh do mês OLD), recriar
--           get_monthly_sales_benchmark de 4 colunas conforme 20260512175631
--           com GRANT EXECUTE para authenticated e service_role.
--
-- Motivo: HistoricalBenchmark exibia won_deals/deals como "Win Rate", mas
-- deals = COUNT(*) inclui vendas ABERTAS. Win rate decidido é
-- wins/(wins+losses) — para isso a RPC precisa expor lost_deals.
-- Também alinha 'closed' como status ganho canônico (won|completed|closed)
-- e 'cancelled' como perda (lost|cancelled), conforme src/constants/index.ts.

ALTER TABLE public.monthly_sales_summary
    ADD COLUMN IF NOT EXISTS lost_deals INTEGER DEFAULT 0;

-- A função de refresh efetiva vive em private desde 20260619145322 — o
-- trigger private.trigger_refresh_monthly_summary chama
-- private.refresh_monthly_sales_summary. Atualizar public.* aqui seria
-- dead code (ninguém chama) e reexposição de um helper de escrita.
CREATE OR REPLACE FUNCTION private.refresh_monthly_sales_summary(p_month TEXT)
RETURNS VOID AS $$
BEGIN
    -- Bug pré-existente: o INSERT...SELECT abaixo retorna zero linhas quando
    -- o mês ficou sem vendas (DELETE da última venda ou UPDATE cross-month),
    -- então o resumo velho nunca era limpo — linha fantasma permanente.
    IF NOT EXISTS (
        SELECT 1 FROM public.sales
        WHERE to_char(created_at, 'YYYY-MM') = p_month
    ) THEN
        DELETE FROM public.monthly_sales_summary WHERE month = p_month;
        RETURN;
    END IF;

    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, lost_deals, updated_at)
    SELECT
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed', 'closed') OR status IN ('won', 'completed', 'closed') THEN amount ELSE 0 END)::NUMERIC as revenue,
        COUNT(*)::INT as deals,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed', 'closed') OR status IN ('won', 'completed', 'closed') THEN 1 END)::INT as won_deals,
        COUNT(CASE WHEN deal_status::text IN ('lost', 'cancelled') OR status IN ('lost', 'cancelled') THEN 1 END)::INT as lost_deals,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE
    SET revenue = EXCLUDED.revenue,
        deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals,
        lost_deals = EXCLUDED.lost_deals,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public';

-- Reafirma a restrição de privilégio do helper privado (mesma política de
-- 20260619145322 — CREATE OR REPLACE preserva grants, mas o REVOKE é
-- idempotente e protege contra drift).
REVOKE ALL ON FUNCTION private.refresh_monthly_sales_summary(text) FROM PUBLIC, anon, authenticated;

-- Bug pré-existente no trigger: em UPDATE que movia created_at para outro
-- mês, só o mês NOVO era recalculado — o mês de origem mantinha a venda
-- fantasma (contagem dupla em dois meses). Agora recalcula ambos quando
-- o bucket muda. Mesma assinatura/SECURITY DEFINER de 20260619145322.
CREATE OR REPLACE FUNCTION private.trigger_refresh_monthly_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE'
           AND to_char(OLD.created_at, 'YYYY-MM') IS DISTINCT FROM to_char(NEW.created_at, 'YYYY-MM')) THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    ELSE
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$function$;

-- RPC expõe lost_deals — o front calcula wins/(wins+losses) de verdade.
-- DROP obrigatório: o RETURNS TABLE ganha uma coluna e CREATE OR REPLACE
-- não aceita mudar o tipo de retorno de função existente.
DROP FUNCTION IF EXISTS public.get_monthly_sales_benchmark(integer);
CREATE FUNCTION public.get_monthly_sales_benchmark(months_back integer DEFAULT 13)
 RETURNS TABLE(month text, revenue numeric, deals integer, won_deals integer, lost_deals integer)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        s.month,
        s.revenue,
        s.deals,
        s.won_deals,
        s.lost_deals
    FROM public.monthly_sales_summary s
    WHERE s.month >= to_char(CURRENT_DATE - (months_back || ' month')::INTERVAL, 'YYYY-MM')
    ORDER BY s.month;
END;
$function$;

-- DROP derruba os GRANTs. Reaplica a politica de 20260619192803:
-- revoga de PUBLIC/anon e devolve EXECUTE a service_role e authenticated
-- (a RPC esta na whitelist de chamadas do front).
REVOKE EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) TO authenticated;

-- Backfill: itera os meses DO RESUMO (não de sales) — meses residuais sem
-- vendas são removidos pelo guard da refresh (eram stale por definição:
-- a venda que os alimentava foi deletada/movida) e meses com vendas são
-- recalculados com o novo conjunto de ganhos/perdas.
DO $$
DECLARE m TEXT;
BEGIN
    FOR m IN SELECT month FROM public.monthly_sales_summary
    LOOP
        PERFORM private.refresh_monthly_sales_summary(m);
    END LOOP;
END;
$$;

-- Meses que só existem em sales (resumo nunca gerado) — cobertura extra.
DO $$
DECLARE m TEXT;
BEGIN
    FOR m IN SELECT DISTINCT to_char(created_at, 'YYYY-MM') FROM public.sales
    LOOP
        PERFORM private.refresh_monthly_sales_summary(m);
    END LOOP;
END;
$$;

UPDATE public.monthly_sales_summary SET lost_deals = 0 WHERE lost_deals IS NULL;

ALTER TABLE public.monthly_sales_summary
    ALTER COLUMN lost_deals SET NOT NULL,
    ALTER COLUMN lost_deals SET DEFAULT 0;
