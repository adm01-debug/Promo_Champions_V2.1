-- Pacote auditoria DB/integridade — [OPTLOCK] transição de status com optimistic locking
--
-- Estende public.transition_sale_status com p_expected_version: quando informado,
-- a versão atual da linha (coluna version, pacote OPTLOCK) precisa casar — senão
-- levanta 'optimistic_lock_conflict'. O frontend mapeia esse erro para o conflito
-- 409 (toast + refetch). Sem o parâmetro, comportamento idêntico à versão anterior.
--
-- A sobrecarga com 4 parâmetros convive com a de 3 (assinaturas distintas).

CREATE OR REPLACE FUNCTION public.transition_sale_status(
  p_sale_id           uuid,
  p_new_status        text,
  p_pipeline_id       uuid    DEFAULT NULL,
  p_expected_version  integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current text;
  v_version integer;
BEGIN
  SELECT status, version INTO v_current, v_version
    FROM public.sales
    WHERE id = p_sale_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada: %', p_sale_id;
  END IF;

  IF p_expected_version IS NOT NULL
     AND v_version IS DISTINCT FROM p_expected_version THEN
    RAISE EXCEPTION 'optimistic_lock_conflict: versão esperada %, versão atual %',
      p_expected_version, v_version;
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

COMMENT ON FUNCTION public.transition_sale_status(uuid, text, uuid, integer) IS
  'Transição de status via máquina de estados; p_expected_version aplica optimistic locking (conflito → optimistic_lock_conflict).';
