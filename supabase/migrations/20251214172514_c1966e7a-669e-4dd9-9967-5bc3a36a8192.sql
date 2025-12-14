-- ===========================================
-- TIMES: Estrutura de times (1 SDR : 2 Closers)
-- ===========================================

CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sdr_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  inactivity_days INTEGER NOT NULL DEFAULT 365, -- Dias para considerar cliente inativo (365 -> 180)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relacionamento: Closers do time
CREATE TABLE public.team_closers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  closer_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, closer_id)
);

-- ===========================================
-- ICP DATA: Dados de qualificação do cliente
-- ===========================================

CREATE TABLE public.icp_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  ramo_atividade TEXT, -- CNAE ou categoria
  grupo_nicho TEXT, -- Grupo/Nicho específico
  capital_social DECIMAL(15,2),
  num_colaboradores INTEGER,
  is_icp_match BOOLEAN DEFAULT false, -- Se encaixa no perfil ideal
  bitrix_id TEXT, -- ID do Bitrix24 para sincronização
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- CLIENT PORTFOLIO: Carteira de clientes por vendedor
-- ===========================================

CREATE TABLE public.client_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  last_purchase_date DATE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.salespeople(id), -- Quem atribuiu (SDR que prospectou)
  source TEXT DEFAULT 'database', -- database, marketing, prospection, performance_reward
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, salesperson_id)
);

-- ===========================================
-- LEAD ROUTING: Log de distribuição de leads
-- ===========================================

CREATE TABLE public.lead_routing_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  from_salesperson_id UUID REFERENCES public.salespeople(id),
  to_salesperson_id UUID REFERENCES public.salespeople(id),
  routing_reason TEXT NOT NULL, -- prospection, marketing_return, inactivity_transfer, performance_reward
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===========================================
-- CONFIGURAÇÕES DO SISTEMA
-- ===========================================

CREATE TABLE public.portfolio_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.portfolio_settings (setting_key, setting_value, description) VALUES
  ('inactivity_days', '365', 'Dias sem compra para considerar cliente inativo'),
  ('enable_performance_routing', 'true', 'Habilitar distribuição por performance para novos leads'),
  ('min_purchase_for_active', '1', 'Mínimo de compras para considerar cliente ativo');

-- ===========================================
-- INDEXES para performance
-- ===========================================

CREATE INDEX idx_teams_sdr_id ON public.teams(sdr_id);
CREATE INDEX idx_team_closers_team_id ON public.team_closers(team_id);
CREATE INDEX idx_team_closers_closer_id ON public.team_closers(closer_id);
CREATE INDEX idx_icp_data_client_id ON public.icp_data(client_id);
CREATE INDEX idx_icp_data_ramo ON public.icp_data(ramo_atividade);
CREATE INDEX idx_icp_data_grupo ON public.icp_data(grupo_nicho);
CREATE INDEX idx_icp_data_bitrix_id ON public.icp_data(bitrix_id);
CREATE INDEX idx_client_portfolio_client_id ON public.client_portfolio(client_id);
CREATE INDEX idx_client_portfolio_salesperson_id ON public.client_portfolio(salesperson_id);
CREATE INDEX idx_client_portfolio_status ON public.client_portfolio(status);
CREATE INDEX idx_client_portfolio_last_purchase ON public.client_portfolio(last_purchase_date);
CREATE INDEX idx_lead_routing_log_client_id ON public.lead_routing_log(client_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_closers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icp_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_routing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Teams: Todos autenticados podem ver, admins/managers podem gerenciar
CREATE POLICY "Authenticated users can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert teams" ON public.teams FOR INSERT WITH CHECK (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update teams" ON public.teams FOR UPDATE USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete teams" ON public.teams FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- Team Closers
CREATE POLICY "Authenticated users can read team_closers" ON public.team_closers FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert team_closers" ON public.team_closers FOR INSERT WITH CHECK (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete team_closers" ON public.team_closers FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- ICP Data
CREATE POLICY "Authenticated users can read icp_data" ON public.icp_data FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert icp_data" ON public.icp_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update icp_data" ON public.icp_data FOR UPDATE USING (true);

-- Client Portfolio
CREATE POLICY "Authenticated users can read client_portfolio" ON public.client_portfolio FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert client_portfolio" ON public.client_portfolio FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update client_portfolio" ON public.client_portfolio FOR UPDATE USING (true);
CREATE POLICY "Admins and managers can delete client_portfolio" ON public.client_portfolio FOR DELETE USING (is_admin_or_manager(auth.uid()));

-- Lead Routing Log
CREATE POLICY "Authenticated users can read lead_routing_log" ON public.lead_routing_log FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert lead_routing_log" ON public.lead_routing_log FOR INSERT WITH CHECK (true);

-- Portfolio Settings
CREATE POLICY "Authenticated users can read portfolio_settings" ON public.portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage portfolio_settings" ON public.portfolio_settings FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===========================================
-- TRIGGERS para updated_at
-- ===========================================

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_icp_data_updated_at BEFORE UPDATE ON public.icp_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_portfolio_updated_at BEFORE UPDATE ON public.client_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolio_settings_updated_at BEFORE UPDATE ON public.portfolio_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();