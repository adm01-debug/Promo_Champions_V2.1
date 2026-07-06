
CREATE POLICY "Vendedores podem ver seus próprios orçamentos inbound"
ON public.quotes_inbound
FOR SELECT
TO authenticated
USING (
  seller_email = (
    SELECT email FROM public.salespeople
    WHERE auth_user_id = auth.uid()
      AND is_active = true
    LIMIT 1
  )
);

DROP TRIGGER IF EXISTS quotes_inbound_updated_at ON public.quotes_inbound;
