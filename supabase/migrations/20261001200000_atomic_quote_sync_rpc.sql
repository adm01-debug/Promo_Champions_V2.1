-- RPC transacional sync_quote_from_webhook (pacote ATOMIC da auditoria de BD/integridade)
--
-- Antes, o receive-quote-webhook executava 5+ escritas sequenciais via PostgREST
-- (upsert de cliente, upsert de quote, delete+insert de quote_items, upsert de
-- sales, link sale_id). Qualquer falha intermediária deixava estado parcial:
-- quote atualizado sem itens normalizados, ou sale sem vínculo com o quote.
--
-- Esta RPC concentra todas as escritas do fluxo em uma única chamada SECURITY
-- DEFINER: o PL/pgSQL roda em transação implícita, então qualquer erro faz
-- rollback completo e o retry do webhook reaplica o payload inteiro de forma
-- idempotente (upsert por external_quote_id). quote_sync_logs continua FORA da
-- transação, escrito pela edge function, para que falhas da RPC fiquem
-- registradas.
--
-- Defensiva:
--   * idempotente — re-executável com o mesmo payload;
--   * corrida de criação tratada via EXCEPTION WHEN unique_violation
--     (ux_quotes_external_quote_id) + SELECT FOR UPDATE serializando retries;
--   * product_id que não resolve em public.products é gravado como NULL
--     (antes, a FK derrubava o batch inteiro de itens) e a quantidade é
--     devolvida em itens_sem_produto para observabilidade;
--   * triggers existentes (trg_convert_quote_to_order, trg_enqueue_v4_callback)
--     continuam disparando normalmente dentro da transação, com a mesma ordem
--     de operações que a edge function usava.

