-- Simulacao fiel do estado PRE-migration: refresh em private,
-- trigger privado, revokes, RPC de 4 colunas com grants.

CREATE SCHEMA private;
CREATE TABLE public.sales (
    id bigint generated always as identity primary key,
    created_at timestamptz default now(),
    amount numeric default 0,
    status text,
    deal_status text
);
CREATE TABLE IF NOT EXISTS public.monthly_sales_summary (
    month TEXT PRIMARY KEY,
    revenue NUMERIC DEFAULT 0,
    deals INTEGER DEFAULT 0,
    won_deals INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.monthly_sales_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Summary viewable by everyone" ON public.monthly_sales_summary FOR SELECT USING (true);

-- Refresh original (sem lost_deals), ja em private (estado pos-20260619145322)
CREATE FUNCTION private.refresh_monthly_sales_summary(p_month TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals, updated_at)
    SELECT
        to_char(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN amount ELSE 0 END)::NUMERIC,
        COUNT(*)::INT,
        COUNT(CASE WHEN deal_status::text IN ('won', 'completed') OR status IN ('won', 'completed') THEN 1 END)::INT,
        now()
    FROM public.sales
    WHERE to_char(created_at, 'YYYY-MM') = p_month
    GROUP BY 1
    ON CONFLICT (month) DO UPDATE
    SET revenue = EXCLUDED.revenue, deals = EXCLUDED.deals,
        won_deals = EXCLUDED.won_deals, updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION private.trigger_refresh_monthly_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSE
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER refresh_monthly_summary_on_sale
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION private.trigger_refresh_monthly_summary();

CREATE FUNCTION public.get_monthly_sales_benchmark(months_back integer DEFAULT 13)
 RETURNS TABLE(month text, revenue numeric, deals integer, won_deals integer)
 LANGUAGE plpgsql STABLE SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.month, s.revenue, s.deals, s.won_deals
    FROM public.monthly_sales_summary s
    WHERE s.month >= to_char(CURRENT_DATE - (months_back || ' month')::INTERVAL, 'YYYY-MM')
    ORDER BY s.month;
END;
$function$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales_benchmark(integer) TO service_role;
REVOKE ALL ON FUNCTION private.refresh_monthly_sales_summary(text) FROM PUBLIC, anon, authenticated;

-- Linha residual: mes com summary mas sem vendas (venda deletada depois)
INSERT INTO public.monthly_sales_summary (month, revenue, deals, won_deals)
VALUES ('2026-01', 999, 5, 3);

-- Dados do mes corrente
INSERT INTO public.sales (created_at, amount, status) VALUES
  (now(), 100, 'won'),
  (now(), 200, 'closed'),
  (now(), 300, 'completed'),
  (now(), 50,  'lost'),
  (now(), 70,  'cancelled'),
  (now(), 90,  'in_progress'),
  (now(), 10,  'negotiation');

SELECT 'pre' AS fase, * FROM public.get_monthly_sales_benchmark(60) ORDER BY month;
