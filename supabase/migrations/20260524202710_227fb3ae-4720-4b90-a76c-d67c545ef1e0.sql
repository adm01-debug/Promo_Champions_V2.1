ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ramo_atividade TEXT;
COMMENT ON COLUMN public.clients.ramo_atividade IS 'Setor de atuação do cliente (Tecnologia, Indústria, Varejo, etc)';
