-- Add consecutive days threshold to notification_preferences
ALTER TABLE public.notification_preferences 
ADD COLUMN consecutive_days_threshold integer NOT NULL DEFAULT 3;

-- Add comment for documentation
COMMENT ON COLUMN public.notification_preferences.consecutive_days_threshold IS 'Number of consecutive days below goal before triggering SDR alert';