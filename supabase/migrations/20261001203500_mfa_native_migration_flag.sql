-- MFA nativo (auth.mfa do GoTrue): flag de migração por usuário.
--
-- Contexto: o fluxo TOTP custom (initialize_totp/verify_and_enable_totp)
-- nunca validava o código de fato — qualquer sequência de 6 dígitos era
-- aceita — e o segredo ficava em plaintext em user_mfa_settings.totp_secret.
-- O setup passa a usar supabase.auth.mfa.enroll/challengeAndVerify (fatores
-- GoTrue, fluxo AAL1→AAL2 que o login já usa).
--
-- Esta migration NÃO dropa totp_secret/backup_codes: usuários com
-- totp_enabled=true precisam re-enrolar no fluxo nativo (o frontend mostra um
-- banner via get_mfa_status.needs_reenrollment). O drop das colunas em
-- plaintext fica para uma migration futura, quando não restarem usuários com
-- needs_reenrollment=true.

ALTER TABLE public.user_mfa_settings
  ADD COLUMN IF NOT EXISTS migrated_to_native_mfa boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_mfa_settings.migrated_to_native_mfa IS
  'true quando o usuário concluiu o enroll TOTP no MFA nativo do Supabase (auth.mfa)';

-- get_mfa_status passa a expor o estado de migração para o banner de re-enroll.
DROP FUNCTION IF EXISTS public.get_mfa_status();

CREATE FUNCTION public.get_mfa_status()
RETURNS TABLE(
  totp_enabled boolean,
  sms_enabled boolean,
  preferred_method text,
  migrated_to_native_mfa boolean,
  needs_reenrollment boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.totp_enabled,
    s.sms_enabled,
    s.preferred_method,
    s.migrated_to_native_mfa,
    (s.totp_enabled AND NOT s.migrated_to_native_mfa) AS needs_reenrollment
  FROM public.user_mfa_settings s
  WHERE s.user_id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.get_mfa_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_mfa_status() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_mfa_status() TO authenticated;
