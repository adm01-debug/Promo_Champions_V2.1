
-- Remove direct UPDATE policies from gamification tables
DROP POLICY IF EXISTS "Users can update own salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Own streaks update" ON public.sales_streaks;
DROP POLICY IF EXISTS "Users can update own combo_tracking" ON public.combo_tracking;
DROP POLICY IF EXISTS "Users can manage own goals" ON public.progressive_goals;
DROP POLICY IF EXISTS "Users can update own league_members" ON public.league_members;

-- Admin/manager UPDATE policies for all gamification tables
CREATE POLICY "Admins can update salesperson_xp" ON public.salesperson_xp FOR UPDATE TO authenticated USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update sales_streaks" ON public.sales_streaks FOR UPDATE TO authenticated USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update combo_tracking" ON public.combo_tracking FOR UPDATE TO authenticated USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update progressive_goals" ON public.progressive_goals FOR UPDATE TO authenticated USING (is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins can update league_members" ON public.league_members FOR UPDATE TO authenticated USING (is_admin_or_manager(auth.uid()));

-- Secure RPC: Add XP (validates positive increments only)
CREATE OR REPLACE FUNCTION public.add_salesperson_xp(
  p_salesperson_id uuid,
  p_xp_amount integer,
  p_source text DEFAULT 'system'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  
  -- Only the salesperson themselves or admin/manager can add XP
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate positive increment
  IF p_xp_amount <= 0 OR p_xp_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid XP amount (must be 1-10000)';
  END IF;

  UPDATE public.salesperson_xp SET
    total_xp = total_xp + p_xp_amount,
    current_level = GREATEST(current_level, 1 + (total_xp + p_xp_amount) / 1000),
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$$;

-- Secure RPC: Increment streak (max +1 per call)
CREATE OR REPLACE FUNCTION public.increment_sales_streak(p_salesperson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.sales_streaks SET
    current_streak = current_streak + 1,
    longest_streak = GREATEST(longest_streak, current_streak + 1),
    last_sale_date = CURRENT_DATE,
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$$;

-- Secure RPC: Update combo (server-managed)
CREATE OR REPLACE FUNCTION public.increment_combo(p_salesperson_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.combo_tracking SET
    actions_count = actions_count + 1,
    current_tier = LEAST(current_tier + 1, 10),
    current_multiplier = LEAST(current_multiplier + 0.1, 3.0),
    max_tier_today = GREATEST(max_tier_today, LEAST(current_tier + 1, 10)),
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id AND combo_date = CURRENT_DATE;

  RETURN FOUND;
END;
$$;

-- Secure RPC: Update progressive goal progress
CREATE OR REPLACE FUNCTION public.increment_goal_progress(
  p_goal_id uuid,
  p_increment integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
  v_goal_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  SELECT salesperson_id INTO v_goal_sp_id FROM public.progressive_goals WHERE id = p_goal_id;
  
  IF v_caller_sp_id != v_goal_sp_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_increment <= 0 OR p_increment > 100 THEN
    RAISE EXCEPTION 'Invalid increment (must be 1-100)';
  END IF;

  UPDATE public.progressive_goals SET
    current_progress = current_progress + p_increment,
    updated_at = now()
  WHERE id = p_goal_id;

  RETURN FOUND;
END;
$$;

-- Secure RPC: Add weekly XP to league
CREATE OR REPLACE FUNCTION public.add_league_weekly_xp(
  p_salesperson_id uuid,
  p_xp integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_xp <= 0 OR p_xp > 10000 THEN
    RAISE EXCEPTION 'Invalid XP amount';
  END IF;

  UPDATE public.league_members SET
    weekly_xp = weekly_xp + p_xp,
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$$;
