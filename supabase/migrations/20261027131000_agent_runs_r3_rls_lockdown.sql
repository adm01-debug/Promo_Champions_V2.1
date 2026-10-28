-- SEC R3 (agent_runs/orchestrator): a mig 20261027130000 revogou EXECUTE das
-- RPCs de escrita, mas a policy FOR ALL "System manages agent runs" e a
-- INSERT "Insert actions of own runs" ainda permitiam bypass total do fluxo
-- de aprovacao por escrita DIRETA na tabela:
--   * INSERT de run ja com status='running' e approved_by=<uuid qualquer>;
--   * UPDATE de run propria para status='running' + approved_by forjado;
--   * INSERT de step com status='pending_approval' e tool_name/tool_input
--     arbitrarios -> a retomada do orchestrator executava a mutacao forjada.
-- Como o orchestrator grava tudo via service_role (bypassa RLS) e o frontend
-- so le/cancela, a escrita direta fica restrita ao minimo:
--   * INSERT de run: apenas status='pending', sem approved_by/result;
--   * UPDATE: apenas transicao para 'cancelled' (useCancelAgentRun), sem
--     forjar approved_by (quando setado, so auth.uid()) nem result/
--     completed_at; DELETE deixa de ter policy para authenticated;
--   * INSERT em ai_agent_actions: bloqueado (fluxo legitimo e apenas o RPC
--     append_agent_step via service_role, que bypassa RLS).
-- Aprovacao segue intacta: approve_agent_run (SECURITY DEFINER, dono postgres)
-- bypassa RLS e continua gravando approved_by = auth.uid().

DROP POLICY IF EXISTS "System manages agent runs" ON public.ai_agent_runs;

CREATE POLICY "Insert own pending agent runs"
  ON public.ai_agent_runs FOR INSERT TO authenticated
  WITH CHECK (
    (
      salesperson_id = public.get_current_salesperson_id()
      OR public.has_role(auth.uid(), 'admin')
    )
    AND status = 'pending'
    AND approved_by IS NULL
    AND result IS NULL
    AND completed_at IS NULL
    AND steps = '[]'::jsonb
  );

CREATE POLICY "Cancel own agent runs"
  ON public.ai_agent_runs FOR UPDATE TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    (
      salesperson_id = public.get_current_salesperson_id()
      OR public.has_role(auth.uid(), 'admin')
    )
    AND status = 'cancelled'
    AND result IS NULL
    AND completed_at IS NULL
    AND (approved_by IS NULL OR approved_by = auth.uid())
  );

DROP POLICY IF EXISTS "Insert actions of own runs" ON public.ai_agent_actions;

-- 'executing' entra no CHECK para o claim atomico da retomada: o orchestrator
-- vira pending_approval -> executing e so quem ganha o UPDATE executa o step
-- (idempotencia contra invocacoes concorrentes do mesmo run_id). O drop varre
-- qualquer CHECK que toque a coluna status — o nome canonico e
-- ai_agent_actions_status_check, mas o drop por coluna cobre drift de nome.
DO $$
DECLARE
  cname text;
BEGIN
  FOR cname IN
    SELECT DISTINCT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'ai_agent_actions'
      AND con.contype = 'c'
      AND att.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE public.ai_agent_actions DROP CONSTRAINT %I', cname);
  END LOOP;
END;
$$;

ALTER TABLE public.ai_agent_actions
  ADD CONSTRAINT ai_agent_actions_status_check
  CHECK (status IN ('success','error','pending_approval','skipped','executing'));

-- IDOR no create: o alvo precisa pertencer a carteira do chamador (mesmo
-- criterio do loadEntityForCaller do orchestrator: user_id, salesperson_id/
-- sdr_id/closer_id, carteira em client_portfolio). Admin/manager veem a
-- carteira toda; alvo ausente ou coluna de ownership desconhecida -> nega.
CREATE OR REPLACE FUNCTION public.create_agent_run(
  _agent_type text,
  _goal text DEFAULT NULL,
  _target_entity_type text DEFAULT NULL,
  _target_entity_id uuid DEFAULT NULL,
  _requires_approval boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sp uuid;
  v_id uuid;
  v_row jsonb;
  v_ok boolean;
BEGIN
  v_sp := public.get_current_salesperson_id();
  IF v_sp IS NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No salesperson context';
  END IF;

  IF _target_entity_type IS NOT NULL AND _target_entity_id IS NOT NULL
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    IF _target_entity_type = 'deal' THEN
      SELECT to_jsonb(s) INTO v_row FROM public.sales s WHERE s.id = _target_entity_id;
    ELSIF _target_entity_type = 'client' THEN
      SELECT to_jsonb(c) INTO v_row FROM public.clients c WHERE c.id = _target_entity_id;
    ELSIF _target_entity_type = 'activity' THEN
      SELECT to_jsonb(a) INTO v_row FROM public.activities a WHERE a.id = _target_entity_id;
    ELSIF _target_entity_type = 'lead' AND to_regclass('public.leads') IS NOT NULL THEN
      EXECUTE 'SELECT to_jsonb(l) FROM public.leads l WHERE l.id = $1'
        INTO v_row USING _target_entity_id;
    END IF;

    IF v_row IS NULL THEN
      RAISE EXCEPTION 'Target entity not found';
    END IF;

    v_ok :=
      v_row->>'user_id' = auth.uid()::text
      OR ((v_row->>'salesperson_id') IS NOT NULL AND (v_row->>'salesperson_id')::uuid = v_sp)
      OR ((v_row->>'sdr_id') IS NOT NULL AND (v_row->>'sdr_id')::uuid = v_sp)
      OR ((v_row->>'closer_id') IS NOT NULL AND (v_row->>'closer_id')::uuid = v_sp);

    IF NOT COALESCE(v_ok, false)
       AND _target_entity_type = 'client'
       AND v_sp IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.client_portfolio p
        WHERE p.client_id = _target_entity_id
          AND p.salesperson_id = v_sp
      ) INTO v_ok;
    END IF;

    IF NOT COALESCE(v_ok, false) THEN
      RAISE EXCEPTION 'Target entity not owned by caller';
    END IF;
  END IF;

  INSERT INTO public.ai_agent_runs(salesperson_id, agent_type, goal, target_entity_type, target_entity_id, requires_approval, status)
  VALUES (COALESCE(v_sp, '00000000-0000-0000-0000-000000000000'::uuid), _agent_type, _goal, _target_entity_type, _target_entity_id, _requires_approval, 'pending')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
