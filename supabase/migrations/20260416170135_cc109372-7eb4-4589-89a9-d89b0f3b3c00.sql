-- ========================================
-- COMMISSION RULES (regras configuráveis)
-- ========================================
CREATE TABLE public.commission_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  category TEXT,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 5.00 CHECK (percentage >= 0 AND percentage <= 100),
  min_amount NUMERIC(12,2) DEFAULT 0,
  max_amount NUMERIC(12,2),
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commission_rules_salesperson ON public.commission_rules(salesperson_id) WHERE is_active = true;
CREATE INDEX idx_commission_rules_category ON public.commission_rules(category) WHERE is_active = true;
CREATE INDEX idx_commission_rules_priority ON public.commission_rules(priority DESC) WHERE is_active = true;

ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/Managers manage commission rules"
ON public.commission_rules FOR ALL
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Salespeople view own rules"
ON public.commission_rules FOR SELECT
USING (
  is_active = true AND (
    salesperson_id = public.get_current_salesperson_id()
    OR salesperson_id IS NULL
  )
);

CREATE TRIGGER update_commission_rules_updated_at
  BEFORE UPDATE ON public.commission_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- COMMISSIONS (registros gerados)
-- ========================================
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  base_amount NUMERIC(12,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  paid_at TIMESTAMPTZ,
  paid_by UUID,
  payment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(sale_id)
);

CREATE INDEX idx_commissions_salesperson ON public.commissions(salesperson_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_created ON public.commissions(created_at DESC);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/Managers manage all commissions"
ON public.commissions FOR ALL
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Salespeople view own commissions"
ON public.commissions FOR SELECT
USING (salesperson_id = public.get_current_salesperson_id());

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- AGENDA EVENTS (agenda comercial)
-- ========================================
CREATE TABLE public.agenda_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'reminder' CHECK (event_type IN ('reminder', 'follow_up', 'meeting', 'call', 'task')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  reminder_minutes_before INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agenda_events_salesperson ON public.agenda_events(salesperson_id);
CREATE INDEX idx_agenda_events_scheduled ON public.agenda_events(scheduled_at);
CREATE INDEX idx_agenda_events_status ON public.agenda_events(status);
CREATE INDEX idx_agenda_events_sale ON public.agenda_events(sale_id) WHERE sale_id IS NOT NULL;

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople manage own agenda events"
ON public.agenda_events FOR ALL
USING (salesperson_id = public.get_current_salesperson_id())
WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Admins/Managers view all agenda events"
ON public.agenda_events FOR SELECT
USING (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_agenda_events_updated_at
  BEFORE UPDATE ON public.agenda_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- AUTO-COMMISSION TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION public.auto_create_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule RECORD;
  v_percentage NUMERIC(5,2);
  v_rule_id UUID;
  v_commission_amount NUMERIC(12,2);
BEGIN
  -- Only trigger on completed sales with a salesperson
  IF NEW.status != 'completed' OR NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if commission already exists for this sale
  IF EXISTS (SELECT 1 FROM public.commissions WHERE sale_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Find best matching rule (priority: salesperson + category > salesperson > category > global)
  SELECT id, percentage INTO v_rule
  FROM public.commission_rules
  WHERE is_active = true
    AND (min_amount IS NULL OR NEW.amount >= min_amount)
    AND (max_amount IS NULL OR NEW.amount <= max_amount)
    AND (
      (salesperson_id = NEW.salesperson_id AND category = NEW.category)
      OR (salesperson_id = NEW.salesperson_id AND category IS NULL)
      OR (salesperson_id IS NULL AND category = NEW.category)
      OR (salesperson_id IS NULL AND category IS NULL)
    )
  ORDER BY
    CASE
      WHEN salesperson_id = NEW.salesperson_id AND category = NEW.category THEN 1
      WHEN salesperson_id = NEW.salesperson_id THEN 2
      WHEN category = NEW.category THEN 3
      ELSE 4
    END,
    priority DESC
  LIMIT 1;

  -- Default to 5% if no rule found
  IF v_rule.id IS NULL THEN
    v_percentage := 5.00;
    v_rule_id := NULL;
  ELSE
    v_percentage := v_rule.percentage;
    v_rule_id := v_rule.id;
  END IF;

  v_commission_amount := ROUND(NEW.amount * v_percentage / 100, 2);

  INSERT INTO public.commissions (
    sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status
  ) VALUES (
    NEW.id, NEW.salesperson_id, v_rule_id, NEW.amount, v_percentage, v_commission_amount, 'pending'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_commission
  AFTER INSERT OR UPDATE OF status ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_commission();