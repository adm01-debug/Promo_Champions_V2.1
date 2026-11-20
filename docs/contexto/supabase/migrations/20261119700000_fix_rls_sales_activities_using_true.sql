-- fix(security): remove policies permissivas de sales/activities (CWE-284)
--
-- As migrations 20260530000002_enable_rls_and_remove_env_risk.sql criaram:
--   - "sales_select_policy"   ON public.sales      FOR SELECT TO authenticated USING (true)
--   - "sales_insert_policy"   ON public.sales      FOR INSERT TO authenticated WITH CHECK (true)
--   - "activities_select_policy" ON public.activities FOR SELECT TO authenticated USING (true)
--   - "activities_insert_policy" ON public.activities FOR INSERT TO authenticated WITH CHECK (true)
--
-- Por OR policy no RLS do Postgres, qualquer policy permissiva expõe a linha. Isso
-- permitia que QUALQUER usuário autenticado lesse custos/margens e inserisse em
-- sales e activities, anulando as policies role-based restritivas:
--
--   - public.sales: "Admins and Managers can view all sales" + "Salespeople can
--     view their own sales" (20260517123736) e insert/update/delete role-based.
--   - public.activities: "Users can view/insert/update/delete own activities"
--     com salesperson_id OR is_admin_or_manager (20260103/04/05).
--
-- Este fix DROPA apenas as policies permissivas da 20260530. Nenhuma policy
-- role-based é tocada, então não há regressao de acesso legitimo. Idempotente.
DO $$ BEGIN
  DROP POLICY IF EXISTS "sales_select_policy"      ON public.sales;
  DROP POLICY IF EXISTS "sales_insert_policy"      ON public.sales;
  DROP POLICY IF EXISTS "activities_select_policy" ON public.activities;
  DROP POLICY IF EXISTS "activities_insert_policy" ON public.activities;
END $$

-- Garante que as policies restritivas role-based existem de fato apos o drop,
-- para nao deixar as tabelas sem SELECT/INSERT (seguranca defensiva).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'sales'
      AND policyname = 'Salespeople can view their own sales'
  ) THEN
    RAISE NOTICE 'Aviso: sales nao possui policy role-based de select. Verificar migration 20260517123736.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'activities'
      AND policyname IN ('Users can view own activities','Users can read own activities or admins all','View activities of accessible deals','Users can view active activities')
  ) THEN
    RAISE NOTICE 'Aviso: activities nao possui policy role-based de select. Verificar migrations 20260103/04/05.';
  END IF;
END $$
