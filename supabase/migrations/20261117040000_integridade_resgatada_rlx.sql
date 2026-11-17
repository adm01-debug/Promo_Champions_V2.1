-- Resgate das constraints de integridade de origin/audit/rlx-security-fix que
-- (a) faltam de fato em producao e (b) os dados atuais permitem criar.
--
-- Aquela branch tinha 16 migrations escritas contra um schema antigo (deals,
-- roles, user_roles.role_id, products.active, activities.user_id,
-- quotes.total_amount) e com SQL que nao compila -- ADD CONSTRAINT ... UNIQUE
-- ... WHERE nao e sintaxe valida, UNIQUE parcial exige CREATE UNIQUE INDEX.
-- Aqui vai so o que sobrevive a conferencia contra o banco real, reescrito.
--
-- CONFERIDO EM PRODUCAO ANTES DE ESCREVER:
--
-- 1) Os 3 CHECKs nao existem e nao ha nenhuma linha que os violaria:
--      activities.duration_minutes < 0  -> 0 linhas
--      pipeline_stages.stage_order < 0  -> 0 linhas
--      quotes.subtotal < 0              -> 0 linhas
--    Por isso entram VALIDADOS, nao NOT VALID: ja valem para o historico.
--    Toleram NULL de proposito (as 3 colunas sao nullable).
--
-- 2) Dos 7 UNIQUE parciais que a branch propunha, 3 JA ESTAO COBERTOS e ficam
--    de fora para nao criar indice duplicado:
--      clients.email  -> ux_clients_email  (lower(email), deleted_at IS NULL)
--      clients.phone  -> ux_clients_phone  (phone <> '', deleted_at IS NULL)
--      products.sku   -> products_sku_key  (UNIQUE TOTAL, mais forte que a
--                        versao parcial da branch)
--    Os 4 que faltam entram aqui. Duplicatas entre linhas ativas: 0 em todos
--    (suppliers.cnpj 0, suppliers.email 0, teams.name 0, quotes.quote_number 0).
--
-- 3) webauthn_credentials.user_id e webauthn_challenges.user_id nao tem FK
--    nenhuma (0 constraints de tipo 'f' nas duas tabelas). Orfaos: 0 e 0; as
--    duas tabelas estao vazias hoje, entao a FK entra sem risco. ON DELETE
--    CASCADE porque passkey de usuario apagado nao deve sobreviver.
--
-- FICOU DE FORA, de proposito:
--   - policy de INSERT em session_activity: a tabela tem 0 linhas e NINGUEM
--     escreve nela (grep em src/ e supabase/functions/ so acha o types.ts
--     gerado). Policy para tabela dormente e trabalho morto.
--   - login_attempts: tem 1139 linhas, ou seja a escrita funciona via
--     record_login_attempt, que e SECURITY DEFINER e bypassa RLS. Nao e lacuna.
--   - list_soft_delete_tables() e log_audit_universal(): nao existem, mas
--     tambem nao teriam consumidor. Seriam codigo morto.

-- 1. CHECKs de regra de negocio
ALTER TABLE public.activities
  ADD CONSTRAINT activities_duration_positive
  CHECK (duration_minutes IS NULL OR duration_minutes >= 0);

ALTER TABLE public.pipeline_stages
  ADD CONSTRAINT pipeline_stage_order_positive
  CHECK (stage_order IS NULL OR stage_order >= 0);

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_subtotal_non_negative
  CHECK (subtotal IS NULL OR subtotal >= 0);

-- 2. UNIQUE parciais que respeitam soft delete
CREATE UNIQUE INDEX IF NOT EXISTS ux_suppliers_cnpj_ativo
  ON public.suppliers (cnpj)
  WHERE cnpj IS NOT NULL AND cnpj <> '' AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_suppliers_email_ativo
  ON public.suppliers (lower(email))
  WHERE email IS NOT NULL AND email <> '' AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_teams_name_ativo
  ON public.teams (name)
  WHERE name IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_quote_number_ativo
  ON public.quotes (quote_number)
  WHERE quote_number IS NOT NULL AND deleted_at IS NULL;

-- 3. FKs das tabelas de passkey para auth.users
ALTER TABLE public.webauthn_credentials
  ADD CONSTRAINT fk_webauthn_credentials_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.webauthn_challenges
  ADD CONSTRAINT fk_webauthn_challenges_user_id
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
