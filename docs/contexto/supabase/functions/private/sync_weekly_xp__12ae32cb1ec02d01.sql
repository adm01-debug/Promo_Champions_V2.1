CREATE OR REPLACE FUNCTION private.sync_weekly_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.league_members (salesperson_id, weekly_xp, updated_at)
    VALUES (NEW.salesperson_id, NEW.xp_amount, now())
    ON CONFLICT (salesperson_id) 
    DO UPDATE SET 
        weekly_xp = league_members.weekly_xp + NEW.xp_amount,
        updated_at = now();
    RETURN NEW;
END;
$function$
