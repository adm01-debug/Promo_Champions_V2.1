// Permissions & RBAC System
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

export type Role = 'admin' | 'manager' | 'sales' | 'viewer';
export type Permission = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type Resource = 'clients' | 'deals' | 'products' | 'team' | 'reports' | 'settings';

interface UserPermissions {
  role: Role;
  permissions: Record<Resource, Permission[]>;
}

const ROLE_PERMISSIONS: Record<Role, Record<Resource, Permission[]>> = {
  admin: {
    clients: ['read', 'create', 'update', 'delete', 'manage'],
    deals: ['read', 'create', 'update', 'delete', 'manage'],
    products: ['read', 'create', 'update', 'delete', 'manage'],
    team: ['read', 'create', 'update', 'delete', 'manage'],
    reports: ['read', 'create', 'update', 'delete', 'manage'],
    settings: ['read', 'create', 'update', 'delete', 'manage'],
  },
  manager: {
    clients: ['read', 'create', 'update', 'delete'],
    deals: ['read', 'create', 'update', 'delete'],
    products: ['read', 'create', 'update'],
    team: ['read', 'update'],
    reports: ['read', 'create'],
    settings: ['read'],
  },
  sales: {
    clients: ['read', 'create', 'update'],
    deals: ['read', 'create', 'update'],
    products: ['read'],
    team: ['read'],
    reports: ['read'],
    settings: ['read'],
  },
  viewer: {
    clients: ['read'],
    deals: ['read'],
    products: ['read'],
    team: ['read'],
    reports: ['read'],
    settings: [],
  },
};

export const usePermissions = () => {
  const { user } = useUser();
  
  const { data: userRole } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) return 'viewer' as Role;
      return (data.role as Role) || 'viewer';
    },
    enabled: !!user?.id,
  });
  
  const role = userRole || 'viewer';
  const permissions = ROLE_PERMISSIONS[role];
  
  const can = (permission: Permission, resource: Resource): boolean => {
    return permissions[resource]?.includes(permission) || false;
  };
  
  const hasRole = (requiredRole: Role): boolean => {
    const roleHierarchy: Role[] = ['viewer', 'sales', 'manager', 'admin'];
    const userRoleIndex = roleHierarchy.indexOf(role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    return userRoleIndex >= requiredRoleIndex;
  };
  
  const canAccess = (resource: Resource): boolean => {
    return permissions[resource]?.length > 0;
  };
  
  return {
    role,
    permissions,
    can,
    hasRole,
    canAccess,
  };
};

// HOC for permission-gated components
export const withPermission = (
  Component: React.ComponentType,
  permission: Permission,
  resource: Resource,
  Fallback?: React.ComponentType
) => {
  return (props: any) => {
    const { can } = usePermissions();
    
    if (!can(permission, resource)) {
      return Fallback ? <Fallback {...props} /> : null;
    }
    
    return <Component {...props} />;
  };
};
