-- ONDA 1 (#3): wrappers public para RPCs de sequência movidas ao schema private.
--
-- private.auto_pause_enrollment e private.auto_promote_sequence_winners são
-- chamadas via .rpc() por inbound-email-webhook e sequence-ab-promote — mas
-- o PostgREST só expõe o schema public, então as chamadas falham com 404.
-- Estes wrappers finos reexportam as funções com grants mínimos
-- (service_role, que é o client usado pelas duas edge functions).

CREATE OR REPLACE FUNCTION public.auto_pause_enrollment(_enrollment_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  PERFORM private.auto_pause_enrollment(_enrollment_id, _reason);
END;
$$;

REVOKE ALL ON FUNCTION public.auto_pause_enrollment(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_pause_enrollment(uuid, text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.auto_promote_sequence_winners(_sequence_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
BEGIN
  RETURN private.auto_promote_sequence_winners(_sequence_id);
END;
$$;

REVOKE ALL ON FUNCTION public.auto_promote_sequence_winners(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_promote_sequence_winners(uuid)
  TO service_role;
