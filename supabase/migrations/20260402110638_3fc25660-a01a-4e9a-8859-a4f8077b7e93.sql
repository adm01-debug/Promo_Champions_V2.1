
-- =============================================
-- FIX: COMBO_TRACKING - Restrict to own salesperson
-- =============================================

DROP POLICY IF EXISTS "Anyone can insert combo_tracking" ON public.combo_tracking;
DROP POLICY IF EXISTS "Anyone can update combo_tracking" ON public.combo_tracking;

CREATE POLICY "Users can insert own combo_tracking"
ON public.combo_tracking FOR INSERT TO authenticated
WITH CHECK (
  salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can update own combo_tracking"
ON public.combo_tracking FOR UPDATE TO authenticated
USING (
  salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- =============================================
-- FIX: LEAGUE_MEMBERS - Restrict to own salesperson
-- =============================================

DROP POLICY IF EXISTS "Anyone can insert league_members" ON public.league_members;
DROP POLICY IF EXISTS "Anyone can update league_members" ON public.league_members;

CREATE POLICY "Users can insert own league_members"
ON public.league_members FOR INSERT TO authenticated
WITH CHECK (
  salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can update own league_members"
ON public.league_members FOR UPDATE TO authenticated
USING (
  salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1)
);
