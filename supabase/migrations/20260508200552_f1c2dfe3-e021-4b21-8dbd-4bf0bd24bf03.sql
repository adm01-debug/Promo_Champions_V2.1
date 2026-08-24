CREATE TABLE IF NOT EXISTS public.duplicate_block_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    entity_name TEXT NOT NULL,
    block_type TEXT NOT NULL,
    status TEXT DEFAULT 'Blocked' NOT NULL,
    auditor TEXT DEFAULT 'System IA' NOT NULL,
    confidence_score FLOAT8 DEFAULT 1.0 NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.duplicate_block_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view duplicate block logs"
    ON public.duplicate_block_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert some initial sample data for the user to see the report working
INSERT INTO public.duplicate_block_logs (entity_name, block_type, status, confidence_score, details)
VALUES 
    ('Lead: João Silva', 'Duplicidade de Email', 'Blocked', 0.998, '{"email": "joao@exemplo.com"}'),
    ('Cliente: Alpha Corp', 'Duplicidade de CNPJ', 'Blocked', 1.0, '{"cnpj": "12.345.678/0001-90"}'),
    ('Lead: Maria Souza', 'Fuzzy Name Match', 'Reviewing', 0.875, '{"match_score": 0.875}'),
    ('Lead: Roberto Costa', 'Duplicidade de Telefone', 'Blocked', 0.992, '{"phone": "+5511999999999"}');