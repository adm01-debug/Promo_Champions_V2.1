CREATE OR REPLACE FUNCTION private.log_order_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.order_status_events (order_id, status, description)
  VALUES (NEW.id, NEW.status, 'Pedido criado');
  RETURN NEW;
END;
$function$
