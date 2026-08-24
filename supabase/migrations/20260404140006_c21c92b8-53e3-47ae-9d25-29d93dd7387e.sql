
-- Message Templates table
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'linkedin', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'geral',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.message_templates
  FOR SELECT USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can create own templates" ON public.message_templates
  FOR INSERT WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own templates" ON public.message_templates
  FOR UPDATE USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can delete own templates" ON public.message_templates
  FOR DELETE USING (salesperson_id = public.get_current_salesperson_id());

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_message_templates_salesperson ON public.message_templates(salesperson_id);
CREATE INDEX idx_message_templates_channel ON public.message_templates(channel);

-- Channel Interactions table
CREATE TABLE public.channel_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'linkedin', 'sms', 'phone')),
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  contact_name TEXT NOT NULL,
  contact_info TEXT,
  message_preview TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'replied', 'failed', 'scheduled')),
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.channel_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON public.channel_interactions
  FOR SELECT USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can create own interactions" ON public.channel_interactions
  FOR INSERT WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own interactions" ON public.channel_interactions
  FOR UPDATE USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can delete own interactions" ON public.channel_interactions
  FOR DELETE USING (salesperson_id = public.get_current_salesperson_id());

CREATE INDEX idx_channel_interactions_salesperson ON public.channel_interactions(salesperson_id);
CREATE INDEX idx_channel_interactions_channel ON public.channel_interactions(channel);
CREATE INDEX idx_channel_interactions_created ON public.channel_interactions(created_at DESC);
CREATE INDEX idx_channel_interactions_deal ON public.channel_interactions(deal_id) WHERE deal_id IS NOT NULL;
