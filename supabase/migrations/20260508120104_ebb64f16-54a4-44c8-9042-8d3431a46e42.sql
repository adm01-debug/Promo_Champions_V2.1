-- Create follow_up_settings table
CREATE TABLE IF NOT EXISTS public.follow_up_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cadence_days INTEGER[] DEFAULT '{3, 5, 15}',
    whatsapp_template TEXT DEFAULT 'Olá {{client_name}}! Sou o seu consultor na PROMO CHAMPIONS. Notei que nossa negociação sobre o {{product_name}} está na etapa de {{status}} e faz uns dias que não nos falamos. Como posso te ajudar a avançar hoje?',
    auto_reactivate_class_a BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings if none exist
INSERT INTO public.follow_up_settings (cadence_days)
SELECT '{3, 5, 15}'
WHERE NOT EXISTS (SELECT 1 FROM public.follow_up_settings);

-- Create follow_up_audit_logs table
CREATE TABLE IF NOT EXISTS public.follow_up_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'whatsapp_sent', 'task_created', 'lead_reactivated'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for follow_up_settings
CREATE POLICY "Anyone can read follow_up_settings" ON public.follow_up_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update follow_up_settings" ON public.follow_up_settings FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
);

-- Policies for follow_up_audit_logs
CREATE POLICY "Users can read audit logs" ON public.follow_up_audit_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert audit logs" ON public.follow_up_audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
