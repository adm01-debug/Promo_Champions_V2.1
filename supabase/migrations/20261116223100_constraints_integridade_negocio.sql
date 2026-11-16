-- Constraints de integridade de negocio resgatadas da branch
-- audit/rlx-security-fix (20260726000001_audit_critical_fixes.sql, linhas
-- 137-240). Aquela branch tem historia desconexa da main e o SQL original
-- NAO E PORTAVEL: ele escreve
--   ALTER TABLE ... ADD CONSTRAINT x UNIQUE (col) WHERE col IS NOT NULL
-- e Postgres nao aceita WHERE em constraint UNIQUE (so em CREATE UNIQUE
-- INDEX). Aquela migration nunca rodou. Aqui a intencao foi reescrita com
-- SQL valido.
--
-- Rollback:
--   ALTER TABLE public.quotes      DROP CONSTRAINT quotes_total_value_non_negative;
--   ALTER TABLE public.orders      DROP CONSTRAINT orders_total_non_negative;
--   ALTER TABLE public.lead_scores DROP CONSTRAINT lead_scores_score_range;
--   DROP INDEX public.ux_clients_phone;
--
-- Fora do escopo, de proposito:
--   - clients_email_unique: a main JA cobre, e melhor, em
--     20261001190000_dedupe_unique_constraints.sql -> ux_clients_email sobre
--     lower(email) com WHERE deleted_at IS NULL (case-insensitive e respeita
--     soft delete; a versao da branch era case-sensitive).
--   - quotes_quote_number_unique: a propria branch se contradiz (o arquivo
--     ...06 usa UNIQUE (quote_number, salesperson_id) com o comentario "cada
--     vendedor tem numbering proprio") e public.quotes NAO TEM a coluna
--     salesperson_id na main. Unicidade global de quote_number e decisao de
--     negocio em aberto, nao resgate mecanico.
--
-- Os tres CHECK entram como NOT VALID: passam a valer para INSERT/UPDATE
-- imediatamente, sem varrer as linhas existentes, para que a migration nao
-- falhe num dado historico. Depois de limpar o historico, validar com
--   ALTER TABLE public.<t> VALIDATE CONSTRAINT <c>;

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_total_value_non_negative;
ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_total_value_non_negative
  CHECK (total_value IS NULL OR total_value >= 0) NOT VALID;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_total_non_negative;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_total_non_negative
  CHECK (total IS NULL OR total >= 0) NOT VALID;

ALTER TABLE public.lead_scores
  DROP CONSTRAINT IF EXISTS lead_scores_score_range;
ALTER TABLE public.lead_scores
  ADD CONSTRAINT lead_scores_score_range
  CHECK (score IS NULL OR (score >= 0 AND score <= 100)) NOT VALID;

-- Telefone unico por cliente ativo. Espelha o padrao do ux_clients_email da
-- main: indice unico PARCIAL, ignorando nulos/vazios e soft delete.
-- Aborta com mensagem util se houver duplicata, em vez de estourar um erro
-- cru de indice unico.
DO $$
DECLARE dups INTEGER;
BEGIN
  SELECT count(*) INTO dups FROM (
    SELECT phone
    FROM public.clients
    WHERE phone IS NOT NULL AND phone <> '' AND deleted_at IS NULL
    GROUP BY phone
    HAVING count(*) > 1
  ) d;

  IF dups > 0 THEN
    RAISE EXCEPTION
      'ux_clients_phone nao criado: % telefone(s) duplicado(s) entre clientes ativos. Rode: SELECT phone, count(*) FROM public.clients WHERE phone IS NOT NULL AND phone <> '''' AND deleted_at IS NULL GROUP BY 1 HAVING count(*) > 1;',
      dups;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_clients_phone
  ON public.clients (phone)
  WHERE phone IS NOT NULL AND phone <> '' AND deleted_at IS NULL;
