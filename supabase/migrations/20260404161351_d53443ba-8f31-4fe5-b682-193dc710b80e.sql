
-- Fix: Realtime messages RLS - restrict channel subscriptions
-- Note: realtime.messages may not exist as a regular table, so we handle this gracefully
DO $$
BEGIN
  -- Add NULL safety to quotes policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Salespeople can view own quotes') THEN
    DROP POLICY "Salespeople can view own quotes" ON public.quotes;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Admins and managers can view all quotes') THEN
    DROP POLICY "Admins and managers can view all quotes" ON public.quotes;
  END IF;
END $$;

-- Recreate quotes policies with NULL safety
CREATE POLICY "Salespeople can view own quotes" ON public.quotes
  FOR SELECT TO authenticated
  USING (
    get_current_salesperson_id() IS NOT NULL 
    AND created_by IS NOT NULL 
    AND created_by = get_current_salesperson_id()
  );

CREATE POLICY "Admins and managers can view all quotes" ON public.quotes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  );

-- Fix: document_signers NULL safety
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_signers' AND policyname = 'Users can view signers of their documents') THEN
    DROP POLICY "Users can view signers of their documents" ON public.document_signers;
  END IF;
END $$;

CREATE POLICY "Users can view signers of their documents" ON public.document_signers
  FOR SELECT TO authenticated
  USING (
    (
      get_current_salesperson_id() IS NOT NULL 
      AND document_id IN (
        SELECT id FROM public.digital_signatures 
        WHERE created_by IS NOT NULL AND created_by = get_current_salesperson_id()
      )
    )
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  );

-- Fix: Add SELECT policy for quote_sync_logs for admins
CREATE POLICY "Admins can view quote sync logs" ON public.quote_sync_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix: Remove direct UPDATE policy on user_mfa_settings (should go through RPC only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_mfa_settings' AND policyname = 'Users can update own MFA settings') THEN
    DROP POLICY "Users can update own MFA settings" ON public.user_mfa_settings;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_mfa_settings' AND policyname = 'Users can update their own MFA settings') THEN
    DROP POLICY "Users can update their own MFA settings" ON public.user_mfa_settings;
  END IF;
END $$;
