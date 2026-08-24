CREATE OR REPLACE FUNCTION public.broadcast_sale_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_name text;
  v_payload jsonb;
  v_url text;
  v_anon_key text;
BEGIN
  -- 1. Validate state
  IF NEW.status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  -- Prevent duplicate broadcasts
  IF NEW.broadcast_sent_at IS NOT NULL AND TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- 2. Prepare Data
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

  -- 3. Configuration (Corrected for rapjswienfhkobhlamxb)
  v_url := 'https://rapjswienfhkobhlamxb.supabase.co/functions/v1/broadcast-sale-notification';
  
  -- Getting the anon key for THIS project
  -- In a real production environment, we'd use a vault or an internal secret
  v_anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGpzd2llbmZoa29iaGxhbXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODM2MDUsImV4cCI6MjA5NDA1OTYwNX0.V8nfjFxM8BRBORwGwadtN3xMPbowTuKDBZm5xpUX1OE';

  -- 4. Execute Async Call
  -- We use net.http_post to avoid blocking the transaction
  PERFORM extensions.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := v_payload
  );

  -- 5. Mark as processed
  -- Note: We use a direct update here which is safe because we are in an AFTER trigger
  -- and we check broadcast_sent_at at the start
  UPDATE public.sales 
  SET broadcast_sent_at = now(),
      updated_at = now() 
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't break the sale record
  RAISE WARNING 'broadcast_sale_completed critical failure: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
