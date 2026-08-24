-- Fix three broken trigger functions on public.sales that were causing every
-- UPDATE on certain rows to fail with runtime errors:
--
-- 1) sync_battle_score(): compared the `deal_status` enum column to the
--    literal 'won', which is not a valid deal_status label
--    (pending|qualified|proposal|negotiation|completed|lost). Fired for any
--    sales row belonging to an active battle participant.
--    -> invalid input value for enum deal_status: "won"
--    Also wrote to battle_participants.updated_at, a column that doesn't
--    exist on that table.
--
-- 2) fn_notify_victory(): a single flat boolean expression referenced
--    NEW.winner_id even when invoked for the `sales` table (which has no
--    winner_id column). PL/pgSQL must resolve every NEW.field reference in a
--    boolean expression before it can be evaluated, so the TG_TABLE_NAME
--    guard did not short-circuit it away.
--    -> record "new" has no field "winner_id"
--    Fixed by splitting into per-table IF/ELSIF blocks so the winner_id
--    reference is only compiled when actually invoked for sales_battles.
--
-- 3) auto_victory_post(): same NEW.winner_id compile issue as (2), the same
--    invalid 'won' deal_status comparison as (1), and writes to
--    salespeople.available_spins / salespeople.xp, neither of which exists
--    on that table (that reward mechanism was never wired up — disabled
--    here rather than guessed at; victory_feed notifications still fire).

CREATE OR REPLACE FUNCTION public.sync_battle_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_battle_id UUID;
    v_metric TEXT;
    v_score NUMERIC;
BEGIN
    FOR v_battle_id, v_metric IN
        SELECT b.id, b.metric
        FROM public.sales_battles b
        JOIN public.battle_participants p ON p.battle_id = b.id
        WHERE b.status = 'active'
        AND p.salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND (b.starts_at <= NOW() AND b.ends_at >= NOW())
    LOOP
        IF v_metric = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND (status = 'won' OR status = 'completed')
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'deals' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND (status = 'won' OR status = 'completed')
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'calls' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'call'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'meetings' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'meeting'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
        END IF;

        UPDATE public.battle_participants
        SET current_score = v_score
        WHERE battle_id = v_battle_id
        AND salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id);
    END LOOP;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_notify_victory()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_salesperson_name TEXT;
BEGIN
    IF TG_TABLE_NAME = 'sales' THEN
        IF NEW.deal_status = 'completed' AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed') THEN
            SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.salesperson_id;

            INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, value, metadata)
            VALUES (
                NEW.salesperson_id,
                'sale',
                'Venda Fechada! 💰',
                v_salesperson_name || ' acabou de fechar um negócio de ' || to_char(NEW.amount, 'L999G999G999D99'),
                NEW.amount,
                jsonb_build_object('sale_id', NEW.id)
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'sales_battles' THEN
        IF NEW.status = 'completed' AND OLD.status = 'active' AND NEW.winner_id IS NOT NULL THEN
            SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.winner_id;

            INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, metadata)
            VALUES (
                NEW.winner_id,
                'achievement',
                'Campeão da Arena! 🏆',
                v_salesperson_name || ' venceu a batalha: ' || NEW.title,
                jsonb_build_object('battle_id', NEW.id)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_victory_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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
$function$;
