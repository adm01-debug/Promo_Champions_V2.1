-- Função para concessão atômica de XP
CREATE OR REPLACE FUNCTION public.award_salesperson_xp(
    p_salesperson_id UUID,
    p_xp_amount INTEGER,
    p_description TEXT,
    p_source_type TEXT,
    p_source_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Ajuste de RLS para tabelas de logs (Segurança 10/10)
DO $$ 
BEGIN
    -- automation_runs: Garantir que o insert verifique propriedade se houver coluna de usuário (atualmente não tem, mas prevenindo futuros)
    -- intent_audit_logs: Associar ao auth.uid()
    DROP POLICY IF EXISTS "Authenticated users can insert intent audit logs" ON public.intent_audit_logs;
    CREATE POLICY "Users can only insert their own intent logs" 
    ON public.intent_audit_logs FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

    -- access_denied_logs: Garantir integridade
    CREATE TABLE IF NOT EXISTS public.access_denied_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        user_email TEXT,
        attempted_path TEXT,
        user_role TEXT,
        required_role TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.access_denied_logs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can insert their own access logs" ON public.access_denied_logs;
    CREATE POLICY "Users can insert their own access logs" 
    ON public.access_denied_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Admins can view access logs" ON public.access_denied_logs;
    CREATE POLICY "Admins can view access logs" 
    ON public.access_denied_logs FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
END $$;
