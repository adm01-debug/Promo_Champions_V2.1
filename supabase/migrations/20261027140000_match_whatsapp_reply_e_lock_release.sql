-- Remediação R3 de integrações (bitrix24-sync / whatsapp-inbound-webhook):
--
-- 1) release_edge_job_lock passa a exigir o request_id do detentor: um run
--    morto que perdeu o lease por TTL não pode mais apagar o lock do run que
--    o herdou (antes o DELETE era incondicional por job_name). A assinatura
--    antiga é removida para não restar a variante permissiva.
-- 2) match_whatsapp_reply_to_enrollment: casa resposta WhatsApp (Evolution)
--    com a inscrição pausável — espelha match_reply_to_enrollment do caminho
--    de e-mail: status 'active'/'scheduled', não auto-pausada e iniciada
--    antes da resposta. Resposta tardia para enrollment já
--    completed/exited/failed não a reverte para 'paused'. O match de número
--    normaliza to_number para dígitos (regexp_replace): linhas antigas de
--    outbound_messages podem guardar máscara ('+55 (11) 9xxxx-xxxx').

DROP FUNCTION IF EXISTS public.release_edge_job_lock(text);

CREATE OR REPLACE FUNCTION public.release_edge_job_lock(
  _job_name text,
  _request_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_job_locks
   WHERE job_name = _job_name
     AND request_id = _request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.release_edge_job_lock(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_edge_job_lock(text, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.match_whatsapp_reply_to_enrollment(
  _from_digits text,
  _owner_ids uuid[] DEFAULT NULL,
  _received_at timestamptz DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enrollment_id uuid;
  _digits text;
BEGIN
  _digits := regexp_replace(COALESCE(_from_digits, ''), '[^0-9]', '', 'g');
  IF length(_digits) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.outbound_messages om ON om.enrollment_id = se.id
  WHERE om.channel = 'whatsapp'
    AND om.provider = 'evolution'
    AND regexp_replace(om.to_number, '[^0-9]', '', 'g') = _digits
    AND se.status IN ('active', 'scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY
    -- Preferência pelo dono da credencial da instância que recebeu a
    -- resposta (mesmo critério do fallback no webhook); depois o outbound
    -- mais recente para o número.
    CASE WHEN _owner_ids IS NOT NULL AND om.owner_id = ANY(_owner_ids)
         THEN 0 ELSE 1 END,
    om.created_at DESC
  LIMIT 1;

  RETURN _enrollment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.match_whatsapp_reply_to_enrollment(text, uuid[], timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_whatsapp_reply_to_enrollment(text, uuid[], timestamptz)
  TO service_role;
