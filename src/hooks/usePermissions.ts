import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Permission {
  permission_name: string;
  resource: string;
  action: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
}

export function usePermissions() {
  const { user } = useAuth();

  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc("get_user_permissions");
      
      if (error) {
        console.error("Error fetching permissions:", error);
        return [];
      }
      
      return data as Permission[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions) return false;
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  const hasAnyPermission = (checks: PermissionCheck[]): boolean => {
    if (!permissions) return false;
    return checks.some((check) => hasPermission(check.resource, check.action));
  };

  const hasAllPermissions = (checks: PermissionCheck[]): boolean => {
    if (!permissions) return false;
    return checks.every((check) => hasPermission(check.resource, check.action));
  };

  const canView = (resource: string): boolean => hasPermission(resource, "view");
  const canCreate = (resource: string): boolean => hasPermission(resource, "create");
  const canUpdate = (resource: string): boolean => hasPermission(resource, "update");
  const canDelete = (resource: string): boolean => hasPermission(resource, "delete");
  const canManage = (resource: string): boolean => hasPermission(resource, "manage");

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
  };
}

// Standalone hook for checking a single permission
export function useHasPermission(resource: string, action: string): boolean {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) return false;
  return hasPermission(resource, action);
}
