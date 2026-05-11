-- 1. Configuração de Scorecards de Coaching
CREATE TABLE IF NOT EXISTS public.coaching_scorecard_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_name TEXT NOT NULL, -- Ex: 'Rapport', 'Qualificação', 'Fechamento'
    weight INTEGER DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Gatilhos de Inteligência Conversacional
CREATE TABLE IF NOT EXISTS public.call_intelligence_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_keyword TEXT NOT NULL, -- Ex: 'caro', 'concorrente x', 'prazo'
    action_type TEXT DEFAULT 'battlecard', -- 'battlecard', 'playbook', 'alert'
    target_asset_id UUID REFERENCES sales_enablement_assets(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Extensão de Transcripts para IA em Tempo Real
ALTER TABLE public.call_transcripts 
ADD COLUMN IF NOT EXISTS ai_live_insights JSONB DEFAULT '[]'::jsonb;

-- Populate basic scorecard dimensions
INSERT INTO public.coaching_scorecard_config (dimension_name, weight, description) VALUES
('Abertura & Rapport', 1, 'Capacidade de gerar conexão inicial'),
('Qualificação (BANT)', 2, 'Identificação de Budget, Authority, Need e Timeline'),
('Contorno de Objeções', 3, 'Resposta técnica e emocional às barreiras do cliente'),
('Call to Action / Próximos Passos', 2, 'Clareza no fechamento do compromisso');

-- Enable RLS
ALTER TABLE public.coaching_scorecard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_intelligence_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated users" ON public.coaching_scorecard_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.call_intelligence_triggers FOR SELECT USING (auth.role() = 'authenticated');
