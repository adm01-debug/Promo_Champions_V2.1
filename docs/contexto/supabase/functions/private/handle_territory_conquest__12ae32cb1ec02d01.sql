CREATE OR REPLACE FUNCTION private.handle_territory_conquest()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_territory_id UUID;
    v_top_salesperson_id UUID;
    v_current_owner_id UUID;
BEGIN
    -- We assume the sale has a territory_id field (if not, we'd look it up via customer or region)
    -- For now, let's check if the sale has a territory context
    IF NEW.territory_id IS NULL THEN
        RETURN NEW;
    END IF;

    v_territory_id := NEW.territory_id;

    -- Update territory stats
    UPDATE public.territories 
    SET total_revenue = total_revenue + NEW.amount,
        total_deals = total_deals + 1,
        updated_at = now()
    WHERE id = v_territory_id
    RETURNING current_owner_id INTO v_current_owner_id;

    -- Find the salesperson with the highest total revenue in this territory
    SELECT salesperson_id INTO v_top_salesperson_id
    FROM (
        SELECT salesperson_id, SUM(amount) as revenue
        FROM public.sales
        WHERE territory_id = v_territory_id
          AND (status = 'won' OR status = 'completed')
        GROUP BY salesperson_id
        ORDER BY revenue DESC
        LIMIT 1
    ) sub;

    -- If a new owner is found
    IF v_top_salesperson_id IS NOT NULL AND (v_current_owner_id IS NULL OR v_top_salesperson_id != v_current_owner_id) THEN
        UPDATE public.territories 
        SET current_owner_id = v_top_salesperson_id,
            conquered_at = now()
        WHERE id = v_territory_id;

        -- Log history
        INSERT INTO public.territory_history (territory_id, salesperson_id, event_type, description)
        VALUES (v_territory_id, v_top_salesperson_id, 'conquest', 'Território conquistado por volume de vendas (Líder de Receita)');
    END IF;

    RETURN NEW;
END;
$function$
