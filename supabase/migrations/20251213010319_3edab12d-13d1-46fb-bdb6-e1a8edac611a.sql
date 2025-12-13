-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'daily',
  notify_stagnant_deals BOOLEAN NOT NULL DEFAULT true,
  notify_inactive_clients BOOLEAN NOT NULL DEFAULT true,
  notify_at_risk_goals BOOLEAN NOT NULL DEFAULT true,
  stagnant_threshold_days INTEGER NOT NULL DEFAULT 14,
  inactive_threshold_days INTEGER NOT NULL DEFAULT 60,
  preferred_time TIME NOT NULL DEFAULT '08:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_frequency CHECK (frequency IN ('realtime', 'daily', 'weekly'))
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to notification_preferences"
ON public.notification_preferences FOR SELECT USING (true);

CREATE POLICY "Allow public insert to notification_preferences"
ON public.notification_preferences FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to notification_preferences"
ON public.notification_preferences FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to notification_preferences"
ON public.notification_preferences FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();