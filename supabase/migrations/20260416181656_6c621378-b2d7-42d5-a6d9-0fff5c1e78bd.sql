
CREATE TABLE public.lead_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'round_robin',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  filter_state TEXT,
  filter_min_value NUMERIC,
  filter_source TEXT,
  filter_role TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view routing rules" ON public.lead_routing_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager manage routing rules" ON public.lead_routing_rules
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE TABLE public.lead_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.lead_routing_rules(id) ON DELETE SET NULL,
  strategy_used TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own assignments" ON public.lead_assignments
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager(auth.uid())
    OR salesperson_id = public.get_current_salesperson_id()
  );
CREATE POLICY "Admin/manager manage assignments" ON public.lead_assignments
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE INDEX idx_lead_assignments_sale ON public.lead_assignments(sale_id);
CREATE INDEX idx_lead_assignments_sp ON public.lead_assignments(salesperson_id);
CREATE INDEX idx_lead_assignments_at ON public.lead_assignments(assigned_at DESC);

CREATE TRIGGER trg_lead_routing_rules_updated BEFORE UPDATE ON public.lead_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.lead_routing_rules (name, strategy, priority, description) VALUES
  ('Round Robin Padrão', 'round_robin', 10, 'Distribui leads rotativamente entre todos os vendedores ativos'),
  ('Menos Carregado', 'least_loaded', 5, 'Atribui ao vendedor com menor número de deals abertos'),
  ('Top Performer Premium', 'top_performer', 1, 'Leads de alto valor (>R$50k) vão para os melhores vendedores')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.auto_assign_lead(_sale_id UUID)
RETURNS TABLE(assigned_to UUID, strategy TEXT, rule_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rule RECORD;
  _sale RECORD;
  _chosen UUID;
BEGIN
  SELECT * INTO _sale FROM public.sales WHERE id = _sale_id;
  IF _sale IS NULL THEN RAISE EXCEPTION 'Sale not found'; END IF;

  FOR _rule IN
    SELECT * FROM public.lead_routing_rules
    WHERE is_active = true
      AND (filter_min_value IS NULL OR _sale.amount >= filter_min_value)
    ORDER BY priority ASC
    LIMIT 1
  LOOP
    IF _rule.strategy = 'round_robin' THEN
      SELECT s.id INTO _chosen FROM public.salespeople s
        LEFT JOIN public.lead_assignments la ON la.salesperson_id = s.id
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY MAX(la.assigned_at) NULLS FIRST
        LIMIT 1;
    ELSIF _rule.strategy = 'least_loaded' THEN
      SELECT s.id INTO _chosen FROM public.salespeople s
        LEFT JOIN public.sales sa ON sa.salesperson_id = s.id AND sa.status NOT IN ('completed','lost','cancelled')
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY COUNT(sa.id) ASC
        LIMIT 1;
    ELSIF _rule.strategy = 'top_performer' THEN
      SELECT s.id INTO _chosen FROM public.salespeople s
        LEFT JOIN public.sales sa ON sa.salesperson_id = s.id AND sa.status = 'completed'
        WHERE s.is_active = true
        GROUP BY s.id
        ORDER BY COALESCE(SUM(sa.amount),0) DESC
        LIMIT 1;
    END IF;

    IF _chosen IS NOT NULL THEN
      UPDATE public.sales SET salesperson_id = _chosen WHERE id = _sale_id;
      INSERT INTO public.lead_assignments (sale_id, salesperson_id, rule_id, strategy_used)
        VALUES (_sale_id, _chosen, _rule.id, _rule.strategy);
      RETURN QUERY SELECT _chosen, _rule.strategy, _rule.id;
      RETURN;
    END IF;
  END LOOP;
END;
$$;
