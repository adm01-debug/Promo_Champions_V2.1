-- Resgate de origin/audit/rlx-security-fix (20260725000003), REESCRITO.
--
-- O que a branch queria resolver, e continua valendo:
--   F1 [ALTO]  winloss-webhook-dispatcher faz POST para a url gravada em
--              winloss_webhook_subscriptions sem validar o destino. Quem
--              consegue cadastrar assinatura escolhe para onde o servidor
--              dispara, incluindo 169.254.169.254 (metadata de nuvem),
--              localhost e redes internas. O dispatcher roda com service_role,
--              logo bypassa RLS.
--   F2 [MEDIO] nao ha rate-limit por assinatura: um destino mal configurado
--              transforma a infraestrutura em proxy de DDoS.
--
-- POR QUE NAO PORTEI O SQL DA BRANCHE COMO ESTAVA -- tres defeitos reais:
--   1. Allowlist e blocklist na MESMA tabela, sem coluna que as distinga, e a
--      funcao tenta separa-las por lista literal de patterns. Logo
--      169.254.169.254 fica cadastrado na tabela de "dominios permitidos".
--   2. O passo 2 da funcao usa o alias wd numa subquery E num FROM externo, e
--      o SELECT ... INTO devolveria varias linhas: lanca excecao em execucao.
--      O passo 1 faz wd.pattern::INET sobre patterns como 'localhost' e
--      'metadata'; o EXCEPTION WHEN others engole o erro e a blocklist e
--      pulada inteira, inclusive para host que E ip.
--   3. O wildcard monta LIKE '%.' || '*.bitrix24.com', ou seja
--      '%.*.bitrix24.com', que nunca casa. E allowlist vazia resulta em
--      "permite tudo" (fail-open), o oposto do objetivo.
--
-- DECISAO DE DESIGN: o parse da URL sai do SQL. A edge function usa
-- new URL(url) -- que trata userinfo, porta, caixa, ponto final e IPv6 por
-- construcao -- e passa o HOSTNAME pronto. Validar URL com regex em plpgsql e
-- a parte mais facil de furar (https://permitido.com@malicioso.com/ tem host
-- malicioso.com). A funcao aqui recebe host, nao url.
--
-- Fail-CLOSED de proposito: allowlist vazia bloqueia tudo. Conferido antes de
-- escrever: a unica linha de winloss_webhook_subscriptions tem host
-- 'test.invalid' e active = false, ou seja NAO existe integracao viva para
-- derrubar. Dominio legitimo novo passa a exigir uma linha aqui -- que e
-- justamente o ponto de uma allowlist.

