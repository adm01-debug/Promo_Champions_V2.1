-- Enable realtime for security_alert_history table
ALTER TABLE public.security_alert_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alert_history;