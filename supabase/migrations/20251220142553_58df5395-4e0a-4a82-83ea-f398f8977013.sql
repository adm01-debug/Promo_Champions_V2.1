-- Create table to track daily streak milestones achieved by each salesperson
CREATE TABLE public.daily_streak_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  streak_type text NOT NULL, -- 'streak_3', 'streak_7', 'streak_14', 'streak_30'
  achieved_at timestamp with time zone NOT NULL DEFAULT now(),
  streak_count integer NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, streak_type)
);

-- Enable RLS
ALTER TABLE public.daily_streak_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can read daily_streak_achievements" 
ON public.daily_streak_achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert daily_streak_achievements" 
ON public.daily_streak_achievements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_streak_achievements" 
ON public.daily_streak_achievements 
FOR UPDATE 
USING (true);

-- Create a function to calculate current streak for a salesperson
CREATE OR REPLACE FUNCTION public.calculate_daily_challenge_streak(p_salesperson_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer := 0;
  v_current_date date := CURRENT_DATE;
  v_check_date date;
  v_day_completed boolean;
BEGIN
  -- Start from today or yesterday (if today's challenges haven't been completed yet)
  v_check_date := v_current_date;
  
  LOOP
    -- Check if all challenges for this date were completed
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN false
        WHEN COUNT(*) = COUNT(CASE WHEN dcp.completed_at IS NOT NULL THEN 1 END) THEN true
        ELSE false
      END INTO v_day_completed
    FROM daily_challenges dc
    LEFT JOIN daily_challenge_progress dcp ON dc.id = dcp.challenge_id 
      AND dcp.salesperson_id = p_salesperson_id
    WHERE dc.challenge_date = v_check_date;
    
    -- If no challenges exist for this day, check previous day (but only on first iteration)
    IF v_check_date = v_current_date AND NOT v_day_completed THEN
      v_check_date := v_check_date - 1;
      CONTINUE;
    END IF;
    
    -- If day wasn't completed, break the streak
    IF NOT v_day_completed THEN
      EXIT;
    END IF;
    
    -- Increment streak and move to previous day
    v_streak := v_streak + 1;
    v_check_date := v_check_date - 1;
    
    -- Safety limit to prevent infinite loop
    IF v_streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$;

-- Create index for better performance
CREATE INDEX idx_daily_streak_achievements_salesperson ON public.daily_streak_achievements(salesperson_id);
CREATE INDEX idx_daily_challenge_progress_completed ON public.daily_challenge_progress(salesperson_id, completed_at);