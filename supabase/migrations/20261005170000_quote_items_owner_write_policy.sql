-- RLS: escrita em quote_items espelha a policy do quote pai
-- (dono do quote via created_by ou admin/manager). Sem isso, INSERT
-- autenticado era negado por default-deny e o seed E2E falhava com
-- "new row violates row-level security policy for table quote_items".

CREATE POLICY "Closers write own quote items" ON public.quote_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_items.quote_id
        AND (
          public.is_admin_or_manager(auth.uid())
          OR q.created_by = public.get_current_salesperson_id()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_items.quote_id
        AND (
          public.is_admin_or_manager(auth.uid())
          OR q.created_by = public.get_current_salesperson_id()
        )
    )
  );
