CREATE OR REPLACE FUNCTION public.auto_victory_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_TABLE_NAME = 'sales' THEN
        IF NEW.deal_status = 'completed' AND NEW.amount >= 5000 THEN
            INSERT INTO public.victory_feed (salesperson_id, title, description, value, event_type)
            VALUES (
                NEW.salesperson_id,
                'Fechamento Épico! 🚀',
                'Selou um deal de ' || NEW.product_name || ' para ' || NEW.client_name,
                NEW.amount,
                'sale'
            );
            -- NOTE: salespeople.available_spins does not exist in this schema;
            -- prize-wheel-spin reward is disabled here until that reward
            -- mechanism is (re)wired to an actual column/table.
        END IF;
    ELSIF TG_TABLE_NAME = 'sales_battles' THEN
        IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL THEN
            INSERT INTO public.victory_feed (salesperson_id, title, description, event_type)
            VALUES (
                NEW.winner_id,
                'Campeão da Arena! 🏆',
                'Venceu a batalha: ' || NEW.title,
                'achievement'
            );
            -- NOTE: salespeople.xp / available_spins do not exist in this schema;
            -- XP + spin reward is disabled here until that reward mechanism is
            -- (re)wired to an actual column/table (e.g. xp_transactions, as
            -- private.handle_performance_update already does for bets).
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
