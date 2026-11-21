-- P0/R1: semear public._internal_secrets (functions_base_url, anon_key, coaching_cron_secret)
--
-- As 3 chaves sao requisito de runtime de 17+ migrations (trg_recording_generate_coaching,
-- trigger_auto_coaching_on_recording, crons internos) mas nunca eram criadas por migration —
-- apenas instrucao comentada em 20261001160000_centralize_internal_edge_calls.sql.
-- Sem elas, os triggers SECURITY DEFINER abortam com 'coaching_cron_secret not set',
-- e os crons internos (X-Cron-Secret) nao autenticam.
--
-- Idempotente: INSERT ... ON CONFLICT DO NOTHING preserva qualquer valor ja presente em
-- producao (no-op). Apenas as chaves AUSENTES recebem seed.
--   * functions_base_url       -> valor canonico (URL publica, nao e segredo)
--   * anon_key / coaching_cron_secret -> valor gerado aleatorio apenas se ausente;
--     o dono pode rotacionar depois para o valor real sem perda (UPDATE + updated_at).

-- Garantia: a tabela existe (no-op onde ja existia) para reexecucao segura.
-- Deve vir ANTES do INSERT abaixo (via aplicacao normal) e das funcoes SECURITY DEFINER.
CREATE TABLE IF NOT EXISTS public._internal_secrets (
  key        text PRIMARY KEY,
  value      text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed apenas das chaves AUSENTES (ON CONFLICT DO NOTHING preserva producao).
--   * functions_base_url -> URL canonica publica.
--   * seeding uma vez so: anon_key e coaching_cron_secret recebem valor gerado
--     (deterministico, sem pgcrypto) que DESBLOQUEIA o runtime: quem invoca e quem
--     valida leem a MESMA tabela, logo o X-Cron-Secret confere e o header apikey
--     e aceito em chamadas internas verify_jwt=false. Valores reais podem ser
--     rotacionados depois pelo dono sem perda (updated_at/to 0s).
INSERT INTO public._internal_secrets (key, value)
SELECT k, v
FROM ( VALUES
  ('functions_base_url', 'https://usyxfpqlsspldubptrdl.supabase.co/functions/v1'),
  ('anon_key', 'anon-' || gen_random_uuid()::text),
  ('coaching_cron_secret', gen_random_uuid()::text || gen_random_uuid()::text)
) AS seed(k, v)
ON CONFLICT (key) DO NOTHING;