
CREATE POLICY "Users can read own or all bets"
ON public.performance_bets FOR SELECT TO authenticated
USING (
  salesperson_id = (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1)
  OR public.is_admin_or_manager(auth.uid())
);
