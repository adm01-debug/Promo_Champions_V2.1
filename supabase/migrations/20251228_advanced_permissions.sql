-- ============================================================================
-- PERMISSIONS SYSTEM - RBAC COMPLETO
-- supabase/migrations/YYYYMMDD_advanced_permissions.sql
-- ============================================================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  role_id UUID REFERENCES roles ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Permissions cache
CREATE TABLE IF NOT EXISTS user_permissions_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  permissions JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador do sistema', '{
  "clients": ["create", "read", "update", "delete"],
  "deals": ["create", "read", "update", "delete", "approve"],
  "products": ["create", "read", "update", "delete"],
  "teams": ["create", "read", "update", "delete"],
  "settings": ["read", "update"],
  "reports": ["read", "export"],
  "audit": ["read"]
}'::jsonb),
('manager', 'Gerente de vendas', '{
  "clients": ["create", "read", "update"],
  "deals": ["create", "read", "update", "approve"],
  "products": ["read"],
  "teams": ["read", "update"],
  "reports": ["read", "export"]
}'::jsonb),
('seller', 'Vendedor', '{
  "clients": ["create", "read", "update"],
  "deals": ["create", "read", "update"],
  "products": ["read"],
  "reports": ["read"]
}'::jsonb);

-- Function: Check permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_resource TEXT,
  p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  -- Get from cache
  SELECT permissions INTO v_permissions
  FROM user_permissions_cache
  WHERE user_id = p_user_id;

  IF v_permissions IS NULL THEN
    -- Build cache
    SELECT jsonb_object_agg(
      key, value
    ) INTO v_permissions
    FROM (
      SELECT DISTINCT key, value
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      CROSS JOIN LATERAL jsonb_each(r.permissions)
      WHERE ur.user_id = p_user_id
    ) perms;

    -- Cache it
    INSERT INTO user_permissions_cache (user_id, permissions)
    VALUES (p_user_id, COALESCE(v_permissions, '{}'::jsonb))
    ON CONFLICT (user_id) 
    DO UPDATE SET permissions = EXCLUDED.permissions;
  END IF;

  RETURN v_permissions ? p_resource 
    AND v_permissions->p_resource ? p_action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies com permissões

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read clients if has permission"
  ON clients FOR SELECT
  USING (has_permission(auth.uid(), 'clients', 'read'));

CREATE POLICY "Users can create clients if has permission"
  ON clients FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'clients', 'create'));

CREATE POLICY "Users can update clients if has permission"
  ON clients FOR UPDATE
  USING (has_permission(auth.uid(), 'clients', 'update'));

CREATE POLICY "Users can delete clients if has permission"
  ON clients FOR DELETE
  USING (has_permission(auth.uid(), 'clients', 'delete'));

-- Deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read deals if has permission"
  ON deals FOR SELECT
  USING (
    has_permission(auth.uid(), 'deals', 'read')
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Users can create deals if has permission"
  ON deals FOR INSERT
  WITH CHECK (has_permission(auth.uid(), 'deals', 'create'));

CREATE POLICY "Users can update deals if has permission"
  ON deals FOR UPDATE
  USING (
    has_permission(auth.uid(), 'deals', 'update')
    OR assigned_to = auth.uid()
  );

-- TypeScript Hook
/*
// src/hooks/usePermissions.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data } = await supabase
        .from('user_permissions_cache')
        .select('permissions')
        .eq('user_id', user?.id)
        .single();

      return data?.permissions || {};
    },
    staleTime: Infinity,
  });
};

export const useHasPermission = () => {
  const { data: permissions } = usePermissions();

  return (resource: string, action: string) => {
    return permissions?.[resource]?.includes(action) || false;
  };
};

// Usage
const Component = () => {
  const hasPermission = useHasPermission();

  if (!hasPermission('deals', 'create')) {
    return <NoPermission />;
  }

  return <CreateDealButton />;
};
*/
