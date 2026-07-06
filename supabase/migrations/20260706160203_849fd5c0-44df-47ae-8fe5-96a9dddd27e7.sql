
-- 1. quote_sync_logs: coluna source
ALTER TABLE public.quote_sync_logs
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'gift_store';

CREATE INDEX IF NOT EXISTS idx_quote_sync_logs_source ON public.quote_sync_logs(source);

-- 2. quotes: unique parcial em external_quote_id + coluna external_seller_id
CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_external_quote_id
  ON public.quotes(external_quote_id)
  WHERE external_quote_id IS NOT NULL;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS external_seller_id TEXT,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_external_seller_id ON public.quotes(external_seller_id);

-- 3. orders: colunas de integração + user_id opcional
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_quote_id ON public.orders(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesperson_id ON public.orders(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);

-- Ampliar políticas de orders
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and managers manage orders" ON public.orders;
DROP POLICY IF EXISTS "Salespeople view assigned orders" ON public.orders;

CREATE POLICY "Admins and managers manage orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Salespeople view assigned orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (salesperson_id IS NOT NULL AND salesperson_id = get_current_salesperson_id());

-- order_items: permitir admins/managers verem tudo
DROP POLICY IF EXISTS "Admins and managers manage order_items" ON public.order_items;
CREATE POLICY "Admins and managers manage order_items"
  ON public.order_items FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

-- order_status_events: permitir admins/managers verem tudo
DROP POLICY IF EXISTS "Admins and managers view order events" ON public.order_status_events;
CREATE POLICY "Admins and managers view order events"
  ON public.order_status_events FOR SELECT
  TO authenticated
  USING (is_admin_or_manager(auth.uid()));

-- 4. external_seller_map: de-para V4 → CRM
CREATE TABLE IF NOT EXISTS public.external_seller_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL,
  external_source TEXT NOT NULL DEFAULT 'gift_store',
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  external_name TEXT,
  external_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (external_source, external_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_seller_map TO authenticated;
GRANT ALL ON public.external_seller_map TO service_role;

ALTER TABLE public.external_seller_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seller map"
  ON public.external_seller_map FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated read seller map"
  ON public.external_seller_map FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.external_seller_map
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 5. v4_callback_dead_letters: DLQ do callback CRM → V4
CREATE TABLE IF NOT EXISTS public.v4_callback_dead_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_quote_id TEXT NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  last_error TEXT,
  attempts INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.v4_callback_dead_letters TO authenticated;
GRANT ALL ON public.v4_callback_dead_letters TO service_role;

ALTER TABLE public.v4_callback_dead_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage v4 dlq"
  ON public.v4_callback_dead_letters FOR ALL
  TO authenticated
  USING (is_admin_or_manager(auth.uid()))
  WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_v4_dlq_pending ON public.v4_callback_dead_letters(next_retry_at) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_v4_dlq_external_quote ON public.v4_callback_dead_letters(external_quote_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.v4_callback_dead_letters
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 6. Função helper: upsert de cliente por email/telefone (usada pelo webhook)
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
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL AND p_phone IS NOT NULL AND length(trim(p_phone)) > 0 THEN
    SELECT id INTO v_client_id
    FROM public.clients
    WHERE regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL THEN
    INSERT INTO public.clients (name, email, phone, company, lead_source)
    VALUES (
      COALESCE(NULLIF(trim(p_name), ''), 'Cliente sem nome'),
      NULLIF(trim(p_email), ''),
      NULLIF(trim(p_phone), ''),
      NULLIF(trim(p_company), ''),
      'gift_store_quote'
    )
    RETURNING id INTO v_client_id;
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

-- 7. Função + trigger: converter quote aprovado em order
CREATE OR REPLACE FUNCTION public.convert_quote_to_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_existing_order UUID;
  v_order_number TEXT;
  v_items JSONB;
  v_item JSONB;
BEGIN
  -- Só age em UPDATE ou INSERT onde status virou approved
  IF NEW.status <> 'approved' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' THEN
    RETURN NEW;
  END IF;

  -- Idempotência: já existe pedido para esse quote?
  SELECT id INTO v_existing_order
  FROM public.orders
  WHERE quote_id = NEW.id
  LIMIT 1;

  IF v_existing_order IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_order_number := COALESCE(
    'PED-' || NULLIF(NEW.quote_number, ''),
    'PED-' || substr(NEW.id::text, 1, 8) || '-' || to_char(now(), 'YYMMDDHH24MISS')
  );

  -- Garantir unicidade
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number) LOOP
    v_order_number := v_order_number || '-' || substr(md5(random()::text), 1, 4);
  END LOOP;

  INSERT INTO public.orders (
    order_number, status, subtotal, shipping, total,
    quote_id, client_id, salesperson_id, notes, metadata
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
      'source', COALESCE(NEW.source, 'manual'),
      'external_quote_id', NEW.external_quote_id,
      'quote_number', NEW.quote_number,
      'external_seller_id', NEW.external_seller_id,
      'client_name', NEW.client_name,
      'client_email', NEW.client_email,
      'client_phone', NEW.client_phone
    )
  )
  RETURNING id INTO v_order_id;

  -- Copiar itens do JSONB de quotes.items para order_items
  v_items := COALESCE(NEW.items, '[]'::jsonb);

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    INSERT INTO public.order_items (order_id, product_name, quantity, unit_price)
    VALUES (
      v_order_id,
      COALESCE(v_item->>'product_name', v_item->>'name', 'Item sem nome'),
      COALESCE((v_item->>'quantity')::INT, 1),
      COALESCE((v_item->>'unit_price')::NUMERIC, 0)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_convert_quote_to_order ON public.quotes;
CREATE TRIGGER trg_convert_quote_to_order
  AFTER INSERT OR UPDATE OF status ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.convert_quote_to_order();

-- 8. Trigger: enfileirar callback V4 quando status muda
CREATE OR REPLACE FUNCTION public.enqueue_v4_callback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.external_quote_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('approved', 'rejected', 'expired', 'sent') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.v4_callback_dead_letters (
    external_quote_id, quote_id, event_type, payload, next_retry_at
  )
  VALUES (
    NEW.external_quote_id,
    NEW.id,
    'quote_status_changed',
    jsonb_build_object(
      'external_quote_id', NEW.external_quote_id,
      'quote_id', NEW.id,
      'new_status', NEW.status,
      'quote_number', NEW.quote_number,
      'total', NEW.total_value,
      'updated_at', NEW.updated_at
    ),
    now()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_v4_callback ON public.quotes;
CREATE TRIGGER trg_enqueue_v4_callback
  AFTER UPDATE OF status ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_v4_callback();
