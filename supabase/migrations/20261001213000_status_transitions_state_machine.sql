-- Pacote de auditoria 2026-10: máquina de estados explícita para `sales` e
-- `commissions`.
--
-- Antes desta migration o status era um TEXT livre: qualquer write (pipeline
-- board, macros, sync de quote, Bitrix) podia saltar direto de um estado
-- terminal para um inicial (ex.: completed -> pending), sem regra central.
--
-- O que esta migration cria:
--   1. public.status_transitions  — tabela (entity, status_origem, status_destino)
--      com as transições válidas por entidade, seedada com o vocabulário que o
--      código já usa hoje.
--   2. public.is_valid_status_transition(entity, origem, destino) — predicado
--      único usado pelo trigger e pelas RPCs (uma só fonte de verdade).
--   3. Trigger enforce_status_transition em sales e commissions — rejeita
--      transição inválida feita por usuário do app (PostgREST authenticated/anon).
--      Writes de service_role/crons/migrations passam direto (writers de
--      sistema); os caminhos legítimos continuam funcionando e os que ficaram
--      fora estão documentados abaixo.
--   4. RPCs transition_sale_status / transition_commission_status — caminho
--      canônico que valida a transição antes de escrever (rodam como
--      SECURITY DEFINER, então o trigger não se aplica a elas: a validação
--      interna é obrigatória e existe).
--
-- Regras semânticas adotadas (vocabulário real do código: lead, pending,
-- qualified, proposal, negotiation, won, lost, closed, completed, cancelled +
-- aliases legados ganho/Fechado/fechado/prospecting):
--   * estados abertos transitam livremente entre si e para qualquer terminal;
--   * won/completed (e aliases) só saem para closed/cancelled e entre si;
--   * lost e closed podem reabrir para lead/qualified/proposal/negotiation;
--   * cancelled é terminal (não sai para nada);
--   * origem desconhecida (status legado fora do vocabulário) passa — não
--     podemos definir semântica para valor que o código atual não produz;
--   * INSERT não tem origem (qualquer status inicial é permitido).
--
-- Escritas que ficaram FORA do enforcement por serem de sistema (service_role)
-- ou por misturarem status com outros campos (validadas indiretamente pelo
-- trigger quando feitas por usuários):
--   * bitrix24-sync, receive-quote-webhook, sync_quote_to_sale_status (trigger
--     DB): writers de sistema — devem preferir as RPCs quando evoluírem;
--   * MQLQualificationForm / QuickActionsMenu.assignToCloser: update composto
--     (status + ownership) — o trigger valida a parte de status;
--   * commissions: useUpdateCommissionStatus passa a usar
--     transition_commission_status (stamps de approved_/paid_ no servidor).

CREATE TABLE IF NOT EXISTS public.status_transitions (
  entity         text NOT NULL,
  status_origem  text NOT NULL,
  status_destino text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity, status_origem, status_destino)
);

COMMENT ON TABLE public.status_transitions IS
  'Máquina de estados: transições de status válidas por entidade (sales, commissions).';

ALTER TABLE public.status_transitions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'status_transitions'
      AND policyname = 'authenticated read status transitions'
  ) THEN
    CREATE POLICY "authenticated read status transitions"
      ON public.status_transitions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'status_transitions'
      AND policyname = 'admin manager write status transitions'
  ) THEN
    CREATE POLICY "admin manager write status transitions"
      ON public.status_transitions FOR ALL TO authenticated
      USING (public.is_admin_or_manager(auth.uid()))
      WITH CHECK (public.is_admin_or_manager(auth.uid()));
  END IF;
END;
$$;

-- ── Seed: sales ────────────────────────────────────────────────────────────
-- Estados abertos transitam livremente entre si e para os terminais.
WITH open_states(s) AS (
  VALUES ('lead'), ('pending'), ('qualified'), ('proposal'), ('negotiation'), ('draft'), ('prospecting')
), dests(d) AS (
  VALUES ('lead'), ('pending'), ('qualified'), ('proposal'), ('negotiation'),
         ('won'), ('lost'), ('closed'), ('completed'), ('cancelled')
)
INSERT INTO public.status_transitions (entity, status_origem, status_destino)
SELECT 'sales', o.s, d.d FROM open_states o CROSS JOIN dests d
WHERE o.s <> d.d
ON CONFLICT DO NOTHING;

-- Terminais de ganho (won/completed e aliases legados): só pós-venda/cancelamento.
INSERT INTO public.status_transitions (entity, status_origem, status_destino)
SELECT 'sales', o.s, d.d
FROM (VALUES ('won'), ('completed'), ('ganho'), ('Fechado'), ('fechado')) o(s)
CROSS JOIN (VALUES ('won'), ('completed'), ('closed'), ('cancelled')) d(d)
WHERE o.s <> d.d
ON CONFLICT DO NOTHING;

