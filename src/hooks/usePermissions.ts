import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CONFIG_QUERY_OPTIONS } from '@/config/queryOptions';
import rolePermissionsConfig from '@/config/role-permissions.json';

type Permission = string;
type Role = 'admin' | 'manager' | 'salesperson';

interface UserPermissions {
  role: Role | null;
  permissions: Permission[];
}

// Fonte única: src/config/role-permissions.json (espelhada no banco pela
// migration role_permissions_frontend_sync; drift é travado por teste).
const ROLE_PERMISSIONS = rolePermissionsConfig.roles as Record<Role, Permission[]>;

export const usePermissions = () => {
  const { data: permissions, isLoading } = useQuery<UserPermissions>({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role')
        .limit(1)
        .maybeSingle();

      // Fail-closed: users with no assigned role get zero permissions.
      // Never default to 'salesperson' — that silently grants access to users
      // whose role has not been provisioned yet.
      if (!roleData?.role) {
        return { role: null, permissions: [] };
      }

      const role = roleData.role as Role;
      const perms = ROLE_PERMISSIONS[role] ?? [];

      return { role, permissions: perms };
    },
    ...CONFIG_QUERY_OPTIONS,
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
    role: permissions?.role ?? null,
    permissions: permissions?.permissions ?? [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    isAdmin: permissions?.role === 'admin',
    isManager: permissions?.role === 'manager',
  };
};
