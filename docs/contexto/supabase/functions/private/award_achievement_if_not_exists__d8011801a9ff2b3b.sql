CREATE OR REPLACE FUNCTION private.award_achievement_if_not_exists(p_salesperson_id uuid, p_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_achievement_id UUID;
BEGIN
    -- Verificar se já tem a conquista
    IF NOT EXISTS (SELECT 1 FROM public.achievements WHERE salesperson_id = p_salesperson_id AND achievement_type = p_type) THEN
        INSERT INTO public.achievements (salesperson_id, achievement_type)
        VALUES (p_salesperson_id, p_type);
    END IF;
END;
$function$
