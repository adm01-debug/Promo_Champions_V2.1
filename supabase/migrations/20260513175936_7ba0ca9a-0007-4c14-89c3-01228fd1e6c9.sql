-- Suporte a Tickets/Tickets de Suporte (Integração)
CREATE TABLE IF NOT EXISTS public.cs_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    external_id TEXT, -- ID do Zendesk/Intercom/etc
    source TEXT DEFAULT 'internal', -- zendesk, intercom, internal
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open', -- open, pending, resolved, closed
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Gestão de Renovações (Renewal Management)
CREATE TABLE IF NOT EXISTS public.client_renewals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    contract_end_date DATE NOT NULL,
    renewal_value NUMERIC(15,2),
    status TEXT DEFAULT 'pending', -- pending, won, lost, canceled
    probability INTEGER DEFAULT 70, -- 0-100
    risk_level TEXT DEFAULT 'low', -- low, medium, high
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tracking de Uso de Produto (Product Usage Data)
CREATE TABLE IF NOT EXISTS public.product_usage (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    period_start DATE,
    period_end DATE
);

-- Expansão de Pesquisas (NPS -> CSAT/CES)
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS survey_type TEXT DEFAULT 'nps'; -- nps, csat, ces
ALTER TABLE public.nps_surveys ADD COLUMN IF NOT EXISTS score_ces INTEGER; -- Customer Effort Score (1-7)

-- Enable RLS
ALTER TABLE public.cs_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_usage ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "CS data is viewable by authenticated users" 
ON public.cs_tickets FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "CS renewals are viewable by authenticated users" 
ON public.client_renewals FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Product usage is viewable by authenticated users" 
ON public.product_usage FOR SELECT USING (auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER update_cs_tickets_updated_at BEFORE UPDATE ON public.cs_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_renewals_updated_at BEFORE UPDATE ON public.client_renewals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
