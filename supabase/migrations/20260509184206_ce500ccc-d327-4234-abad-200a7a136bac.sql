-- Enable activity auditing
CREATE TABLE IF NOT EXISTS public.activity_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audit logs
ALTER TABLE public.activity_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their activities" 
ON public.activity_audit_logs 
FOR SELECT 
USING (auth.uid() IN (
    SELECT salesperson_id FROM public.activities WHERE id = activity_id
) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
));

-- Function to handle activity auditing
CREATE OR REPLACE FUNCTION public.audit_activity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.activity_audit_logs (activity_id, changed_by, old_data, new_data, action)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW), 'UPDATE');
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.activity_audit_logs (activity_id, changed_by, old_data, action)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), 'DELETE');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auditing
DROP TRIGGER IF EXISTS audit_activities_trigger ON public.activities;
CREATE TRIGGER audit_activities_trigger
AFTER UPDATE OR DELETE ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.audit_activity_changes();

-- MQL Funnel Expansion
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'prospect',
ADD COLUMN IF NOT EXISTS mql_qualified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0;

-- Alerts and SDR Metrics Config
CREATE TABLE IF NOT EXISTS public.sdr_alert_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'rejection_rate', 'outcome_mix'
    threshold_value FLOAT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sdr_alert_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own alert configs" 
ON public.sdr_alert_configs 
FOR ALL 
USING (auth.uid() = user_id);
