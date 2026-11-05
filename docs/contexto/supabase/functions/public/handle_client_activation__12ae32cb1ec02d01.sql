CREATE OR REPLACE FUNCTION public.handle_client_activation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- If the sale is completed and it's the first sale
    IF (NEW.status = 'completed' AND NEW.is_first_sale = true) THEN
        UPDATE public.clients
        SET 
            is_activated = true,
            activated_at = COALESCE(activated_at, now()),
            updated_at = now()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$function$
