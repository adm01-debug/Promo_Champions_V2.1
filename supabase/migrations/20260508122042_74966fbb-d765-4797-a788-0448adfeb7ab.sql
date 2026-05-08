-- Create WhatsApp template versions table
CREATE TABLE IF NOT EXISTS public.whatsapp_template_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL,
    body TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for versions
ALTER TABLE public.whatsapp_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Versions are viewable by authenticated users" 
ON public.whatsapp_template_versions FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can create versions" 
ON public.whatsapp_template_versions FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Add status and retry_count to follow_up_audit_logs if not exists
ALTER TABLE public.follow_up_audit_logs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Create a view for easier auditing
CREATE OR REPLACE VIEW public.follow_up_audit_view AS
SELECT 
    al.id,
    al.sale_id,
    s.client_name as lead_name,
    al.user_id,
    sp.name as user_name,
    al.action_type,
    al.details,
    al.status,
    al.retry_count,
    al.created_at
FROM public.follow_up_audit_logs al
LEFT JOIN public.sales s ON al.sale_id = s.id
LEFT JOIN public.salespeople sp ON al.user_id = sp.auth_user_id;

-- Ensure settings has versioning trigger
CREATE OR REPLACE FUNCTION public.handle_template_versioning()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    IF (OLD.whatsapp_template IS DISTINCT FROM NEW.whatsapp_template) THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
        FROM public.whatsapp_template_versions
        WHERE template_id = NEW.id;

        INSERT INTO public.whatsapp_template_versions (template_id, body, version_number, created_by)
        VALUES (NEW.id, NEW.whatsapp_template, next_version, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists on follow_up_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_template_versioning') THEN
        CREATE TRIGGER tr_template_versioning
        BEFORE UPDATE ON public.follow_up_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_template_versioning();
    END IF;
END $$;
