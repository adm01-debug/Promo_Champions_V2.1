-- Add missing columns to quotes table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'quote_number') THEN
        ALTER TABLE public.quotes ADD COLUMN quote_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'subtotal') THEN
        ALTER TABLE public.quotes ADD COLUMN subtotal DECIMAL(12,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'discount_amount') THEN
        ALTER TABLE public.quotes ADD COLUMN discount_amount DECIMAL(12,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'discount_percent') THEN
        ALTER TABLE public.quotes ADD COLUMN discount_percent DECIMAL(5,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'items') THEN
        ALTER TABLE public.quotes ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'external_quote_id') THEN
        ALTER TABLE public.quotes ADD COLUMN external_quote_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'sync_status') THEN
        ALTER TABLE public.quotes ADD COLUMN sync_status TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quotes' AND COLUMN_NAME = 'pdf_url') THEN
        ALTER TABLE public.quotes ADD COLUMN pdf_url TEXT;
    END IF;
END $$;

-- Create index for external_quote_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_quotes_external_quote_id ON public.quotes(external_quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON public.quotes(valid_until);

-- Function to handle expired quotes
CREATE OR REPLACE FUNCTION public.check_quote_expirations()
RETURNS void AS $$
BEGIN
    UPDATE public.quotes
    SET status = 'expired',
        updated_at = now()
    WHERE status = 'sent'
      AND valid_until < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
