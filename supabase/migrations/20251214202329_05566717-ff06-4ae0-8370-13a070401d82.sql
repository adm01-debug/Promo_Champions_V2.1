-- Enable realtime for sdr_alert_history table
ALTER TABLE public.sdr_alert_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sdr_alert_history;