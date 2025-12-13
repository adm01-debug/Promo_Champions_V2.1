-- Create playbooks table
CREATE TABLE public.playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playbook items/checklist table
CREATE TABLE public.playbook_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  item_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  item_type TEXT NOT NULL DEFAULT 'checklist',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playbook progress tracking per deal
CREATE TABLE public.playbook_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_item_id UUID NOT NULL REFERENCES public.playbook_items(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_by UUID REFERENCES public.salespeople(id),
  UNIQUE(playbook_item_id, sale_id)
);

-- Enable RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for playbooks
CREATE POLICY "Allow public read access to playbooks" ON public.playbooks FOR SELECT USING (true);
CREATE POLICY "Allow public insert to playbooks" ON public.playbooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to playbooks" ON public.playbooks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to playbooks" ON public.playbooks FOR DELETE USING (true);

-- RLS policies for playbook_items
CREATE POLICY "Allow public read access to playbook_items" ON public.playbook_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert to playbook_items" ON public.playbook_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to playbook_items" ON public.playbook_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to playbook_items" ON public.playbook_items FOR DELETE USING (true);

-- RLS policies for playbook_progress
CREATE POLICY "Allow public read access to playbook_progress" ON public.playbook_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert to playbook_progress" ON public.playbook_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to playbook_progress" ON public.playbook_progress FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to playbook_progress" ON public.playbook_progress FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_playbooks_updated_at
BEFORE UPDATE ON public.playbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default playbooks for each stage
INSERT INTO public.playbooks (stage, title, description) VALUES
('lead', 'Qualificação de Lead', 'Passos para qualificar um novo lead e determinar fit'),
('qualified', 'Discovery Call', 'Guia para primeira conversa de descoberta'),
('proposal', 'Elaboração de Proposta', 'Checklist para criar proposta comercial'),
('negotiation', 'Negociação e Fechamento', 'Técnicas e passos para fechar o deal');

-- Insert default checklist items
INSERT INTO public.playbook_items (playbook_id, content, item_order, is_required, item_type) 
SELECT p.id, item.content, item.ord, item.required, 'checklist'
FROM public.playbooks p
CROSS JOIN LATERAL (
  VALUES 
    -- Lead stage items
    ('lead', 'Verificar dados de contato do lead', 1, true),
    ('lead', 'Pesquisar empresa no LinkedIn/site', 2, true),
    ('lead', 'Identificar cargo e poder de decisão', 3, true),
    ('lead', 'Verificar se está no ICP (Perfil Ideal)', 4, true),
    ('lead', 'Agendar primeira ligação em até 24h', 5, false),
    -- Qualified stage items
    ('qualified', 'Confirmar BANT (Budget, Authority, Need, Timeline)', 1, true),
    ('qualified', 'Mapear dores e desafios principais', 2, true),
    ('qualified', 'Identificar stakeholders envolvidos', 3, true),
    ('qualified', 'Entender processo de compra interno', 4, false),
    ('qualified', 'Definir próximos passos claros', 5, true),
    -- Proposal stage items
    ('proposal', 'Personalizar proposta com dores identificadas', 1, true),
    ('proposal', 'Incluir ROI estimado ou business case', 2, false),
    ('proposal', 'Definir escopo e entregáveis claros', 3, true),
    ('proposal', 'Preparar 2-3 opções de preço', 4, false),
    ('proposal', 'Revisar com gestor antes de enviar', 5, true),
    ('proposal', 'Agendar call de apresentação da proposta', 6, true),
    -- Negotiation stage items
    ('negotiation', 'Identificar objeções principais', 1, true),
    ('negotiation', 'Preparar respostas para objeções', 2, true),
    ('negotiation', 'Definir limite de desconto autorizado', 3, false),
    ('negotiation', 'Criar senso de urgência genuíno', 4, false),
    ('negotiation', 'Confirmar decisores na reunião final', 5, true),
    ('negotiation', 'Preparar contrato para assinatura', 6, true)
) AS item(stage, content, ord, required)
WHERE p.stage = item.stage;