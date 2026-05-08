-- Adicionar coluna month em race_scoring_rules se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'race_scoring_rules' AND column_name = 'month') THEN
        ALTER TABLE public.race_scoring_rules ADD COLUMN month DATE DEFAULT date_trunc('month', now())::date;
    END IF;
END $$;

-- Criar tabela de configurações de comissão por mês
CREATE TABLE IF NOT EXISTS public.salesperson_commission_configs (
    salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    rate NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (salesperson_id, month)
);

-- Habilitar RLS
ALTER TABLE public.salesperson_commission_configs ENABLE ROW LEVEL SECURITY;

-- Políticas para comissões (Simplificadas para evitar erro de tabela inexistente)
CREATE POLICY "Ver comissões" ON public.salesperson_commission_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gerenciar comissões" ON public.salesperson_commission_configs FOR ALL TO authenticated USING (true);

-- Criar tabela de solicitações de aprovação comercial
CREATE TABLE IF NOT EXISTS public.commercial_approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('goal', 'scoring_rule', 'commission')),
    entity_id UUID, -- id do vendedor ou da regra
    competence_month DATE NOT NULL,
    new_values JSONB NOT NULL,
    old_values JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approver_id UUID REFERENCES auth.users(id),
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.commercial_approval_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para aprovações
CREATE POLICY "Ver solicitações" ON public.commercial_approval_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Criar solicitações" ON public.commercial_approval_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Gerenciar solicitações" ON public.commercial_approval_requests FOR UPDATE TO authenticated USING (true);

-- Trigger para updated_at (caso não exista)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_commissions_updated_at') THEN
        CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.salesperson_commission_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_commercial_approvals_updated_at') THEN
        CREATE TRIGGER update_commercial_approvals_updated_at BEFORE UPDATE ON public.commercial_approval_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
