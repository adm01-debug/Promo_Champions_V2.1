-- Fix real de produção: private.update_territory_conquests() insere em
-- territory_history com top_owner_id NULL quando o território só tem vendas
-- sem salesperson_id (ex.: seeds E2E / vendas sem vendedor vinculado),
-- abortando o INSERT da sale inteira com 23502. Guard adicionado:
-- só registra histórico e atribui dono quando top_owner_id IS NOT NULL.

CREATE OR REPLACE FUNCTION private.update_territory_conquests()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    territory_rec RECORD;
    top_owner_id UUID;
    top_revenue NUMERIC;
    total_deals_val INTEGER;
    total_revenue_val NUMERIC;
BEGIN
    FOR territory_rec IN
        SELECT DISTINCT COALESCE(product_name, category, 'Outros') as t_name FROM public.sales WHERE status IN ('won', 'completed')
    LOOP
        SELECT salesperson_id, SUM(amount) INTO top_owner_id, top_revenue
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed')
          AND salesperson_id IS NOT NULL
        GROUP BY salesperson_id
        ORDER BY 2 DESC
        LIMIT 1;

        SELECT SUM(amount), COUNT(*) INTO total_revenue_val, total_deals_val
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed');

        INSERT INTO public.territories (name, current_owner_id, total_revenue, total_deals, conquered_at)
        VALUES (territory_rec.t_name, top_owner_id, total_revenue_val, total_deals_val, now())
        ON CONFLICT (name) DO UPDATE
        SET current_owner_id = COALESCE(EXCLUDED.current_owner_id, territories.current_owner_id),
            total_revenue = EXCLUDED.total_revenue,
            total_deals = EXCLUDED.total_deals,
            conquered_at = CASE WHEN territories.current_owner_id IS NULL OR territories.current_owner_id <> EXCLUDED.current_owner_id THEN now() ELSE territories.conquered_at END,
            updated_at = now();

        IF top_owner_id IS NOT NULL
           AND EXISTS (SELECT 1 FROM public.territories t WHERE t.name = territory_rec.t_name AND (t.current_owner_id IS NULL OR t.current_owner_id <> top_owner_id)) THEN
             INSERT INTO public.territory_history (territory_id, salesperson_id, revenue_contribution, deals_count, conquered_at)
             SELECT id, top_owner_id, top_revenue, total_deals_val, now()
             FROM public.territories WHERE name = territory_rec.t_name;
        END IF;
    END LOOP;
END;
$function$;
