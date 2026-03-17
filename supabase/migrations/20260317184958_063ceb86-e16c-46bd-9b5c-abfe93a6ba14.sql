
-- Workflow automation rules
CREATE TABLE public.workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'deal_stagnant',
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL DEFAULT 'create_task',
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  executions_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workflow rules" ON public.workflow_rules
  FOR ALL TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id())
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- Email tracking events
CREATE TABLE public.email_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'sent',
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email tracking" ON public.email_tracking_events
  FOR ALL TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id())
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- Dashboard widget layouts
CREATE TABLE public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id)
);

ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dashboard layout" ON public.dashboard_layouts
  FOR ALL TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id())
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());
