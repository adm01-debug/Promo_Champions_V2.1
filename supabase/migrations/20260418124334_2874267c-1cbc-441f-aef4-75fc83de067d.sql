-- 1. Coluna anti-duplicação
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS broadcast_sent_at timestamptz;

-- 2. Garantir extensão pg_net
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 3. Função do trigger
CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_seller_name text;
  v_payload jsonb;
  v_url text;
  v_anon_key text;
BEGIN
  -- Apenas vendas completed e ainda não broadcast
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  IF NEW.broadcast_sent_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Buscar nome do vendedor
  SELECT name INTO v_seller_name
  FROM public.salespeople
  WHERE id = NEW.salesperson_id;

  IF v_seller_name IS NULL THEN
    v_seller_name := 'Um colega';
  END IF;

  v_payload := jsonb_build_object(
    'sale_id', NEW.id,
    'salesperson_id', NEW.salesperson_id,
    'salesperson_name', v_seller_name,
    'client_name', COALESCE(NEW.client_name, 'Cliente'),
    'amount', NEW.amount
  );

  v_url := 'https://saejqkojleeaxzrslzfg.supabase.co/functions/v1/broadcast-sale-notification';
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWpxa29qbGVlYXh6cnNsemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTk1NjQsImV4cCI6MjA4MTEzNTU2NH0.zzzCBp7FIbEIqswv7cqpNLEm49BZ4qT5iZOkUn89y7w';

  -- Chamar edge function via pg_net (assíncrono)
  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := v_payload
  );

  -- Marcar como enviado
  UPDATE public.sales
    SET broadcast_sent_at = now()
    WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca quebrar a inserção da venda por causa do broadcast
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Trigger
DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
CREATE TRIGGER trg_broadcast_sale_completed
AFTER INSERT OR UPDATE OF status ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_sale_completed();