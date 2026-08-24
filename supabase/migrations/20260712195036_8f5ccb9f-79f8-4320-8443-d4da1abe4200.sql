
CREATE OR REPLACE FUNCTION private.auto_victory_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_TABLE_NAME = 'sales' AND NEW.deal_status = 'completed' AND (OLD.deal_status IS DISTINCT FROM NEW.deal_status) AND NEW.amount >= 5000 THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, value, event_type)
        VALUES (
            NEW.salesperson_id,
            'Fechamento Épico! 🚀',
            'Selou um deal de ' || COALESCE(NEW.product_name, 'Produto') || ' para ' || COALESCE(NEW.client_name, 'Cliente'),
            NEW.amount,
            'sale'
        );
        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.salesperson_id, 1, now())
        ON CONFLICT (salesperson_id)
        DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
    END IF;

    IF TG_TABLE_NAME = 'sales_battles' AND NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.winner_id IS NOT NULL THEN
        INSERT INTO public.victory_feed (salesperson_id, title, description, event_type)
        VALUES (
            NEW.winner_id,
            'Campeão da Arena! 🏆',
            'Venceu a batalha: ' || NEW.title,
            'achievement'
        );
        INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
        VALUES (NEW.winner_id, COALESCE(NEW.xp_reward, 100), 'battle', NEW.id, 'Vitória na Batalha: ' || NEW.title);
        INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
        VALUES (NEW.winner_id, 2, now())
        ON CONFLICT (salesperson_id)
        DO UPDATE SET spins_count = available_spins.spins_count + 2, updated_at = now();
    END IF;

    RETURN NEW;
END;
$function$;
