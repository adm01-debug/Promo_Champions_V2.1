-- match_reply_to_enrollment consultava sales.email, coluna que não existe.
--
-- Causa: a função resolve a inscrição de um lead com
--   JOIN public.sales s ON s.id = se.contact_id AND se.contact_type = 'lead'
--   WHERE lower(s.email) = lower(_contact_email)
-- e public.sales tem apenas (id, status, client_id) entre essas colunas. Em
-- plpgsql o erro é de plano, então estoura em TODA chamada, independentemente
-- de haver inscrição. Medido em produção:
--   SELECT public.match_reply_to_enrollment('<email real>', now())
--     -> 42703 column s.email does not exist
--        CONTEXT: PL/pgSQL function match_reply_to_enrollment(text,timestamptz) line 10
--
-- Efeito: o inbound-email-webhook chama essa função para toda resposta, bounce,
-- reclamação e descadastro que o provedor entrega. Com o 42703, o webhook cai no
-- catch e devolve 500 — ou seja, nenhuma cadência é pausada por resposta, por
-- bounce ou por descadastro, e o provedor fica reentregando o evento.
--
-- Correção: o e-mail de um lead mora no cliente ligado. `sales` é a tabela de
-- leads/negócios (status='lead' para lead) e aponta para public.clients por
-- client_id — é exatamente assim que o sequence-runner monta o contexto de
-- contato de um lead ("Leads vivem na tabela sales; dados de contato vêm do
-- clients vinculado"). Então o JOIN passa por clients.
--
-- O resto da função não muda: mesmos filtros de status, auto_paused_at e
-- started_at, mesma ordem, mesma precedência (lead antes de cliente), mesma
-- assinatura, STABLE e SECURITY DEFINER preservados.
--
-- Fora do escopo desta correção (vai para "Próximos passos"): inscrição com
-- contact_type = 'contact' (account_contacts, que TEM coluna email) continua sem
-- ramo nesta função, então resposta de um contato de conta não pausa a cadência.

CREATE OR REPLACE FUNCTION public.match_reply_to_enrollment(
  _contact_email text,
  _received_at   timestamp with time zone DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

  RETURN _enrollment_id;
END;
$function$;

DO $$
DECLARE v_resultado uuid; v_email text;
BEGIN
  SELECT email INTO v_email FROM public.clients
   WHERE email IS NOT NULL AND email <> '' AND deleted_at IS NULL LIMIT 1;
  -- Prova direta: a chamada que hoje estoura 42703 passa a executar.
  v_resultado := public.match_reply_to_enrollment(v_email, now());
  RAISE NOTICE 'match_reply_to_enrollment executou; retorno = %', coalesce(v_resultado::text, 'NULL (nenhuma inscricao ativa)');
  IF public.match_reply_to_enrollment(NULL, now()) IS NOT NULL THEN
    RAISE EXCEPTION 'guarda de e-mail nulo quebrada';
  END IF;
END $$;
