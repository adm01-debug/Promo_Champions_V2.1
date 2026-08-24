-- Create ICP parameters table
CREATE TABLE IF NOT EXISTS public.icp_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_industries TEXT[] DEFAULT '{}',
    min_capital NUMERIC DEFAULT 0,
    min_employees INTEGER DEFAULT 0,
    preferred_niches TEXT[] DEFAULT '{}',
    weight_industry INTEGER DEFAULT 30,
    weight_capital INTEGER DEFAULT 20,
    weight_employees INTEGER DEFAULT 20,
    weight_niche INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for parameters
ALTER TABLE public.icp_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage ICP parameters"
ON public.icp_parameters FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add score column to icp_data if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'icp_data' AND COLUMN_NAME = 'icp_score') THEN
        ALTER TABLE public.icp_data ADD COLUMN icp_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create function to calculate ICP score
CREATE OR REPLACE FUNCTION public.fn_calculate_icp_score()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for icp_data
DROP TRIGGER IF EXISTS trig_update_icp_score ON public.icp_data;
CREATE TRIGGER trig_update_icp_score
BEFORE INSERT OR UPDATE ON public.icp_data
FOR EACH ROW
EXECUTE FUNCTION public.fn_calculate_icp_score();

-- Seed initial parameters if none exist
INSERT INTO public.icp_parameters (target_industries, min_capital, min_employees, preferred_niches)
SELECT ARRAY['Tecnologia', 'Indústria', 'Varejo'], 500000, 50, ARRAY['Software', 'Automação', 'Logística']
WHERE NOT EXISTS (SELECT 1 FROM public.icp_parameters);
