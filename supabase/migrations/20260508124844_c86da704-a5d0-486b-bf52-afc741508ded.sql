-- Create WhatsApp Templates table
CREATE TABLE IF NOT EXISTS public.follow_up_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- List of expected variables
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create Territory/Salesperson Rules table
CREATE TABLE IF NOT EXISTS public.follow_up_territory_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    territory TEXT,
    salesperson_id UUID REFERENCES auth.users(id),
    cadence_id UUID, -- Placeholder if you have a cadences table, otherwise using settings
    whatsapp_template_id UUID REFERENCES public.follow_up_templates(id),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS public.follow_up_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    sale_id UUID REFERENCES public.sales(id),
    audit_log_id UUID REFERENCES public.follow_up_audit_logs(id),
    type TEXT NOT NULL, -- 'opened', 'failed', 'delivered'
    status TEXT DEFAULT 'unread', -- 'unread', 'read', 'dismissed'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_territory_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for templates
CREATE POLICY "Admins can manage templates" ON public.follow_up_templates
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view active templates" ON public.follow_up_templates
    FOR SELECT USING (is_active = true);

-- Policies for territory rules
CREATE POLICY "Admins can manage territory rules" ON public.follow_up_territory_rules
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own territory rules" ON public.follow_up_territory_rules
    FOR SELECT USING (salesperson_id = auth.uid() OR salesperson_id IS NULL);

-- Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.follow_up_notifications
    USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_follow_up_templates_updated_at BEFORE UPDATE ON public.follow_up_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_up_territory_rules_updated_at BEFORE UPDATE ON public.follow_up_territory_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
