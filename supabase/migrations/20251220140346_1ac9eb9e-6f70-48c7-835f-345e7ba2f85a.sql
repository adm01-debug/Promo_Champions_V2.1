-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'calls',
  target_value INTEGER NOT NULL DEFAULT 5,
  xp_reward INTEGER NOT NULL DEFAULT 25,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_challenge_progress table
CREATE TABLE public.daily_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, salesperson_id)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_challenges
CREATE POLICY "Authenticated users can read daily_challenges" 
ON public.daily_challenges FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert daily_challenges" 
ON public.daily_challenges FOR INSERT 
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update daily_challenges" 
ON public.daily_challenges FOR UPDATE 
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete daily_challenges" 
ON public.daily_challenges FOR DELETE 
USING (is_admin_or_manager(auth.uid()));

-- RLS policies for daily_challenge_progress
CREATE POLICY "Authenticated users can read daily_challenge_progress" 
ON public.daily_challenge_progress FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert daily_challenge_progress" 
ON public.daily_challenge_progress FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_challenge_progress" 
ON public.daily_challenge_progress FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_daily_challenges_active ON public.daily_challenges(is_active);
CREATE INDEX idx_daily_challenge_progress_salesperson ON public.daily_challenge_progress(salesperson_id);
CREATE INDEX idx_daily_challenge_progress_challenge ON public.daily_challenge_progress(challenge_id);