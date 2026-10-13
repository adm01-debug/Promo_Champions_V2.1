-- ONDA 1 (#3): wrappers public para RPCs de sequência movidas ao schema private.
--
-- private.auto_pause_enrollment e private.auto_promote_sequence_winners são
-- chamadas via .rpc() por inbound-email-webhook e sequence-ab-promote — mas
-- o PostgREST só expõe o schema public, então as chamadas falham com 404.
-- Estes wrappers reexportam as funções preservando o contrato original e a
-- configuração por-sequência (auto_pause_on_reply / auto_pause_on_bounce).

CREATE OR REPLACE FUNCTION public.auto_pause_enrollment(_enrollment_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, private
AS $$
DECLARE
  v_sequence_flag boolean;
  v_enr record;
BEGIN
  -- Respeita os toggles da sequência: o caminho do trigger de atividades
  -- já filtra por eles, e o webhook não pode pausar cadências cujo dono
  -- desativou o auto-pause para aquele motivo. O registro de engajamento
  -- NÃO pode ser pulado junto — reply sempre alimenta o score do contato.
  IF _reason IN ('reply_detected', 'bounce') THEN
    SELECT CASE _reason
             WHEN 'reply_detected' THEN s.auto_pause_on_reply
             ELSE s.auto_pause_on_bounce
           END
      INTO v_sequence_flag
    FROM public.sequence_enrollments se
    JOIN public.sequences s ON s.id = se.sequence_id
    WHERE se.id = _enrollment_id;

    IF v_sequence_flag IS NOT NULL AND NOT v_sequence_flag THEN
      IF _reason = 'reply_detected' THEN
        SELECT id, contact_id, contact_type INTO v_enr
        FROM public.sequence_enrollments
        WHERE id = _enrollment_id;
        IF v_enr.id IS NOT NULL THEN
          BEGIN
            PERFORM public.record_engagement_signal(v_enr.contact_id, v_enr.contact_type, 'reply', now());
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
          BEGIN
            PERFORM public.recompute_engagement_score(v_enr.contact_id, v_enr.contact_type);
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END IF;
      END IF;
      RETURN;
    END IF;
  END IF;

  PERFORM private.auto_pause_enrollment(_enrollment_id, _reason);
END;
$$;

REVOKE ALL ON FUNCTION public.auto_pause_enrollment(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_pause_enrollment(uuid, text)
  TO service_role;

-- O contrato da função privada é TABLE(step_id, promoted_label) e o corpo
-- exige papel admin/manager via has_role(auth.uid()) — o EXECUTE a
-- authenticated é seguro porque a checagem de papel é interna. Precisa ser
-- SECURITY DEFINER: authenticated não tem USAGE no schema private (hardening
-- 20260619), então o wrapper INVOKER falhava com permission denied.
CREATE OR REPLACE FUNCTION public.auto_promote_sequence_winners(_sequence_id uuid)
RETURNS TABLE(step_id uuid, promoted_label text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM private.auto_promote_sequence_winners(_sequence_id);
END;
$$;

REVOKE ALL ON FUNCTION public.auto_promote_sequence_winners(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auto_promote_sequence_winners(uuid)
  TO authenticated, service_role;
