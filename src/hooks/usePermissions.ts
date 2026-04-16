import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CONFIG_QUERY_OPTIONS } from '@/config/queryOptions';

type Permission = string;
type Role = 'admin' | 'manager' | 'salesperson';

interface UserPermissions {
  role: Role;
  permissions: Permission[];
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['*'],
  manager: [
    'deals:read', 'deals:write', 'deals:delete',
    'clients:read', 'clients:write', 'clients:delete',
    'activities:read', 'activities:write',
    'users:read', 'reports:read',
  ],
  salesperson: [
    'deals:read', 'deals:write',
    'clients:read', 'clients:write',
    'activities:read', 'activities:write',
  ],
};

export const usePermissions = () => {
  const { data: permissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role')
        .limit(1)
        .maybeSingle();

      const role = (roleData?.role || 'salesperson') as Role;
      const perms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesperson;

      return {
        role,
        permissions: perms,
      };
    },
  });

  const hasPermission = (permission: Permission): boolean => {
    if (!permissions) return false;
    if (permissions.permissions.includes('*')) return true;
    return permissions.permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(hasPermission);
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(hasPermission);
  };

  const canAccess = (resource: string, action: 'read' | 'write' | 'delete'): boolean => {
    return hasPermission(`${resource}:${action}`);
  };

  return {
    role: permissions?.role,
    permissions: permissions?.permissions || [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAdmin: permissions?.role === 'admin',
    isManager: permissions?.role === 'manager',
  };
};

export const useCanAccess = (resource: string, action: 'read' | 'write' | 'delete') => {
  const { canAccess, isLoading } = usePermissions();
  return { canAccess: canAccess(resource, action), isLoading };
};

export const useHasPermission = (permission: Permission) => {
  const { hasPermission, isLoading } = usePermissions();
  return { hasPermission: hasPermission(permission), isLoading };
};
