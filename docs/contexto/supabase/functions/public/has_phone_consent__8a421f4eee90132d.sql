CREATE OR REPLACE FUNCTION public.has_phone_consent(p_phone text, p_purpose text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT
    -- o telefone precisa resolver para pelo menos um titular
    EXISTS (
      SELECT 1
      FROM public.clients cl
      WHERE cl.phone IS NOT NULL
        AND cl.deleted_at IS NULL
        AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
    )
    -- e nenhum titular com o mesmo telefone pode estar sem consentimento:
    -- consentir por proxy gravaria a chamada de quem nunca aceitou.
    AND NOT EXISTS (
      SELECT 1
      FROM public.clients cl
      WHERE cl.phone IS NOT NULL
        AND cl.deleted_at IS NULL
        AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
        AND NOT (
          (cl.email IS NOT NULL AND public.has_active_consent(cl.email, p_purpose))
          OR EXISTS (
            SELECT 1
            FROM public.consent_records c
            WHERE c.subject_client_id = cl.id
              AND c.purpose = p_purpose
              AND c.revoked_at IS NULL
          )
        )
    );
$function$
