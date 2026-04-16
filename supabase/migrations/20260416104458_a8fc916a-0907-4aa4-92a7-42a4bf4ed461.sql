
-- Create pipelines table
CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  icon TEXT NOT NULL DEFAULT 'kanban',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pipelines"
  ON public.pipelines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage pipelines"
  ON public.pipelines FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create pipeline_stages table
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  stage_order INTEGER NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0,
  is_final BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pipeline stages"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage pipeline stages"
  ON public.pipeline_stages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add pipeline_id to sales table
ALTER TABLE public.sales ADD COLUMN pipeline_id UUID REFERENCES public.pipelines(id);

-- Insert default pipelines
INSERT INTO public.pipelines (id, name, description, color, icon, display_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Vendas', 'Pipeline principal de vendas', 'bg-blue-500', 'shopping-cart', 0),
  ('00000000-0000-0000-0000-000000000002', 'Pós-Venda', 'Acompanhamento pós-venda', 'bg-green-500', 'heart-handshake', 1),
  ('00000000-0000-0000-0000-000000000003', 'Renovações', 'Pipeline de renovações de contratos', 'bg-orange-500', 'refresh-cw', 2),
  ('00000000-0000-0000-0000-000000000004', 'Parcerias', 'Pipeline de parcerias estratégicas', 'bg-purple-500', 'users', 3);

-- Insert stages for Vendas pipeline
INSERT INTO public.pipeline_stages (pipeline_id, name, label, color, stage_order, probability, is_final) VALUES
  ('00000000-0000-0000-0000-000000000001', 'lead', 'Lead', 'bg-blue-500', 1, 10, false),
  ('00000000-0000-0000-0000-000000000001', 'qualified', 'Qualificado', 'bg-yellow-500', 2, 25, false),
  ('00000000-0000-0000-0000-000000000001', 'proposal', 'Proposta', 'bg-orange-500', 3, 50, false),
  ('00000000-0000-0000-0000-000000000001', 'negotiation', 'Negociação', 'bg-purple-500', 4, 75, false),
  ('00000000-0000-0000-0000-000000000001', 'closed', 'Fechado', 'bg-green-500', 5, 100, true);

-- Insert stages for Pós-Venda pipeline
INSERT INTO public.pipeline_stages (pipeline_id, name, label, color, stage_order, probability, is_final) VALUES
  ('00000000-0000-0000-0000-000000000002', 'onboarding', 'Onboarding', 'bg-blue-500', 1, 20, false),
  ('00000000-0000-0000-0000-000000000002', 'implementation', 'Implementação', 'bg-yellow-500', 2, 40, false),
  ('00000000-0000-0000-0000-000000000002', 'training', 'Treinamento', 'bg-orange-500', 3, 60, false),
  ('00000000-0000-0000-0000-000000000002', 'support', 'Suporte Ativo', 'bg-purple-500', 4, 80, false),
  ('00000000-0000-0000-0000-000000000002', 'success', 'Sucesso', 'bg-green-500', 5, 100, true);

-- Insert stages for Renovações pipeline
INSERT INTO public.pipeline_stages (pipeline_id, name, label, color, stage_order, probability, is_final) VALUES
  ('00000000-0000-0000-0000-000000000003', 'expiring', 'Expirando', 'bg-red-500', 1, 10, false),
  ('00000000-0000-0000-0000-000000000003', 'contacted', 'Contatado', 'bg-yellow-500', 2, 30, false),
  ('00000000-0000-0000-0000-000000000003', 'negotiating', 'Negociando', 'bg-orange-500', 3, 50, false),
  ('00000000-0000-0000-0000-000000000003', 'renewed', 'Renovado', 'bg-green-500', 4, 100, true),
  ('00000000-0000-0000-0000-000000000003', 'churned', 'Perdido', 'bg-gray-500', 5, 0, true);

-- Insert stages for Parcerias pipeline
INSERT INTO public.pipeline_stages (pipeline_id, name, label, color, stage_order, probability, is_final) VALUES
  ('00000000-0000-0000-0000-000000000004', 'identified', 'Identificado', 'bg-blue-500', 1, 10, false),
  ('00000000-0000-0000-0000-000000000004', 'approached', 'Abordado', 'bg-yellow-500', 2, 25, false),
  ('00000000-0000-0000-0000-000000000004', 'aligned', 'Alinhado', 'bg-orange-500', 3, 50, false),
  ('00000000-0000-0000-0000-000000000004', 'contracted', 'Contratado', 'bg-purple-500', 4, 75, false),
  ('00000000-0000-0000-0000-000000000004', 'active_partner', 'Parceiro Ativo', 'bg-green-500', 5, 100, true);

-- Set default pipeline for existing sales
UPDATE public.sales SET pipeline_id = '00000000-0000-0000-0000-000000000001' WHERE pipeline_id IS NULL;

-- Create index
CREATE INDEX idx_sales_pipeline_id ON public.sales(pipeline_id);
CREATE INDEX idx_pipeline_stages_pipeline_id ON public.pipeline_stages(pipeline_id);
