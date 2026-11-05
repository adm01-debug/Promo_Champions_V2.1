CREATE OR REPLACE FUNCTION public.set_sdr_id_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.sdr_id IS NULL THEN
        SELECT id INTO NEW.sdr_id 
        FROM salespeople 
        WHERE auth_user_id = auth.uid() AND role IN ('sdr', 'hybrid');
    END IF;
    RETURN NEW;
END;
$function$
