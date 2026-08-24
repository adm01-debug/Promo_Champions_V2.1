
-- Fix realtime.messages policy to be more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;

-- Create a scoped policy - users can only access realtime if authenticated
CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix password_reset_requests SELECT policy to require authenticated user
DROP POLICY IF EXISTS "Users can view their own reset requests" ON public.password_reset_requests;

CREATE POLICY "Users can view their own reset requests"
ON public.password_reset_requests
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND user_email = get_current_user_email());
