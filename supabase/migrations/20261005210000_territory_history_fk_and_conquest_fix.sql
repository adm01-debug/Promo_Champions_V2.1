-- Corrige bug dormente de 2026-05 em private.update_territory_conquests:
--
-- 1) territory_history.territory_id tem FK para public.sales_territories,
--    mas a função insere id de public.territories (tabela do domínio de
--    conquistas por produto/categoria que ela mesma faz upsert). Se o
--    INSERT disparasse, abortaria com 23503 — e abortaria a venda inteira
--    junto (mesma classe de bug do trg_refresh_ranking). Como o histórico
--    é do domínio de conquistas, a FK correta é public.territories.
--
-- 2) O guard de conquista é código morto: o EXISTS roda DEPOIS do upsert,
--    quando current_owner_id já é o top_owner — nunca é verdade. Por isso
--    territory_history tem 0 linhas desde a criação. Agora o dono anterior
--    é lido ANTES do upsert.

ALTER TABLE public.territory_history
  DROP CONSTRAINT IF EXISTS territory_history_territory_id_fkey;

ALTER TABLE public.territory_history
  ADD CONSTRAINT territory_history_territory_id_fkey
  FOREIGN KEY (territory_id) REFERENCES public.territories(id) ON DELETE CASCADE;

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
    old_owner_id UUID;
    v_territory_id UUID;
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

        -- Dono anterior lido ANTES do upsert: é o que define conquista real.
        SELECT current_owner_id INTO old_owner_id
        FROM public.territories WHERE name = territory_rec.t_name;

        INSERT INTO public.territories (name, current_owner_id, total_revenue, total_deals, conquered_at)
        VALUES (territory_rec.t_name, top_owner_id, total_revenue_val, total_deals_val, now())
        ON CONFLICT (name) DO UPDATE
        SET current_owner_id = COALESCE(EXCLUDED.current_owner_id, territories.current_owner_id),
            total_revenue = EXCLUDED.total_revenue,
            total_deals = EXCLUDED.total_deals,
            conquered_at = CASE WHEN territories.current_owner_id IS NULL OR territories.current_owner_id <> EXCLUDED.current_owner_id THEN now() ELSE territories.conquered_at END,
            updated_at = now();

        IF top_owner_id IS NOT NULL
           AND (old_owner_id IS NULL OR old_owner_id <> top_owner_id) THEN
             SELECT id INTO v_territory_id
             FROM public.territories WHERE name = territory_rec.t_name;

             -- A conquista anterior do dono destronado passa a constar
             -- como perdida (lost_at preenchido na troca de dono).
             UPDATE public.territory_history
                SET lost_at = now()
              WHERE territory_id = v_territory_id
                AND lost_at IS NULL;

             INSERT INTO public.territory_history (territory_id, salesperson_id, revenue_contribution, deals_count, conquered_at)
             VALUES (v_territory_id, top_owner_id, top_revenue, total_deals_val, now());
        END IF;
    END LOOP;
END;
$function$;
