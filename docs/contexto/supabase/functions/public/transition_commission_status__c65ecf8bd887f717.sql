CREATE OR REPLACE FUNCTION public.transition_commission_status(p_commission_id uuid, p_new_status text, p_actor uuid DEFAULT NULL::uuid, p_payment_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- SECURITY DEFINER ignora RLS: replica a regra das policies de commissions
  -- (somente admin/manager modifica; vendedor só lê as próprias). Chamadas
  -- via service_role ou pg_cron (auth.uid() IS NULL) seguem autorizadas.
  IF auth.uid() IS NOT NULL AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorized' USING ERRCODE = 'insufficient_privilege';
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
$function$
