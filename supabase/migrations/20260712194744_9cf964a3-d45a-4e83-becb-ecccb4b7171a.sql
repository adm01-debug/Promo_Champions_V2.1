
CREATE OR REPLACE FUNCTION public.maintain_sales_streaks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_last_activity TIMESTAMP;
    v_current_streak INTEGER;
BEGIN
    SELECT last_sale_date, current_streak INTO v_last_activity, v_current_streak
    FROM public.sales_streaks
    WHERE salesperson_id = NEW.salesperson_id;

    IF NOT FOUND THEN
        INSERT INTO public.sales_streaks (salesperson_id, current_streak, last_sale_date)
        VALUES (NEW.salesperson_id, 1, now());
    ELSE
        IF v_last_activity::date = (now() - INTERVAL '1 day')::date THEN
            UPDATE public.sales_streaks
            SET current_streak = current_streak + 1,
                last_sale_date = now(),
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE salesperson_id = NEW.salesperson_id;

            IF (v_current_streak + 1) % 7 = 0 THEN
                INSERT INTO public.available_spins (salesperson_id, spins_count, updated_at)
                VALUES (NEW.salesperson_id, 1, now())
                ON CONFLICT (salesperson_id)
                DO UPDATE SET spins_count = available_spins.spins_count + 1, updated_at = now();
            END IF;
        ELSIF v_last_activity::date = now()::date THEN
            UPDATE public.sales_streaks
            SET last_sale_date = now()
            WHERE salesperson_id = NEW.salesperson_id;
        ELSE
            UPDATE public.sales_streaks
            SET current_streak = 1,
                last_sale_date = now()
            WHERE salesperson_id = NEW.salesperson_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;
