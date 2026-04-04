-- Fix password_reset_requests: remove public-role policies and keep only authenticated ones

-- Drop the duplicate/insecure public-role SELECT policy
DROP POLICY IF EXISTS "Users can view own requests" ON public.password_reset_requests;

-- Drop the public-role admin policy and recreate with authenticated role
DROP POLICY IF EXISTS "Admins can manage password_reset_requests" ON public.password_reset_requests;

CREATE POLICY "Admins can manage password_reset_requests"
ON public.password_reset_requests
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
