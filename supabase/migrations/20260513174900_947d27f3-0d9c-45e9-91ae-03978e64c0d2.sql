-- Tabela de Planos de Conta Estratégicos
CREATE TABLE IF NOT EXISTS public.account_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    fiscal_year TEXT,
    revenue_target NUMERIC(15,2),
    
    -- Objetivos e Desafios
    executive_summary TEXT,
    key_objectives TEXT[], -- Array de objetivos
    main_challenges TEXT[],
    
    -- Análise SWOT
    swot_strengths TEXT[],
    swot_weaknesses TEXT[],
    swot_opportunities TEXT[],
    swot_threats TEXT[],
    
    -- Estratégia
    account_strategy TEXT,
    action_plan JSONB, -- Lista de ações com datas e responsáveis
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.account_plans ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Account plans are viewable by authenticated users" 
ON public.account_plans FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert account plans" 
ON public.account_plans FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update account plans" 
ON public.account_plans FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE TRIGGER update_account_plans_updated_at
BEFORE UPDATE ON public.account_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Garantir que parent_account_id exista na tabela accounts (já deve existir baseado no hook, mas reforçando)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='parent_account_id') THEN
        ALTER TABLE public.accounts ADD COLUMN parent_account_id UUID REFERENCES public.accounts(id);
    END IF;
END $$;
