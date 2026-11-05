CREATE OR REPLACE FUNCTION public.handle_client_ltv_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR 
       (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status <> 'completed') THEN
        UPDATE public.clients 
        SET total_value = COALESCE(total_value, 0) + NEW.amount,
            updated_at = now()
        WHERE id = NEW.client_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status <> 'completed') OR
          (TG_OP = 'DELETE' AND OLD.status = 'completed') THEN
        UPDATE public.clients 
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount),
            updated_at = now()
        WHERE id = OLD.client_id;
    END IF;
    RETURN NULL;
END;
$function$
