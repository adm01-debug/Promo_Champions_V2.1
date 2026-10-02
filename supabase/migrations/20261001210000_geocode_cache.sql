-- 20261001210000_geocode_cache.sql
-- Cache server-side de geocodificação usado pela edge function
-- `geocode-proxy`. Impede que o frontend fale direto com o Nominatim
-- público (vazava nome de empresa/endereço de clientes a partir do
-- navegador de cada usuário) e reduz chamadas ao provider.
--
-- Acesso: somente service_role (a function escreve/lê via service client).
-- Nenhuma policy é criada => RLS bloqueia anon/authenticated por default.

CREATE TABLE IF NOT EXISTS public.geocode_cache (
  query_key   text        PRIMARY KEY,           -- consulta normalizada (lower, trim, espaços colapsados)
  lat         double precision,
  lng         double precision,
  found       boolean     NOT NULL DEFAULT true, -- false = provider não resolveu (negative cache)
  provider    text        NOT NULL DEFAULT 'nominatim',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.geocode_cache ENABLE ROW LEVEL SECURITY;

-- Sem policies: somente service_role (bypassa RLS) acessa.
REVOKE ALL ON public.geocode_cache FROM anon, authenticated;

CREATE INDEX IF NOT EXISTS geocode_cache_created_at_idx
  ON public.geocode_cache (created_at);
