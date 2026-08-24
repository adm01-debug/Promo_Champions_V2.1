-- Guard convert_quote_to_order() against running before quote_items are synced.
--
-- The webhook (receive-quote-webhook) upserts a quote row first, then syncs
-- quote_items in a separate step. The trigger fires immediately on the quote
-- upsert (same TX), so it could create an order from the JSONB items column
-- before the normalized quote_items rows exist — leaving the order with stale
-- data and confusing fn_convert_quote_to_sale which re-checks quote_items later.
--
-- Fix: bail out (return NEW without creating an order) when no quote_items rows
-- are present yet. The explicit RPC fn_convert_quote_to_sale is the canonical
-- path and handles creation correctly once items are in place.
--
-- This is a drop-in replacement for the function created in
-- 20260706160203_849fd5c0-... — same column set, same order number strategy,
-- same trigger; only adds the quote_items guard and reads items from the
-- normalized table instead of the JSONB blob.

CREATE OR REPLACE FUNCTION public.convert_quote_to_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_order uuid;
  v_order_id       uuid;
  v_order_number   text;
BEGIN
  -- Only act when status transitions to 'approved'.
  IF NEW.status <> 'approved' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if status was already approved (avoids re-fire on
  -- unrelated column updates).
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if an order already exists for this quote.
  SELECT id INTO v_existing_order
  FROM public.orders
  WHERE quote_id = NEW.id
  LIMIT 1;

  IF v_existing_order IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Guard: if quote_items haven't been synced yet (e.g. webhook hasn't
  -- completed its second step), skip creation entirely. The explicit RPC
  -- fn_convert_quote_to_sale will handle it correctly after sync.
  IF NOT EXISTS (
    SELECT 1 FROM public.quote_items WHERE quote_id = NEW.id LIMIT 1
  ) THEN
    RETURN NEW;
  END IF;

  -- Derive order number from quote_number (same strategy as original trigger).
  v_order_number := COALESCE(
    'PED-' || NULLIF(NEW.quote_number, ''),
    'PED-' || substr(NEW.id::text, 1, 8) || '-' || to_char(now(), 'YYMMDDHH24MISS')
  );

  -- Ensure uniqueness.
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number) LOOP
    v_order_number := v_order_number || '-' || substr(md5(random()::text), 1, 4);
  END LOOP;

  -- Insert order using the column set that actually exists on public.orders.
  INSERT INTO public.orders (
    order_number,
    status,
    subtotal,
    shipping,
    total,
    quote_id,
    client_id,
    salesperson_id,
    notes,
    metadata
  )
  VALUES (
    v_order_number,
    'pending',
    COALESCE(NEW.subtotal, NEW.total_value, 0),
    0,
    COALESCE(NEW.total_value, 0),
    NEW.id,
    NEW.client_id,
    NEW.created_by,
    NEW.notes,
    jsonb_build_object(
      'source',             COALESCE(NEW.source, 'manual'),
      'external_quote_id',  NEW.external_quote_id,
      'quote_number',       NEW.quote_number,
      'external_seller_id', NEW.external_seller_id,
      'client_name',        NEW.client_name,
      'client_email',       NEW.client_email,
      'client_phone',       NEW.client_phone
    )
  )
  RETURNING id INTO v_order_id;

  -- Copy items from the normalized quote_items table (not the JSONB blob).
  -- Uses only columns that exist on public.order_items.
  INSERT INTO public.order_items (order_id, product_name, quantity, unit_price)
  SELECT
    v_order_id,
    qi.product_name,
    qi.quantity,
    qi.unit_price
  FROM public.quote_items qi
  WHERE qi.quote_id = NEW.id;

  RETURN NEW;
END;
$$;