-- =============================================================================
-- 1. Allowlist de destino (somente ALLOW; a blocklist e codigo, nao dado)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_allowed_domains (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern     text NOT NULL,
  description text,
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  -- host exato ("api.acme.com") ou sufixo com um nivel ("*.acme.com").
  CONSTRAINT webhook_allowed_domains_pattern_formato
    CHECK (pattern = lower(pattern) AND pattern !~ '\s' AND pattern <> ''
           AND (pattern ~ '^[a-z0-9.-]+$' OR pattern ~ '^\*\.[a-z0-9.-]+$'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_webhook_allowed_domains_pattern
  ON public.webhook_allowed_domains (pattern);

ALTER TABLE public.webhook_allowed_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage webhook_allowed_domains"
  ON public.webhook_allowed_domains;
CREATE POLICY "Admins manage webhook_allowed_domains"
  ON public.webhook_allowed_domains FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS set_updated_at_webhook_allowed_domains
  ON public.webhook_allowed_domains;
CREATE TRIGGER set_updated_at_webhook_allowed_domains
  BEFORE UPDATE ON public.webhook_allowed_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.webhook_allowed_domains IS
  'Allowlist de hosts para webhook de saida. Vazia = nada e permitido '
  '(fail-closed). Gerida por admin. A blocklist de rede privada/metadata nao '
  'fica aqui: esta no corpo de is_webhook_host_allowed().';

-- =============================================================================
-- 2. is_webhook_host_allowed(host) -- recebe HOSTNAME, nao URL
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_webhook_host_allowed(p_host text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host text;
  v_ip   inet;
BEGIN
  IF p_host IS NULL THEN RETURN false; END IF;

  -- normaliza: caixa baixa, sem espaco, sem ponto final, sem colchete de IPv6
  v_host := lower(btrim(p_host));
  v_host := regexp_replace(v_host, '\.$', '');
  v_host := regexp_replace(v_host, '^\[|\]$', '', 'g');

  IF v_host = '' OR v_host ~ '[\s/@:]' THEN
    -- host com separador de URL dentro nao foi parseado: recusa
    RETURN false;
  END IF;

  -- 1) BLOCKLIST por nome (codigo, nao dado)
  IF v_host IN ('localhost', 'metadata', 'metadata.google.internal',
                'instance-data', 'metadata.goog')
     OR v_host LIKE '%.localhost'
     OR v_host LIKE '%.internal'
     OR v_host LIKE '%.local'
  THEN
    RETURN false;
  END IF;

  -- 2) BLOCKLIST por faixa de rede, quando o host E um literal de IP
  BEGIN
    v_ip := v_host::inet;
  EXCEPTION WHEN others THEN
    v_ip := NULL;
  END;

  IF v_ip IS NOT NULL THEN
    -- IP literal como destino de webhook nunca e legitimo aqui
    RETURN false;
  END IF;

  -- 3) ALLOWLIST: host exato, ou sufixo de um pattern '*.dominio'
  RETURN EXISTS (
    SELECT 1
    FROM public.webhook_allowed_domains d
    WHERE d.pattern = v_host
       OR (d.pattern LIKE '*.%'
           AND v_host LIKE '%' || substring(d.pattern from 2)
           AND length(v_host) > length(d.pattern) - 2)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_webhook_host_allowed(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_webhook_host_allowed(text)
  TO service_role, authenticated;

COMMENT ON FUNCTION public.is_webhook_host_allowed(text) IS
  'Recebe o HOSTNAME ja parseado (new URL(u).hostname no chamador), nunca a '
  'URL crua. Recusa literal de IP, loopback, metadata de nuvem e sufixos '
  'internos; depois exige match na allowlist. Allowlist vazia = false.';

-- =============================================================================
-- 3. Rate-limit por assinatura
-- =============================================================================
ALTER TABLE public.winloss_webhook_subscriptions
  ADD COLUMN IF NOT EXISTS rate_limit_per_minute integer NOT NULL DEFAULT 60;

ALTER TABLE public.winloss_webhook_subscriptions
  ADD COLUMN IF NOT EXISTS rate_limit_window_seconds integer NOT NULL DEFAULT 60;

ALTER TABLE public.winloss_webhook_subscriptions
  DROP CONSTRAINT IF EXISTS winloss_webhook_subscriptions_rate_limit_valido;
ALTER TABLE public.winloss_webhook_subscriptions
  ADD CONSTRAINT winloss_webhook_subscriptions_rate_limit_valido
  CHECK (rate_limit_per_minute > 0 AND rate_limit_window_seconds > 0);

CREATE TABLE IF NOT EXISTS public.webhook_dispatch_rate (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL
                  REFERENCES public.winloss_webhook_subscriptions(id)
                  ON DELETE CASCADE,
  dispatched_at   timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_dispatch_rate_sub_ts
  ON public.webhook_dispatch_rate (subscription_id, dispatched_at DESC);

ALTER TABLE public.webhook_dispatch_rate ENABLE ROW LEVEL SECURITY;
-- Sem policy: estado interno de contagem, acessivel so por service_role
-- (que bypassa RLS). Nao e dado de usuario.

DROP TRIGGER IF EXISTS set_updated_at_webhook_dispatch_rate
  ON public.webhook_dispatch_rate;
CREATE TRIGGER set_updated_at_webhook_dispatch_rate
  BEFORE UPDATE ON public.webhook_dispatch_rate
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Consome uma vaga da janela. Retorna true se o disparo pode seguir.
-- Registra o disparo na mesma chamada: contar e reservar precisam ser atomicos,
-- senao dois dispatchers simultaneos passam juntos pelo limite.
CREATE OR REPLACE FUNCTION public.check_webhook_rate_limit(_subscription_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit  integer;
  v_window integer;
  v_usado  integer;
BEGIN
  SELECT s.rate_limit_per_minute, s.rate_limit_window_seconds
    INTO v_limit, v_window
  FROM public.winloss_webhook_subscriptions s
  WHERE s.id = _subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN false; END IF;

  DELETE FROM public.webhook_dispatch_rate r
  WHERE r.subscription_id = _subscription_id
    AND r.dispatched_at < now() - make_interval(secs => v_window * 10);

  SELECT count(*) INTO v_usado
  FROM public.webhook_dispatch_rate r
  WHERE r.subscription_id = _subscription_id
    AND r.dispatched_at > now() - make_interval(secs => v_window);

  IF v_usado >= v_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.webhook_dispatch_rate (subscription_id) VALUES (_subscription_id);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_webhook_rate_limit(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_webhook_rate_limit(uuid) TO service_role;

COMMENT ON FUNCTION public.check_webhook_rate_limit(uuid) IS
  'Consome uma vaga da janela da assinatura e registra o disparo na mesma '
  'chamada, sob FOR UPDATE da assinatura: contar e reservar sao atomicos. '
  'false = estourou o limite, o disparo deve ser abortado.';
