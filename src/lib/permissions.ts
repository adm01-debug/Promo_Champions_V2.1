import React, { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Permission = 
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'deals.view'
  | 'deals.create'
  | 'deals.edit'
  | 'deals.delete'
  | 'admin.access';

export async function hasPermission(permission: Permission): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Admin tem todas as permissões
  if (user.user_metadata?.role === 'admin') return true;

  // Por ora, retornar true para permissões básicas
  // Em produção, verificar na tabela de permissões
  return true;
}

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    hasPermission(permission).then(setHasAccess);
  }, [permission]);

  return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
}
