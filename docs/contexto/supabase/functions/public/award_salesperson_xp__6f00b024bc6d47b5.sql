CREATE OR REPLACE FUNCTION public.award_salesperson_xp(p_salesperson_id uuid, p_xp_amount integer, p_description text, p_source_type text, p_source_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_old_xp INTEGER;
    v_new_xp INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_xp_step INTEGER := 1000; -- Exemplo de escala de nível
    v_result JSONB;
BEGIN
    -- Bloqueia a linha para atualização atômica
    INSERT INTO public.salesperson_xp (salesperson_id, total_xp, current_level, updated_at)
    VALUES (p_salesperson_id, p_xp_amount, 1, now())
    ON CONFLICT (salesperson_id) DO UPDATE
    SET total_xp = salesperson_xp.total_xp + EXCLUDED.total_xp,
        updated_at = now()
    RETURNING total_xp, current_level INTO v_new_xp, v_old_level;

    -- Cálculo simples de nível (pode ser ajustado conforme useSalespersonXP.ts)
    v_new_level := floor(v_new_xp / v_xp_step) + 1;
    
    IF v_new_level > v_old_level THEN
        UPDATE public.salesperson_xp 
        SET current_level = v_new_level
        WHERE salesperson_id = p_salesperson_id;
    END IF;

    -- Registrar no histórico
    INSERT INTO public.xp_history (salesperson_id, xp_amount, source_type, source_id, description)
    VALUES (p_salesperson_id, p_xp_amount, p_source_type, p_source_id, p_description);

    SELECT jsonb_build_object(
        'leveled_up', v_new_level > v_old_level,
        'new_level', v_new_level,
        'total_xp', v_new_xp
    ) INTO v_result;

    RETURN v_result;
END;
$function$
