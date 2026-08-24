-- Tabela para auditoria de gatilhos de intenção
CREATE TABLE public.intent_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID,
    event_type TEXT NOT NULL, -- 'proposal_opened', 'price_clicked'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.intent_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura para todos autenticados" ON public.intent_audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserção pelo sistema" ON public.intent_audit_logs FOR INSERT WITH CHECK (true);

-- Melhorias em cadence_steps para templates e aprovação
ALTER TABLE public.cadence_steps 
ADD COLUMN needs_approval BOOLEAN DEFAULT false,
ADD COLUMN singu_variables JSONB DEFAULT '[]'::jsonb;

-- Regras de contato em preferências do vendedor
ALTER TABLE public.salesperson_preferences 
ADD COLUMN contact_rules JSONB DEFAULT '{
    "quiet_hours": {"start": "20:00", "end": "08:00"},
    "max_calls_per_day": 3,
    "prioritize_human": true
}'::jsonb;

-- Extensão de métricas para cadências (se a tabela de métricas já existir ou via colunas extras)
-- Como estamos usando RPC get_cadence_metrics, vamos garantir que ela possa retornar esses dados no futuro.
-- Por enquanto, vamos criar uma tabela para persistir snapshots dessas métricas avançadas.
CREATE TABLE public.cadence_advanced_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cadence_id UUID REFERENCES public.cadences(id) ON DELETE CASCADE,
    click_rate DECIMAL DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.cadence_advanced_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública autenticada para stats" ON public.cadence_advanced_stats FOR SELECT USING (auth.role() = 'authenticated');
