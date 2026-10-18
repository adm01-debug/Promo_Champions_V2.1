-- LGPD: checagens por telefone para voz/WhatsApp/SMS (auditoria top 25 #17)
--
-- As checagens de LGPD já existentes são por e-mail:
--   public.has_active_consent(email, purpose)
--   public.is_email_opted_out(email)
-- Os fluxos de voz (twilio-call-twiml / twilio-click-to-call) e de
-- WhatsApp/SMS (send-multichannel-message) só conhecem o TELEFONE do
-- titular. Estas helpers resolvem telefone -> clientes(s) usando o mesmo
-- match dígito-a-dígito de upsert_client_from_quote
-- (regexp_replace(phone, '\D', '', 'g')) e delegam às RPCs existentes.
--
-- 1. public.has_phone_consent(p_phone, p_purpose): TRUE quando o telefone
--    resolve para UM ÚNICO titular identificável (cliente com e-mail ou
--    consent_records por subject_client_id) e esse titular tem consentimento
--    ativo. Telefone compartilhado entre clientes distintos NÃO consente —
--    consentir por proxy gravaria a chamada de um titular que nunca aceitou.
-- 2. public.is_recipient_opted_out(p_phone): TRUE quando algum titular com
--    esse telefone (em clients OU account_contacts) tem e-mail na lista de
--    supressão (email_opt_outs). Cobrir só clients deixaria contatos de
--    comitê (account_contacts) suprimidos recebendo WhatsApp/SMS.
--
-- Padrão hardening: SECURITY INVOKER (o chamador service_role enxerga
-- todas as linhas; usuário autenticado fica limitado pelo RLS) +
-- grants mínimos.

CREATE OR REPLACE FUNCTION public.has_phone_consent(
  p_phone text,
  p_purpose text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients cl
    WHERE cl.phone IS NOT NULL
      AND cl.deleted_at IS NULL
      AND regexp_replace(cl.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      AND (
        (cl.email IS NOT NULL AND public.has_active_consent(cl.email, p_purpose))
        OR EXISTS (
          SELECT 1
          FROM public.consent_records c
          WHERE c.subject_client_id = cl.id
            AND c.purpose = p_purpose
            AND c.revoked_at IS NULL
        )
      )
    -- Telefone compartilhado entre clientes distintos não consente: o
    -- consentimento de A não autoriza gravar a chamada de B.
    HAVING count(DISTINCT cl.id) = 1
  );
$$;

REVOKE ALL ON FUNCTION public.has_phone_consent(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_phone_consent(text, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_recipient_opted_out(
  p_phone text
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients cl
    WHERE cl.phone IS NOT NULL
      AND cl.email IS NOT NULL
      AND cl.deleted_at IS NULL
      AND regexp_replace(cl.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      AND public.is_email_opted_out(cl.email)
  )
  OR EXISTS (
    SELECT 1
    FROM public.account_contacts ac
    WHERE ac.phone IS NOT NULL
      AND ac.email IS NOT NULL
      AND regexp_replace(ac.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      AND public.is_email_opted_out(ac.email)
  );
$$;

REVOKE ALL ON FUNCTION public.is_recipient_opted_out(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_recipient_opted_out(text) TO authenticated, service_role;
