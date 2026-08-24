
-- Create a SECURITY DEFINER function for public salesperson listings
-- This bypasses RLS safely, returning only non-sensitive fields
CREATE OR REPLACE FUNCTION public.get_active_salespeople()
RETURNS TABLE(id uuid, name text, avatar_url text, role text, is_active boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.avatar_url, s.role, s.is_active
  FROM salespeople s
  WHERE s.is_active = true
  ORDER BY s.name
$$;
