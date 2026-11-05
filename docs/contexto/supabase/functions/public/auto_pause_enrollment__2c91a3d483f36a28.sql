CREATE OR REPLACE FUNCTION public.auto_pause_enrollment(_enrollment_id uuid, _reason text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'private'
AS $function$
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
$function$
