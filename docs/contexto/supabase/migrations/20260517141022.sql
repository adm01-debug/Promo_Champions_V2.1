-- Adicionar colunas para SDR e Closer se não existirem
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS sdr_id UUID REFERENCES public.salespeople(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS closer_id UUID REFERENCES public.salespeople(id);

-- Atualizar comentários para clareza
COMMENT ON COLUMN public.sales.sdr_id IS 'ID do SDR que realizou a ativação/prospecção';
COMMENT ON COLUMN public.sales.closer_id IS 'ID do Closer responsável pelo fechamento e gestão';
COMMENT ON COLUMN public.sales.is_first_sale IS 'Indica se é a primeira venda do cliente (ativação)';

-- Garantir que as permissões de RLS permitam a visualização dessas novas colunas
-- (Normalmente já incluído no select *, mas reforçando se houver restrições específicas)
