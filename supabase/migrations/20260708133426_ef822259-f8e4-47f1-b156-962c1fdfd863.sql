CREATE OR REPLACE FUNCTION public.sync_territory_ownership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_territory_name TEXT;
  v_territory_id UUID;
  v_current_owner UUID;
  v_new_owner UUID;
  v_total_rev NUMERIC;
  v_total_deals INTEGER;
BEGIN
  BEGIN
    v_territory_name := COALESCE(NEW.product_name, NEW.category, 'Outros');

    INSERT INTO public.territories (name) VALUES (v_territory_name)
    ON CONFLICT (name) DO NOTHING;

    SELECT salesperson_id, SUM(amount), COUNT(*)
      INTO v_new_owner, v_total_rev, v_total_deals
      FROM public.sales
     WHERE (product_name = v_territory_name OR (product_name IS NULL AND category = v_territory_name))
       AND deal_status = 'completed'
     GROUP BY salesperson_id
     ORDER BY SUM(amount) DESC LIMIT 1;

    SELECT current_owner_id INTO v_current_owner
      FROM public.territories WHERE name = v_territory_name;

    -- territory_history.territory_id referencia sales_territories(id) — resolver antes.
    SELECT id INTO v_territory_id
      FROM public.sales_territories WHERE name = v_territory_name LIMIT 1;

    IF v_new_owner IS DISTINCT FROM v_current_owner THEN
      IF v_current_owner IS NOT NULL AND v_territory_id IS NOT NULL THEN
        UPDATE public.territory_history
           SET lost_at = NOW()
         WHERE salesperson_id = v_current_owner AND lost_at IS NULL
           AND territory_id = v_territory_id;
      END IF;

      IF v_territory_id IS NOT NULL AND v_new_owner IS NOT NULL THEN
        INSERT INTO public.territory_history
          (territory_id, salesperson_id, revenue_contribution, deals_count, conquered_at)
        VALUES (v_territory_id, v_new_owner, v_total_rev, v_total_deals, NOW());
      END IF;

      UPDATE public.territories
         SET current_owner_id = v_new_owner,
             total_revenue = v_total_rev, total_deals = v_total_deals,
             conquered_at = NOW(), updated_at = NOW()
       WHERE name = v_territory_name;

      IF v_new_owner IS NOT NULL THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, type, metadata)
        VALUES (v_new_owner, 'Território Conquistado: '||v_territory_name,
                'Dominou o segmento com R$ '||v_total_rev::TEXT, 'territory',
                jsonb_build_object('territory',v_territory_name,'revenue',v_total_rev));
      END IF;
    ELSE
      UPDATE public.territories
         SET total_revenue = v_total_rev, total_deals = v_total_deals, updated_at = NOW()
       WHERE name = v_territory_name;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Nunca bloquear uma venda por causa do sync de território
    NULL;
  END;
  RETURN NEW;
END;
$function$;