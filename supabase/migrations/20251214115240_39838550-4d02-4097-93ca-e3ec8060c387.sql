-- Create system settings table for security alert configurations
CREATE TABLE public.security_alert_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spike_threshold INTEGER NOT NULL DEFAULT 5,
  time_window_hours INTEGER NOT NULL DEFAULT 1,
  cooldown_hours INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alert_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view security settings" 
ON public.security_alert_settings 
FOR SELECT 
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- Only admins can update settings
CREATE POLICY "Admins can update security settings" 
ON public.security_alert_settings 
FOR UPDATE 
TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- Only admins can insert settings
CREATE POLICY "Admins can insert security settings" 
ON public.security_alert_settings 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Insert default settings row
INSERT INTO public.security_alert_settings (spike_threshold, time_window_hours, cooldown_hours) 
VALUES (5, 1, 24);

-- Create trigger for updated_at
CREATE TRIGGER update_security_alert_settings_updated_at
BEFORE UPDATE ON public.security_alert_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();