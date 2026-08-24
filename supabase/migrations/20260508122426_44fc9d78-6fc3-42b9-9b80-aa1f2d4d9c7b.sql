-- Create WhatsApp Template Versions table
CREATE TABLE IF NOT EXISTS public.whatsapp_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_text TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.whatsapp_template_versions ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for WhatsApp Template Versions
CREATE POLICY "Admins can manage template versions"
ON public.whatsapp_template_versions
FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Venders can view active template versions"
ON public.whatsapp_template_versions
FOR SELECT
USING (true);

-- Update follow_up_audit_logs if needed (adding retry_count and status columns if missing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='follow_up_audit_logs' AND column_name='retry_count') THEN
        ALTER TABLE public.follow_up_audit_logs ADD COLUMN retry_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='follow_up_audit_logs' AND column_name='status') THEN
        ALTER TABLE public.follow_up_audit_logs ADD COLUMN status TEXT DEFAULT 'success';
    END IF;
END $$;

-- Update follow_up_settings to include current_version_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='follow_up_settings' AND column_name='current_whatsapp_version_id') THEN
        ALTER TABLE public.follow_up_settings ADD COLUMN current_whatsapp_version_id UUID REFERENCES public.whatsapp_template_versions(id);
    END IF;
END $$;
