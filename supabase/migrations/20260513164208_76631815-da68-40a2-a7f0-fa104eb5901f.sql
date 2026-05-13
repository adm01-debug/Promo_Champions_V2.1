-- Tabela de Inteligência de Empresas
CREATE TABLE IF NOT EXISTS public.enriched_company_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL UNIQUE,
    domain TEXT,
    headcount_range TEXT,
    estimated_annual_revenue TEXT,
    funding_stage TEXT,
    total_funding TEXT,
    tech_stack TEXT[],
    industry TEXT,
    hq_location TEXT,
    linkedin_url TEXT,
    last_enriched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Sinais de Intenção/Compra
CREATE TABLE IF NOT EXISTS public.buying_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.enriched_company_intelligence(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL, -- 'hiring', 'funding', 'news', 'tech_change', 'expansion'
    signal_description TEXT,
    source_url TEXT,
    significance_score INTEGER CHECK (significance_score BETWEEN 1 AND 100),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Inteligência de Pessoas (Contatos/Leads)
CREATE TABLE IF NOT EXISTS public.person_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    current_title TEXT,
    previous_titles JSONB,
    linkedin_url TEXT,
    job_change_detected_at TIMESTAMP WITH TIME ZONE,
    promotion_detected_at TIMESTAMP WITH TIME ZONE,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Logs de Visitantes do Website (De-anonymization)
CREATE TABLE IF NOT EXISTS public.website_visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    company_name TEXT,
    domain TEXT,
    page_viewed TEXT,
    referrer TEXT,
    duration_seconds INTEGER,
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar colunas de validação na tabela de clients se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clients' AND COLUMN_NAME = 'email_verified') THEN
        ALTER TABLE public.clients ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clients' AND COLUMN_NAME = 'phone_verified') THEN
        ALTER TABLE public.clients ADD COLUMN phone_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'clients' AND COLUMN_NAME = 'last_enrichment_id') THEN
        ALTER TABLE public.clients ADD COLUMN last_enrichment_id UUID;
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.enriched_company_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buying_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_visitor_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (Admin e Manager podem ver tudo)
CREATE POLICY "Admins e Managers podem ver inteligência de empresas" ON public.enriched_company_intelligence
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admins e Managers podem ver sinais de compra" ON public.buying_signals
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admins e Managers podem ver inteligência de pessoas" ON public.person_intelligence
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "Admins e Managers podem ver logs de visitantes" ON public.website_visitor_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')));

-- Triggers para timestamps
CREATE TRIGGER update_enriched_company_intelligence_updated_at BEFORE UPDATE ON public.enriched_company_intelligence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_person_intelligence_updated_at BEFORE UPDATE ON public.person_intelligence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();