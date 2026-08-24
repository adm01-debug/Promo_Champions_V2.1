-- Função para sincronizar status do orçamento com o pipeline (sales)
CREATE OR REPLACE FUNCTION public.sync_quote_to_sale_status()
RETURNS TRIGGER AS $$
DECLARE
  v_pipeline_status TEXT;
BEGIN
  -- Definir o status do pipeline com base no status do orçamento
  v_pipeline_status := CASE 
    WHEN NEW.status = 'draft' THEN 'lead'
    WHEN NEW.status = 'sent' THEN 'proposal'
    WHEN NEW.status = 'approved' THEN 'closed'
    WHEN NEW.status = 'rejected' THEN 'cancelled'
    WHEN NEW.status = 'expired' THEN 'cancelled'
    ELSE 'lead'
  END;

  -- Se o orçamento estiver vinculado a uma venda (pipeline)
  IF NEW.sale_id IS NOT NULL THEN
    UPDATE public.sales
    SET 
      status = v_pipeline_status,
      amount = NEW.total_value,
      updated_at = now()
    WHERE id = NEW.sale_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronização após insert ou update
DROP TRIGGER IF EXISTS tr_sync_quote_to_sale ON public.quotes;
CREATE TRIGGER tr_sync_quote_to_sale
AFTER INSERT OR UPDATE OF status, total_value ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.sync_quote_to_sale_status();

-- Tabela para logs de sincronização externa (se não existir)
CREATE TABLE IF NOT EXISTS public.quote_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    external_quote_id TEXT,
    quote_number TEXT,
    action TEXT,
    payload JSONB,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nos logs
ALTER TABLE public.quote_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendedores podem ver logs" 
ON public.quote_sync_logs FOR SELECT 
USING (true);
