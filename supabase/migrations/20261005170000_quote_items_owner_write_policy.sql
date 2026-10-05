-- RLS: escrita em quote_items espelha a policy do quote pai
-- (INSERT/UPDATE: dono do quote via created_by ou admin/manager;
-- DELETE: só admin/manager, como admin_delete_quotes no pai).
-- Sem isso, INSERT autenticado era negado por default-deny e o
-- seed E2E falhava com "new row violates row-level security policy".

CREATE POLICY "Closers insert own quote items" ON public.quote_items FOR INSERT
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

CREATE POLICY "Closers update own quote items" ON public.quote_items FOR UPDATE
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

CREATE POLICY "Admins delete quote items" ON public.quote_items FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));