-- lost/closed podem reabrir para estágios abertos ou cancelar; nunca direto a won.
INSERT INTO public.status_transitions (entity, status_origem, status_destino)
SELECT 'sales', o.s, d.d
FROM (VALUES ('lost'), ('closed')) o(s)
CROSS JOIN (VALUES ('lead'), ('qualified'), ('proposal'), ('negotiation'), ('cancelled')) d(d)
ON CONFLICT DO NOTHING;

-- ── Seed: commissions ──────────────────────────────────────────────────────
-- pending -> approved -> paid; pending/approved -> cancelled; paid e cancelled terminais.
INSERT INTO public.status_transitions (entity, status_origem, status_destino)
VALUES
  ('commissions', 'pending',  'approved'),
  ('commissions', 'pending',  'cancelled'),
  ('commissions', 'approved', 'paid'),
  ('commissions', 'approved', 'cancelled')
ON CONFLICT DO NOTHING;

-- ── Predicado canônico ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_valid_status_transition(
  p_entity  text,
  p_origem  text,
  p_destino text
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    -- Sem origem (INSERT/primeira escrita) ou sem mudança: sempre válido.
    WHEN p_origem IS NULL OR p_origem = p_destino THEN true
    -- Origem fora do vocabulário conhecido: legacy passa (não temos semântica).
    WHEN NOT EXISTS (
      SELECT 1 FROM public.status_transitions
      WHERE entity = p_entity AND status_origem = p_origem
    ) THEN true
    ELSE EXISTS (
      SELECT 1 FROM public.status_transitions
      WHERE entity = p_entity
        AND status_origem = p_origem
        AND status_destino = p_destino
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.is_valid_status_transition(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_valid_status_transition(text, text, text) TO authenticated, service_role;

-- ── Trigger: rejeita transição inválida vinda do app ────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Escopo: writes feitos por usuários do app via PostgREST. service_role,
  -- postgres e demais conexões internas são writers de sistema (sync, crons,
  -- migrations) e não são bloqueados — usam as RPCs quando aplicável.
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NULL OR NEW.status IS NULL OR OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_valid_status_transition(TG_TABLE_NAME, OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Transição de status inválida em %: % → %',
      TG_TABLE_NAME, OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_status_transition ON public.sales;
CREATE TRIGGER trg_enforce_status_transition
  BEFORE UPDATE OF status ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_status_transition();

DROP TRIGGER IF EXISTS trg_enforce_status_transition ON public.commissions;
CREATE TRIGGER trg_enforce_status_transition
  BEFORE UPDATE OF status ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_status_transition();

-- ── RPCs canônicas (SECURITY DEFINER: validam dentro, pois o trigger não se
--    aplica a elas — current_user vira o owner) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.transition_sale_status(
  p_sale_id     uuid,
  p_new_status  text,
  p_pipeline_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current text;
BEGIN
  SELECT status INTO v_current
    FROM public.sales
    WHERE id = p_sale_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada: %', p_sale_id;
  END IF;

  IF v_current IS DISTINCT FROM p_new_status
     AND NOT public.is_valid_status_transition('sales', v_current, p_new_status) THEN
    RAISE EXCEPTION 'Transição de status inválida em sales: % → %',
      v_current, p_new_status
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.sales
    SET status      = p_new_status,
        pipeline_id = COALESCE(p_pipeline_id, pipeline_id),
        updated_at  = now()
    WHERE id = p_sale_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.transition_commission_status(
  p_commission_id uuid,
  p_new_status    text,
  p_actor         uuid DEFAULT NULL,
  p_payment_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current text;
BEGIN
  SELECT status INTO v_current
    FROM public.commissions
    WHERE id = p_commission_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Comissão não encontrada: %', p_commission_id;
  END IF;

  IF v_current IS DISTINCT FROM p_new_status
     AND NOT public.is_valid_status_transition('commissions', v_current, p_new_status) THEN
    RAISE EXCEPTION 'Transição de status inválida em commissions: % → %',
      v_current, p_new_status
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.commissions
    SET status        = p_new_status,
        approved_at   = CASE WHEN p_new_status = 'approved' THEN now() ELSE approved_at END,
        approved_by   = CASE WHEN p_new_status = 'approved' THEN COALESCE(p_actor, approved_by) ELSE approved_by END,
        paid_at       = CASE WHEN p_new_status = 'paid' THEN now() ELSE paid_at END,
        paid_by       = CASE WHEN p_new_status = 'paid' THEN COALESCE(p_actor, paid_by) ELSE paid_by END,
        payment_notes = CASE WHEN p_new_status = 'paid' THEN COALESCE(p_payment_notes, payment_notes) ELSE payment_notes END,
        updated_at    = now()
    WHERE id = p_commission_id;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_sale_status(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_sale_status(uuid, text, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.transition_commission_status(uuid, text, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_commission_status(uuid, text, uuid, text) TO authenticated, service_role;
