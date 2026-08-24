-- Drop permissive policies for commercial_approval_requests
DROP POLICY IF EXISTS "Gerenciar solicitações" ON public.commercial_approval_requests;

-- Create secure policies for commercial_approval_requests
CREATE POLICY "Only admins and managers can update approval requests"
ON public.commercial_approval_requests
FOR UPDATE
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can view their own approval requests"
ON public.commercial_approval_requests
FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can create approval requests"
ON public.commercial_approval_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);
