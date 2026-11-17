-- Liga a gamificacao de combo ao fluxo real de atividades.
--
-- Contexto: a tabela public.combo_tracking existe desde sempre, com RLS e
-- UNIQUE (salesperson_id, combo_date), e estava ORFA: 0 linhas, nenhum
-- consumidor no codigo (git grep retornava so o types.ts). O frontend que a
-- usa (comboService, useCombo, ComboIndicator) estava pronto na branch
-- v2/hidden-features-26101409158c38 e nunca foi integrado, e nada no sistema
-- alimentava a tabela: comboService.registerAction nao era chamado por
-- ninguem, nem naquela branch.
--
-- Decisao: alimentar pelo BANCO, nao pelo frontend. activities ja tem 9
-- triggers, dos quais tr_maintain_streaks, tr_sync_battle_score_activities e
-- tr_performance_update_activities fazem exatamente este tipo de agregacao de
-- gamificacao. Trigger nao depende de cada tela lembrar de chamar o servico.
--
-- Os limiares espelham COMBO_TIERS de src/services/comboService.ts:
--   0 acoes -> tier 0, x1.0 "Normal"      |  3 -> tier 1, x1.5 "Aquecendo"
--   5       -> tier 2, x2.0 "Em Chamas!"  |  8 -> tier 3, x2.5 "Imparavel!"
--   12      -> tier 4, x3.0 "LENDARIO!"
-- O teste src/services/comboService.test.ts trava esses limiares no front.
--
-- A data usa America/Sao_Paulo para casar com toBusinessDate()
-- (supabase/functions/_shared/business-date.ts, BUSINESS_TZ), evitando que uma
-- atividade da noite caia no dia seguinte e zere o combo.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS tr_sync_combo_activities ON public.activities;
--   DROP FUNCTION IF EXISTS public.sync_combo_on_activity();
--   DROP POLICY IF EXISTS "Users can update own combo_tracking" ON public.combo_tracking;

CREATE OR REPLACE FUNCTION public.sync_combo_on_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_date date;
BEGIN
  -- Atividade sem vendedor (importacao, automacao) nao gera combo.
  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_date := (COALESCE(NEW.created_at, now()) AT TIME ZONE 'America/Sao_Paulo')::date;

  -- Uma escrita so: o incremento e a escada de tier saem juntos, sem janela
  -- de corrida entre duas atividades do mesmo vendedor no mesmo instante.
  -- Dentro do ON CONFLICT a linha existente e referenciada por
  -- `combo_tracking.<col>` (sem o schema, que o Postgres nao aceita aqui).
  INSERT INTO public.combo_tracking (
    salesperson_id, combo_date, actions_count, current_multiplier, current_tier, max_tier_today
  )
  VALUES (NEW.salesperson_id, v_date, 1, 1.0, 0, 0)
  ON CONFLICT (salesperson_id, combo_date) DO UPDATE
    SET actions_count = combo_tracking.actions_count + 1,
        current_tier = CASE
                         WHEN combo_tracking.actions_count + 1 >= 12 THEN 4
                         WHEN combo_tracking.actions_count + 1 >= 8  THEN 3
                         WHEN combo_tracking.actions_count + 1 >= 5  THEN 2
                         WHEN combo_tracking.actions_count + 1 >= 3  THEN 1
                         ELSE 0
                       END,
        current_multiplier = CASE
                               WHEN combo_tracking.actions_count + 1 >= 12 THEN 3.0
                               WHEN combo_tracking.actions_count + 1 >= 8  THEN 2.5
                               WHEN combo_tracking.actions_count + 1 >= 5  THEN 2.0
                               WHEN combo_tracking.actions_count + 1 >= 3  THEN 1.5
                               ELSE 1.0
                             END,
        max_tier_today = GREATEST(
                           combo_tracking.max_tier_today,
                           CASE
                             WHEN combo_tracking.actions_count + 1 >= 12 THEN 4
                             WHEN combo_tracking.actions_count + 1 >= 8  THEN 3
                             WHEN combo_tracking.actions_count + 1 >= 5  THEN 2
                             WHEN combo_tracking.actions_count + 1 >= 3  THEN 1
                             ELSE 0
                           END
                         ),
        updated_at = now();

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_combo_on_activity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_sync_combo_activities ON public.activities;
CREATE TRIGGER tr_sync_combo_activities
  AFTER INSERT ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_combo_on_activity();

-- A policy de UPDATE existente cobre so admin/gerente
-- ("Admins can update combo_tracking" com is_admin_or_manager), entao o
-- vendedor comum nao conseguiria incrementar o proprio combo pelo cliente.
-- O trigger acima roda como SECURITY DEFINER e nao depende disto, mas a
-- policy fecha a lacuna para qualquer escrita futura feita pelo app em nome
-- do vendedor, no mesmo padrao do with_check do INSERT que ja existe.
DROP POLICY IF EXISTS "Users can update own combo_tracking" ON public.combo_tracking;
CREATE POLICY "Users can update own combo_tracking"
  ON public.combo_tracking FOR UPDATE TO authenticated
  USING (
    salesperson_id = (
      SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    salesperson_id = (
      SELECT s.id FROM public.salespeople s WHERE s.auth_user_id = auth.uid() LIMIT 1
    )
  );
