-- Hardening do step-up de re-autenticação (reauthentication_requests).
--
-- Antes: a policy "Users can update own reauth requests" permitia que qualquer
-- cliente autenticado marcasse verified=true direto na tabela, sem provar
-- posse da senha — o step-up era decorativo.
--
-- Agora: o cliente perde UPDATE na tabela. verified só é marcado pela RPC
-- SECURITY DEFINER verify_reauth_request, que exige:
--   * request pertencente ao chamador, ainda pendente e não expirada;
--   * JWT recém-emitido (iat < 5min) — produzido pelo signInWithPassword que
--     valida a senha no GoTrue imediatamente antes da chamada da RPC.
-- A validação de senha em si não acontece no Postgres (não há como consultar
-- o GoTrue a partir de SQL sem expor credenciais); o iat fresco é o
-- equivalente server-side do "auth_time < 5min".

DROP POLICY IF EXISTS "Users can update own reauth requests" ON public.reauthentication_requests;

-- O frontend cancela requests pendentes via DELETE (cancelRequest) — a policy
-- de DELETE nunca existiu e o cancelamento falhava silenciosamente.
DROP POLICY IF EXISTS "Users can delete own reauth requests" ON public.reauthentication_requests;
CREATE POLICY "Users can delete own reauth requests"
  ON public.reauthentication_requests FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.verify_reauth_request(
  p_request_id uuid,
  p_password text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.reauthentication_requests%ROWTYPE;
  v_iat numeric;
BEGIN
  -- p_password faz parte do contrato, mas NÃO é lido nem persistido: a senha
  -- é validada no GoTrue pelo signInWithPassword do cliente, e o reflexo
  -- server-side disso é o iat fresco do JWT verificado abaixo.
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO v_request
  FROM public.reauthentication_requests
  WHERE id = p_request_id
    AND user_id = auth.uid();

  IF NOT FOUND OR v_request.verified OR v_request.expires_at <= now() THEN
    RETURN false;
  END IF;

  v_iat := nullif(auth.jwt() ->> 'iat', '')::numeric;
  IF v_iat IS NULL OR v_iat < extract(epoch from now() - interval '5 minutes') THEN
    RETURN false;
  END IF;

  UPDATE public.reauthentication_requests
  SET verified = true,
      verified_at = now()
  WHERE id = p_request_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_reauth_request(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_reauth_request(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.verify_reauth_request(uuid, text) TO authenticated;
