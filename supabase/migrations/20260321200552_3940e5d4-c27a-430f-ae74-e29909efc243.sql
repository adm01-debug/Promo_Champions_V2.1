
-- Fix privilege escalation: Add restrictive policies to prevent non-admin INSERT/UPDATE/DELETE
-- The existing "Admins can manage all roles" ALL policy is PERMISSIVE
-- We need to ensure non-admins cannot INSERT/UPDATE/DELETE

-- Add explicit INSERT policy that only admins can use
CREATE POLICY "Only admins can insert roles" ON user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add explicit UPDATE policy that only admins can use  
CREATE POLICY "Only admins can update roles" ON user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add explicit DELETE policy that only admins can use
CREATE POLICY "Only admins can delete roles" ON user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Also fix: Add INSERT deny for sms_verification_codes (only RPCs should insert)
DROP POLICY IF EXISTS "Allow authenticated insert SMS codes" ON sms_verification_codes;
CREATE POLICY "Deny direct INSERT - use RPCs" ON sms_verification_codes
  FOR INSERT TO authenticated
  WITH CHECK (false);
