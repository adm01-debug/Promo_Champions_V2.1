-- ============================================================
-- Auditoria Banco de Dados / Integridade — pacote [UNIQUE]
-- Dedupe real via constraints (idempotente / defensivo)
-- ============================================================
-- Conteúdo:
--   1) clients: normaliza e-mail vazio, dedupe defensivo por lower(email)
--      (merge via public.merge_clients com fallback p/ soft delete) e
--      índice único parcial ux_clients_email.
--   2) icp_data: dedupe por bitrix_id + índice único ux_icp_data_bitrix_id,
--      tornando real o upsert onConflict:'bitrix_id' do bitrix24-sync.
--      NOTA: usa-se índice único TOTAL (não parcial) porque a inferência
--      de ON CONFLICT do Postgres/PostgREST exige índice único sem
--      predicado. UNIQUE ignora NULLs (NULLs são distintos), então a
--      semântica "único quando preenchido" é preservada.
--   3) sales: coluna external_deal_id + índice único
--      ux_sales_source_external_deal (source, external_deal_id) p/ dedupe
--      do bitrix24-sync por deal.ID (linhas com NULL nunca conflitam).
--   4) upsert_client_from_quote: trata unique_violation p/ corrida —
--      dois POSTs concorrentes do mesmo quote resultam em 1 client.
-- Idempotência: reexecutável; dedupes só alteram quando há duplicata.
-- ============================================================

-- ------------------------------------------------------------
-- 1a) clients: e-mail vazio não é identidade — normaliza p/ NULL
--     (mantém a linha fora do índice único e fora do dedupe)
-- ------------------------------------------------------------
UPDATE public.clients
SET email = NULL
WHERE email IS NOT NULL AND btrim(email) = '';

-- ------------------------------------------------------------
-- 1b) clients: dedupe defensivo por lower(email)
--     Canônico = registro mais recentemente atualizado (empate: mais
--     antigo). Duplicados passam por public.merge_clients (reaponta FKs
--     e consolida tags); se o merge falhar (ex.: FK não coberta pelo
--     helper), o duplicado recebe deleted_at para liberar o índice.
-- ------------------------------------------------------------
DO $$
DECLARE
  r            RECORD;
  v_target     uuid;
  v_dups       uuid[];
  v_merged     int := 0;
  v_soft       int := 0;
  v_has_merge  boolean;
BEGIN
  v_has_merge := to_regprocedure('public.merge_clients(uuid,uuid[],jsonb)') IS NOT NULL;

  FOR r IN
    SELECT lower(email) AS email_key,
           array_agg(id ORDER BY updated_at DESC NULLS LAST, created_at ASC, id) AS ids
    FROM public.clients
    WHERE email IS NOT NULL
      AND btrim(email) <> ''
      AND deleted_at IS NULL
    GROUP BY lower(email)
    HAVING count(*) > 1
  LOOP
    v_target := r.ids[1];
    v_dups   := r.ids[2:array_length(r.ids, 1)];

    IF v_has_merge THEN
      BEGIN
        PERFORM public.merge_clients(v_target, v_dups);
        v_merged := v_merged + coalesce(array_length(v_dups, 1), 0);
        CONTINUE;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'merge_clients falhou p/ e-mail % — duplicados recebem deleted_at (%)',
          r.email_key, SQLERRM;
      END;
    END IF;

    UPDATE public.clients SET deleted_at = now() WHERE id = ANY(v_dups);
    v_soft := v_soft + coalesce(array_length(v_dups, 1), 0);
  END LOOP;

  RAISE NOTICE 'dedupe clients(lower(email)): % mesclados, % marcados deleted_at',
    v_merged, v_soft;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_clients_email
  ON public.clients (lower(email))
  WHERE email IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX public.ux_clients_email IS
  'E-mail único por cliente ativo (case-insensitive). Auditoria integridade [UNIQUE].';

-- ------------------------------------------------------------
-- 2) icp_data: dedupe por bitrix_id (mantém a linha mais completa,
--    desempate por updated_at desc/created_at asc) + UNIQUE total
-- ------------------------------------------------------------
DELETE FROM public.icp_data a
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY bitrix_id
           ORDER BY (
             (capital_social   IS NOT NULL)::int +
             (num_colaboradores IS NOT NULL)::int +
             (ramo_atividade    IS NOT NULL)::int +
             (grupo_nicho       IS NOT NULL)::int
           ) DESC,
           updated_at DESC NULLS LAST,
           created_at ASC
         ) AS rn
  FROM public.icp_data
  WHERE bitrix_id IS NOT NULL
) ranked
WHERE a.id = ranked.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_icp_data_bitrix_id
  ON public.icp_data (bitrix_id);

COMMENT ON INDEX public.ux_icp_data_bitrix_id IS
  'bitrix_id único quando preenchido (NULLs permitidos). Habilita o upsert onConflict do bitrix24-sync.';

-- ------------------------------------------------------------
-- 3) sales: external_deal_id + UNIQUE (source, external_deal_id)
-- ------------------------------------------------------------
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS external_deal_id TEXT;

COMMENT ON COLUMN public.sales.external_deal_id IS
  'ID do negócio na origem externa (ex.: Bitrix24 deal.ID) p/ dedupe idempotente de sync.';

CREATE UNIQUE INDEX IF NOT EXISTS ux_sales_source_external_deal
  ON public.sales (source, external_deal_id);

COMMENT ON INDEX public.ux_sales_source_external_deal IS
  'Uma sale por deal externo por origem; NULLs não conflitam (mantém vendas manuais livres).';

-- ------------------------------------------------------------
-- 4) upsert_client_from_quote: SELECT-then-INSERT tinha janela de
--    corrida; com ux_clients_email, captura unique_violation e
--    reaproveita o registro vencedor. Também ignora clientes
--    soft-deletados nos lookups (alinha com o escopo do índice).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_client_from_quote(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_company TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  IF p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE lower(email) = lower(trim(p_email))
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL AND p_phone IS NOT NULL AND length(trim(p_phone)) > 0 THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
      AND deleted_at IS NULL
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL THEN
    BEGIN
      INSERT INTO public.clients (name, email, phone, company, lead_source)
      VALUES (
        COALESCE(NULLIF(trim(p_name), ''), 'Cliente sem nome'),
        NULLIF(trim(p_email), ''),
        NULLIF(trim(p_phone), ''),
        NULLIF(trim(p_company), ''),
        'gift_store_quote'
      )
      RETURNING id INTO v_client_id;
    EXCEPTION WHEN unique_violation THEN
      -- Corrida: outra transação inseriu o mesmo e-mail primeiro.
      SELECT id INTO v_client_id
      FROM public.clients
      WHERE lower(email) = lower(trim(p_email))
        AND deleted_at IS NULL
      LIMIT 1;
      IF v_client_id IS NULL THEN
        RAISE; -- violação em outra constraint: propaga o erro original
      END IF;
    END;
  ELSE
    UPDATE public.clients
    SET
      name = COALESCE(NULLIF(trim(p_name), ''), name),
      phone = COALESCE(NULLIF(trim(p_phone), ''), phone),
      company = COALESCE(NULLIF(trim(p_company), ''), company),
      last_interaction_at = now()
    WHERE id = v_client_id;
  END IF;

  RETURN v_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_client_from_quote(TEXT, TEXT, TEXT, TEXT) TO service_role;
