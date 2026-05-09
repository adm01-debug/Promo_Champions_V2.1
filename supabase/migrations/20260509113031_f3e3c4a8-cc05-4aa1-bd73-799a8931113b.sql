-- Create notifications table for history if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'opportunity', 'retention', 'system'
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications') THEN
    CREATE POLICY "Users can view their own notifications"
      ON public.notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own notifications') THEN
    CREATE POLICY "Users can insert their own notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;