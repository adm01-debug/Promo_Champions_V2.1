CREATE OR REPLACE FUNCTION public.calculate_daily_challenge_streak(p_salesperson_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
