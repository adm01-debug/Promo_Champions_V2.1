-- accounts: DELETE só para gestor (admin/manager).
--
-- Causa: a policy "Owners and managers can manage accounts" (FOR ALL,
-- 20260416195950) liberava DELETE também ao dono da conta (vendedor,
-- owner_id = get_current_salesperson_id()). Via API o vendedor apagava a
-- conta e, pelos FKs ON DELETE CASCADE (account_contacts, account_plans,
-- account_activities, renewals, support_tickets, csat_ces_surveys,
-- expansion_opportunities, onboarding_journeys, qbr_schedule,
-- product_usage_events/summary), os dados de CS de outras equipes. O front
-- já esconde o botão de excluir para não-gestor; o servidor não protegia.
--
-- Efeito: a policy ALL é substituída por policies por comando:
--   SELECT / INSERT / UPDATE — dono ou gestor (mesma regra de antes);
--   DELETE                   — só gestor (is_admin_or_manager).
-- auth.uid() e os helpers vão em (SELECT ...) para avaliação única por
-- query (initplan). service_role (edge functions) não é afetado (BYPASSRLS).
-- Idempotente: DROP POLICY IF EXISTS antes de cada CREATE.

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners and managers can manage accounts" ON public.accounts;

DROP POLICY IF EXISTS "Owners and managers can view accounts" ON public.accounts;
CREATE POLICY "Owners and managers can view accounts"
ON public.accounts FOR SELECT TO authenticated
USING (
  (SELECT public.is_admin_or_manager((SELECT auth.uid())))
  OR owner_id = (SELECT public.get_current_salesperson_id())
);

DROP POLICY IF EXISTS "Owners and managers can insert accounts" ON public.accounts;
CREATE POLICY "Owners and managers can insert accounts"
ON public.accounts FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.is_admin_or_manager((SELECT auth.uid())))
  OR owner_id = (SELECT public.get_current_salesperson_id())
);

DROP POLICY IF EXISTS "Owners and managers can update accounts" ON public.accounts;
CREATE POLICY "Owners and managers can update accounts"
ON public.accounts FOR UPDATE TO authenticated
USING (
  (SELECT public.is_admin_or_manager((SELECT auth.uid())))
  OR owner_id = (SELECT public.get_current_salesperson_id())
)
WITH CHECK (
  (SELECT public.is_admin_or_manager((SELECT auth.uid())))
  OR owner_id = (SELECT public.get_current_salesperson_id())
);

DROP POLICY IF EXISTS "Managers can delete accounts" ON public.accounts;
CREATE POLICY "Managers can delete accounts"
ON public.accounts FOR DELETE TO authenticated
USING (
  (SELECT public.is_admin_or_manager((SELECT auth.uid())))
);
