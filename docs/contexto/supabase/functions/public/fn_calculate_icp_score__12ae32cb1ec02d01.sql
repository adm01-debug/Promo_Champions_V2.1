CREATE OR REPLACE FUNCTION public.fn_calculate_icp_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_params RECORD;
    v_score INTEGER := 0;
    v_match BOOLEAN := FALSE;
BEGIN
    -- Get the most recent parameters (or default)
    SELECT * INTO v_params FROM public.icp_parameters ORDER BY created_at DESC LIMIT 1;
    
    IF v_params IS NULL THEN
        -- Default weights if no parameters exist
        v_params := (SELECT NULL::public.icp_parameters);
        v_params.target_industries := '{}';
        v_params.preferred_niches := '{}';
        v_params.min_capital := 0;
        v_params.min_employees := 0;
        v_params.weight_industry := 30;
        v_params.weight_capital := 20;
        v_params.weight_employees := 20;
        v_params.weight_niche := 30;
    END IF;

    -- 1. Industry Fit (Weight 30)
    IF NEW.ramo_atividade IS NOT NULL AND NEW.ramo_atividade = ANY(v_params.target_industries) THEN
        v_score := v_score + v_params.weight_industry;
    END IF;

    -- 2. Capital Fit (Weight 20)
    IF NEW.capital_social >= v_params.min_capital THEN
        v_score := v_score + v_params.weight_capital;
    END IF;

    -- 3. Employees Fit (Weight 20)
    IF NEW.num_colaboradores >= v_params.min_employees THEN
        v_score := v_score + v_params.weight_employees;
    END IF;

    -- 4. Niche Fit (Weight 30)
    IF NEW.grupo_nicho IS NOT NULL AND NEW.grupo_nicho = ANY(v_params.preferred_niches) THEN
        v_score := v_score + v_params.weight_niche;
    END IF;

    -- Set match if score >= 70 (or other threshold)
    IF v_score >= 70 THEN
        v_match := TRUE;
    END IF;

    NEW.icp_score := v_score;
    NEW.is_icp_match := v_match;
    NEW.updated_at := now();

    RETURN NEW;
END;
$function$