CREATE OR REPLACE FUNCTION public.sync_quote_from_webhook(
  p_external_quote_id  text,
  p_quote_number       text,
  p_title              text,
  p_description        text,
  p_client_name        text,
  p_client_email       text,
  p_client_phone       text,
  p_seller_name        text,
  p_external_seller_id text,
  p_status             text,
  p_pipeline_status    text,
  p_total_value        numeric,
  p_subtotal           numeric,
  p_discount_percent   numeric,
  p_discount_amount    numeric,
  p_items              jsonb,
  p_valid_until        timestamptz,
  p_notes              text,
  p_sent_at            timestamptz,
  p_approved_at        timestamptz,
  p_rejected_at        timestamptz,
  p_quote_created_at   timestamptz,
  p_sale_product_name  text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id         uuid;
  v_salesperson_id    uuid;
  v_quote_id          uuid;
  v_sale_id           uuid;
  v_quote_inserted    boolean := false;
  v_now               timestamptz := now();
  v_items_sem_produto int := 0;
BEGIN
  -- 1) Upsert de cliente — mesmo helper que a edge function chamava via RPC
  IF p_client_email IS NOT NULL OR p_client_phone IS NOT NULL THEN
    v_client_id := public.upsert_client_from_quote(
      p_client_name, p_client_email, p_client_phone, NULL
    );
  END IF;

  -- 2) Vendedor externo → salesperson interno (external_seller_map)
  IF p_external_seller_id IS NOT NULL THEN
    SELECT salesperson_id INTO v_salesperson_id
    FROM public.external_seller_map
    WHERE external_source = 'gift_store'
      AND external_id = p_external_seller_id;
  END IF;

  -- 3) Quote existente — FOR UPDATE serializa retries concorrentes do mesmo
  --    external_quote_id dentro da transação
  SELECT id, sale_id INTO v_quote_id, v_sale_id
  FROM public.quotes
  WHERE external_quote_id = p_external_quote_id
  LIMIT 1
  FOR UPDATE;

  IF v_quote_id IS NULL THEN
    BEGIN
      INSERT INTO public.quotes (
        client_name, client_email, client_phone, seller_name,
        external_seller_id, client_id, created_by, title, description,
        total_value, status, external_reference, external_quote_id,
        quote_number, subtotal, discount_percent, discount_amount,
        items, valid_until, notes, source, synced_from_external,
        sync_status, last_synced_at, sent_at, approved_at, rejected_at,
        created_at, updated_at
      ) VALUES (
        p_client_name, p_client_email, p_client_phone, p_seller_name,
        p_external_seller_id, v_client_id, v_salesperson_id, p_title,
        p_description, p_total_value, p_status, p_quote_number,
        p_external_quote_id, p_quote_number, p_subtotal,
        p_discount_percent, p_discount_amount, p_items, p_valid_until,
        p_notes, 'gift_store', true, 'synced', v_now,
        p_sent_at, p_approved_at, p_rejected_at,
        COALESCE(p_quote_created_at, v_now), v_now
      )
      RETURNING id INTO v_quote_id;
      v_quote_inserted := true;
    EXCEPTION WHEN unique_violation THEN
      -- Dois webhooks concorrentes criando o mesmo external_quote_id:
      -- cai no caminho de update em vez de estourar 23505.
      SELECT id, sale_id INTO v_quote_id, v_sale_id
      FROM public.quotes
      WHERE external_quote_id = p_external_quote_id
      LIMIT 1
      FOR UPDATE;
    END;
  END IF;

  IF NOT v_quote_inserted THEN
    UPDATE public.quotes SET
      client_name          = p_client_name,
      client_email         = p_client_email,
      client_phone         = p_client_phone,
      seller_name          = p_seller_name,
      external_seller_id   = p_external_seller_id,
      client_id            = v_client_id,
      created_by           = v_salesperson_id,
      title                = p_title,
      description          = p_description,
      total_value          = p_total_value,
      status               = p_status,
      external_reference   = p_quote_number,
      quote_number         = p_quote_number,
      subtotal             = p_subtotal,
      discount_percent     = p_discount_percent,
      discount_amount      = p_discount_amount,
      items                = p_items,
      valid_until          = p_valid_until,
      notes                = p_notes,
      source               = 'gift_store',
      synced_from_external = true,
      sync_status          = 'synced',
      last_synced_at       = v_now,
      sent_at              = COALESCE(p_sent_at, sent_at),
      approved_at          = COALESCE(p_approved_at, approved_at),
      rejected_at          = COALESCE(p_rejected_at, rejected_at),
      updated_at           = v_now
    WHERE id = v_quote_id;
  END IF;

  -- 4) Substituição atômica dos itens normalizados (delete + insert na mesma
  --    transação — antes eram duas chamadas PostgREST independentes)
  IF p_items IS NOT NULL
     AND jsonb_typeof(p_items) = 'array'
     AND jsonb_array_length(p_items) > 0 THEN
    DELETE FROM public.quote_items WHERE quote_id = v_quote_id;

    INSERT INTO public.quote_items (
      quote_id, product_id, product_name, quantity, unit_price,
      discount_amount, total_price
    )
    SELECT
      v_quote_id,
      prod.id,
      it.item->>'product_name',
      ROUND((it.item->>'quantity')::numeric)::int,
      (it.item->>'unit_price')::numeric,
      0,
      COALESCE(
        (it.item->>'subtotal')::numeric,
        (it.item->>'quantity')::numeric * (it.item->>'unit_price')::numeric
      )
    FROM jsonb_array_elements(p_items) AS it(item)
    LEFT JOIN public.products AS prod
      ON prod.id::text = it.item->>'product_id';

    -- Observabilidade: itens cujo product_id externo não existe em products
    SELECT COUNT(*) INTO v_items_sem_produto
    FROM jsonb_array_elements(p_items) AS it(item)
    LEFT JOIN public.products AS prod
      ON prod.id::text = it.item->>'product_id'
    WHERE NULLIF(it.item->>'product_id', '') IS NOT NULL
      AND prod.id IS NULL;
  END IF;

  -- 5) Pipeline (sales) + vínculo sale_id no quote
  IF v_sale_id IS NOT NULL THEN
    UPDATE public.sales SET
      client_name    = p_client_name,
      product_name   = p_sale_product_name,
      amount         = p_total_value,
      status         = p_pipeline_status,
      client_id      = v_client_id,
      salesperson_id = v_salesperson_id,
      updated_at     = v_now
    WHERE id = v_sale_id;
  ELSE
    INSERT INTO public.sales (
      client_name, product_name, amount, status, category,
      client_id, salesperson_id, source, created_at
    ) VALUES (
      p_client_name, p_sale_product_name, p_total_value, p_pipeline_status,
      'brindes', v_client_id, v_salesperson_id, 'gift_store',
      COALESCE(p_quote_created_at, v_now)
    )
    RETURNING id INTO v_sale_id;

    UPDATE public.quotes SET sale_id = v_sale_id WHERE id = v_quote_id;
  END IF;

  RETURN jsonb_build_object(
    'quote_id',          v_quote_id,
    'sale_id',           v_sale_id,
    'client_id',         v_client_id,
    'salesperson_id',    v_salesperson_id,
    'itens_sem_produto', v_items_sem_produto
  );
END;
$$;

-- Hardening: apenas service_role executa (a edge function usa a service key)
REVOKE ALL ON FUNCTION public.sync_quote_from_webhook(
  text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, numeric, numeric, jsonb,
  timestamptz, text,
  timestamptz, timestamptz, timestamptz, timestamptz,
  text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.sync_quote_from_webhook(
  text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, numeric, numeric, jsonb,
  timestamptz, text,
  timestamptz, timestamptz, timestamptz, timestamptz,
  text
) TO service_role;

COMMENT ON FUNCTION public.sync_quote_from_webhook(
  text, text, text, text, text, text, text, text, text, text, text,
  numeric, numeric, numeric, numeric, jsonb,
  timestamptz, text,
  timestamptz, timestamptz, timestamptz, timestamptz,
  text
) IS 'Sincronização atômica quote→items→sale do receive-quote-webhook (gift_store). Todas as escritas em uma transação implícita: falha → rollback completo. quote_sync_logs fica fora, na edge function.';
