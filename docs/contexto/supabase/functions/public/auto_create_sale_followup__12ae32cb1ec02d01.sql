CREATE OR REPLACE FUNCTION public.auto_create_sale_followup()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed')) THEN
        INSERT INTO public.agenda_events (
            title, 
            description, 
            event_type, 
            status, 
            priority, 
            scheduled_at, 
            client_id, 
            sale_id, 
            salesperson_id
        ) VALUES (
            'Follow-up Pós-Venda: ' || NEW.product_name,
            'Verificar satisfação do cliente com a compra de ' || NEW.product_name,
            'follow_up',
            'pending',
            'medium',
            now() + interval '7 days',
            NEW.client_id,
            NEW.id,
            NEW.salesperson_id
        );
    END IF;
    RETURN NEW;
END;
$function$
