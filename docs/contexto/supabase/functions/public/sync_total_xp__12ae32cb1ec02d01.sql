CREATE OR REPLACE FUNCTION public.sync_total_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.salesperson_xp (salesperson_id, total_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        total_xp = salesperson_xp.total_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$function$
