-- 1. Add preference columns to salespeople
ALTER TABLE public.salespeople 
ADD COLUMN IF NOT EXISTS notify_sales_in_app BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_sales_email BOOLEAN DEFAULT false;

-- 2. Enhance audit log
ALTER TABLE public.sale_notifications_audit 
ADD COLUMN IF NOT EXISTS message_sent TEXT,
ADD COLUMN IF NOT EXISTS channel TEXT,
ADD COLUMN IF NOT EXISTS error_log TEXT;

-- 3. Sync deal_status with status
CREATE OR REPLACE FUNCTION public.sync_sales_statuses()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS NOT NULL AND (NEW.deal_status IS NULL OR NEW.deal_status::text != NEW.status) THEN
    -- Try to cast status string to deal_status enum
    BEGIN
      NEW.deal_status := NEW.status::public.deal_status;
    EXCEPTION WHEN OTHERS THEN
      -- If cast fails, leave deal_status as is or handle error
    END;
  ELSIF NEW.deal_status IS NOT NULL AND (NEW.status IS NULL OR NEW.status != NEW.deal_status::text) THEN
    NEW.status := NEW.deal_status::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_sales_statuses ON public.sales;
CREATE TRIGGER tr_sync_sales_statuses
BEFORE INSERT OR UPDATE OF status, deal_status ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.sync_sales_statuses();

-- 4. Clean up old redundant trigger
DROP TRIGGER IF EXISTS tr_notify_sale_completion ON public.sales;

-- 5. Update the primary broadcast function
CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_name text;
  v_payload jsonb;
  v_url text;
  v_anon_key text;
BEGIN
  -- Detect transition to completed
  -- Handles both 'status' (text) and 'deal_status' (enum) thanks to sync trigger above
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Prevent duplicate broadcasts for the same sale
  IF NEW.broadcast_sent_at IS NOT NULL AND TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get seller name
  SELECT name INTO v_seller_name
  FROM public.salespeople
  WHERE id = NEW.salesperson_id;

  v_payload := jsonb_build_object(
    'sale_id', NEW.id,
    'salesperson_id', NEW.salesperson_id,
    'salesperson_name', COALESCE(v_seller_name, 'Vendedor'),
    'client_name', COALESCE(NEW.client_name, 'Cliente'),
    'amount', NEW.amount
  );

  -- Internal URL for broadcast edge function
  -- Using relative path if possible or full URL
  v_url := 'https://saejqkojleeaxzrslzfg.supabase.co/functions/v1/broadcast-sale-notification';
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZWpxa29qbGVlYXh6cnNsemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTk1NjQsImV4cCI6MjA4MTEzNTU2NH0.zzzCBp7FIbEIqswv7cqpNLEm49BZ4qT5iZOkUn89y7w';

  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := v_payload
  );

  -- Mark broadcast as sent
  UPDATE public.sales SET broadcast_sent_at = now() WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'broadcast_sale_completed failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 6. Ensure the trigger is active
DROP TRIGGER IF EXISTS trg_broadcast_sale_completed ON public.sales;
CREATE TRIGGER trg_broadcast_sale_completed
AFTER INSERT OR UPDATE OF status, deal_status ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.broadcast_sale_completed();
