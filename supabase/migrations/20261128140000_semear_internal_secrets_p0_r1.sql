-- P0/R1: semeia public._internal_secrets (functions_base_url, anon_key, coaching_cron_secret)
--
-- RECUPERADO da PR #602 (fechada sem merge). Nenhuma migration do repo cria essas
-- chaves — todas apenas as LEEM:
--   * 20261001160000_centralize_internal_edge_calls.sql:8-10 (documenta o pre-requisito)
--   * 20261117070000_reconcilia_objetos_orfaos_producao.sql:186-204 (auto-coaching)
--   * 20261027210000_r3_db_kpis_fixes.sql:554-557 (broadcast_sale_completed)
--   * supabase/schema.sql:36482-36484 ("precisam ser inseridas depois")
-- Sem as chaves a automacao interna (coaching automatico e crons com X-Cron-Secret)
-- nao dispara: o trigger atual sai com RAISE WARNING e o job some sem erro visivel.
--
-- Por que os valores gerados funcionam:
--   * coaching_cron_secret — quem INVOCA (trigger, lendo a tabela) e quem VALIDA
--     (edge functions, ex. campaign-health-alert/index.ts:48-57) leem a MESMA linha
--     de _internal_secrets, logo um valor novo e autoconsistente.
--   * anon_key — aqui so precisa ser nao-nula: as chamadas internas autenticam por
--     X-Cron-Secret e o alvo generate-coaching-actions passa a ser deployado com
--     verify_jwt = false (supabase/config.toml), mesmo padrao ja usado por
--     email-bulk-retry e campaign-health-alert. Nenhuma chave real entra neste
--     arquivo; se o dono preferir a chave canonica, basta UPDATE nesta tabela.
--   * functions_base_url — URL publica do projeto, nao e segredo.
--
-- Idempotente: ON CONFLICT DO NOTHING preserva qualquer valor ja existente em producao.

CREATE TABLE IF NOT EXISTS public._internal_secrets (
    key        text        NOT NULL PRIMARY KEY,
    value      text        NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public._internal_secrets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny all access to _internal_secrets" ON public._internal_secrets;
CREATE POLICY "Deny all access to _internal_secrets" ON public._internal_secrets
  AS PERMISSIVE FOR ALL TO authenticated, anon
  USING (false)
  WITH CHECK (false);

INSERT INTO public._internal_secrets (key, value)
SELECT k, v
FROM ( VALUES
  ('functions_base_url', 'https://usyxfpqlsspldubptrdl.supabase.co/functions/v1'),
  ('anon_key', 'anon-' || gen_random_uuid()::text),
  ('coaching_cron_secret',
   replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
) AS seed(k, v)
ON CONFLICT (key) DO NOTHING;