-- maintain_sales_streaks() (trigger tr_maintain_streaks, AFTER INSERT ON
-- public.activities — fires on every single activity insert, no guard)
-- referenced sales_streaks.last_activity_at, a column that does not exist;
-- the real column is last_sale_date (date, not timestamp). This meant every
-- activity insert in the whole app has been failing at the DB level.
-- Also disabled the 7-day-streak reward write to salespeople.available_spins,
-- which does not exist either (same gap as auto_victory_post(), see
-- 20260814190000_fix_broken_sales_triggers.sql).

CREATE OR REPLACE FUNCTION public.maintain_sales_streaks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
BEGIN
    SELECT last_sale_date, current_streak INTO v_last_date, v_current_streak
    FROM public.sales_streaks
    WHERE salesperson_id = NEW.salesperson_id;

    IF NOT FOUND THEN
        INSERT INTO public.sales_streaks (salesperson_id, current_streak, longest_streak, last_sale_date)
        VALUES (NEW.salesperson_id, 1, 1, CURRENT_DATE);
    ELSE
        IF v_last_date = CURRENT_DATE - 1 THEN
            UPDATE public.sales_streaks
            SET current_streak = current_streak + 1,
                last_sale_date = CURRENT_DATE,
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE salesperson_id = NEW.salesperson_id;
            -- NOTE: salespeople.available_spins does not exist in this schema;
            -- the 7-day-streak spin reward is disabled here until that reward
            -- mechanism is (re)wired to an actual column/table.
        ELSIF v_last_date = CURRENT_DATE THEN
            NULL; -- already logged today, nothing to change
        ELSE
            UPDATE public.sales_streaks
            SET current_streak = 1,
                last_sale_date = CURRENT_DATE
            WHERE salesperson_id = NEW.salesperson_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;
