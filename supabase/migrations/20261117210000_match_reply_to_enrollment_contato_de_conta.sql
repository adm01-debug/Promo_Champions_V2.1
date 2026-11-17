-- match_reply_to_enrollment ignorava o terceiro tipo de contato que o próprio
-- banco aceita.
--
-- sequence_enrollments_contact_type_check permite
-- ('lead','client','contact'), mas a função só tinha ramo para 'lead' e
-- 'client'. Resposta de e-mail de um contato de conta (public.account_contacts)
-- não encontrava inscrição nenhuma, então a cadência seguia disparando para
-- quem já tinha respondido.
--
-- Este arquivo acrescenta o ramo 'contact' DEPOIS dos dois existentes: a
-- precedência lead -> client continua idêntica, e nenhuma resposta que já
-- casava passa a casar diferente. Mesma assinatura, mesmo STABLE
-- SECURITY DEFINER, mesmos filtros (status, auto_paused_at, started_at) e
-- mesma ordenação por started_at DESC.
--
-- Fora do escopo, de propósito: public.record_engagement_signal aceita só
-- 'lead'|'client'. O sinal de resposta do inbound-email-webhook resolve o
-- contato por public.clients, então e-mail de account_contacts simplesmente não
-- gera sinal (retorna false, sem erro) — a cadência pausa, o score não muda.
CREATE OR REPLACE FUNCTION public.match_reply_to_enrollment(
  _contact_email text,
  _received_at timestamp with time zone DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _enrollment_id uuid;
BEGIN
  IF _contact_email IS NULL OR length(trim(_contact_email)) = 0 THEN
    RETURN NULL;
  END IF;

  -- Lead: public.sales não guarda e-mail; o contato é o cliente vinculado.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.sales s   ON s.id = se.contact_id AND se.contact_type = 'lead'
  JOIN public.clients c ON c.id = s.client_id
  WHERE lower(c.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  IF _enrollment_id IS NOT NULL THEN
    RETURN _enrollment_id;
  END IF;

  -- Cliente: e-mail direto na própria tabela.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.clients c ON c.id = se.contact_id AND se.contact_type = 'client'
  WHERE lower(c.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  IF _enrollment_id IS NOT NULL THEN
    RETURN _enrollment_id;
  END IF;

  -- Contato de conta: e-mail em public.account_contacts.
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.account_contacts ac
    ON ac.id = se.contact_id AND se.contact_type = 'contact'
  WHERE lower(ac.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  RETURN _enrollment_id;
END;
$function$;

-- Prova: a função executa (plano válido para os três ramos, inclusive o novo
-- JOIN em account_contacts) e a guarda de e-mail nulo continua valendo.
DO $$
DECLARE
  _r uuid;
BEGIN
  _r := public.match_reply_to_enrollment('nao-existe@exemplo.invalid', now());
  IF _r IS NOT NULL THEN
    RAISE EXCEPTION 'e-mail inexistente deveria devolver NULL, devolveu %', _r;
  END IF;

  IF public.match_reply_to_enrollment(NULL, now()) IS NOT NULL THEN
    RAISE EXCEPTION 'e-mail NULL deveria devolver NULL';
  END IF;

  IF public.match_reply_to_enrollment('   ', now()) IS NOT NULL THEN
    RAISE EXCEPTION 'e-mail em branco deveria devolver NULL';
  END IF;
END $$;
