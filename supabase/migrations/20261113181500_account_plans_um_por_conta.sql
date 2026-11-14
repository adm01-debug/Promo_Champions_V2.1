-- Plano de conta (ABM): no máximo um plano por conta, visível ao dono da conta.
--
-- Causa: account_plans não tinha UNIQUE(account_id) e as policies de SELECT e
-- UPDATE só liberavam admin/gestor ou o criador do plano (created_by). Depois
-- que a #467 destravou o INSERT, o dono da conta que não criou o plano (ex.: o
-- gestor criou) não enxerga o plano existente; useUpdateAccountPlan
-- (src/hooks/abm/useAccounts.ts) não acha o plano e insere um segundo. Com 2
-- linhas, useAccountPlan (maybeSingle) passa a falhar para o gestor e o próximo
-- salvamento insere um terceiro. Dois admins salvando ao mesmo tempo também
-- duplicavam.
--
-- Correção:
-- 1) índice único em account_id (tabela com 0 linhas em 2026-11-13; sem
--    duplicatas a limpar). Sem CONCURRENTLY, conforme AGENTS.md §7.
-- 2) SELECT e UPDATE também liberados para o dono da conta
--    (accounts.owner_id = get_current_salesperson_id()), além de admin/gestor
--    e criador. O INSERT não muda.

CREATE UNIQUE INDEX IF NOT EXISTS account_plans_account_id_key
  ON public.account_plans (account_id);

DROP POLICY IF EXISTS "Account plans owner or admin can read" ON public.account_plans;
CREATE POLICY "Account plans owner or admin can read"
  ON public.account_plans FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager(auth.uid())
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_plans.account_id
        AND a.owner_id = public.get_current_salesperson_id()
    )
  );

DROP POLICY IF EXISTS "Account plans owner or admin can update" ON public.account_plans;
CREATE POLICY "Account plans owner or admin can update"
  ON public.account_plans FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_manager(auth.uid())
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_plans.account_id
        AND a.owner_id = public.get_current_salesperson_id()
    )
  );
